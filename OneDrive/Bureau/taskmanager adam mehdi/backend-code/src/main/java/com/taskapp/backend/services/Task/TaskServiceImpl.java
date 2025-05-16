package com.taskapp.backend.services.Task;

import com.taskapp.backend.entities.Label;
import com.taskapp.backend.entities.Task;
import com.taskapp.backend.entities.TaskHistory;
import com.taskapp.backend.entities.User;
import com.taskapp.backend.repositories.LabelRepository;
import com.taskapp.backend.repositories.TaskRepository;
import com.taskapp.backend.repositories.TaskHistoryRepository;
import com.taskapp.backend.repositories.UserRepository;
import com.taskapp.backend.dto.LabelDTO;
import com.taskapp.backend.dto.TaskDTO;
import com.taskapp.backend.dto.TaskHistoryDTO;
import com.taskapp.backend.exceptions.ResourceNotFoundException;
import com.taskapp.backend.services.Notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskHistoryRepository taskHistoryRepository;
    private final LabelRepository labelRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public TaskDTO createTask(TaskDTO taskDTO) {
        Task task = new Task();
        updateTaskFromDTO(task, taskDTO);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        Task savedTask = taskRepository.save(task);
        // Notifier l'employé assigné si présent
        if (savedTask.getAssignedTo() != null) {
            notificationService.createTaskAssignmentNotification(savedTask.getId(), savedTask.getAssignedTo().getId());
        }
        return convertToDTO(savedTask);
    }

    @Override
    @Transactional
    public TaskDTO updateTask(Long id, TaskDTO taskDTO) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Long userId = null;
        try {
            userId = ((com.taskapp.backend.entities.User) auth.getPrincipal()).getId();
        } catch (Exception e) { /* ignore */ }
        // Si employé, il ne peut modifier que le statut de ses tâches, et uniquement vers TERMINÉ
        if (!isAdmin) {
            if (task.getAssignedTo() == null || userId == null || task.getAssignedTo().getId() != userId) {
                throw new org.springframework.security.access.AccessDeniedException("You are not allowed to modify this task");
            }
            if (taskDTO.getStatus() == null || !taskDTO.getStatus().equals("TERMINÉ")) {
                throw new org.springframework.security.access.AccessDeniedException("You can only mark your task as TERMINÉ");
            }
            // Seul le statut peut être modifié
            task.setStatus("TERMINÉ");
            task.setUpdatedAt(LocalDateTime.now());
            Task savedTask = taskRepository.save(task);
            // Notifier tous les admins que la tâche a été terminée
            List<User> admins = userRepository.findByUserRole(com.taskapp.backend.enums.UserRole.ADMIN);
            for (User admin : admins) {
                notificationService.createNotification("L'employé a terminé la tâche: " + task.getTitle(), admin.getId(), task.getId());
            }
            return convertToDTO(savedTask);
        }
        // ADMIN : comportement normal
        // Sauvegarder l'état avant modification pour l'historique
        saveTaskHistory(task, taskDTO);
        // Vérifier si l'assignation a changé pour envoyer une notification
        Long oldAssignedId = task.getAssignedTo() != null ? task.getAssignedTo().getId() : null;
        Long newAssignedId = taskDTO.getAssignedToId();
        boolean assignmentChanged = (oldAssignedId == null && newAssignedId != null) ||
                (oldAssignedId != null && !oldAssignedId.equals(newAssignedId));
        updateTaskFromDTO(task, taskDTO);
        task.setUpdatedAt(LocalDateTime.now());
        Task savedTask = taskRepository.save(task);
        // Envoyer une notification si l'assignation a changé
        if (assignmentChanged && newAssignedId != null) {
            notificationService.createTaskAssignmentNotification(savedTask.getId(), newAssignedId);
        }
        return convertToDTO(savedTask);
    }
    @Override
    @Transactional
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        taskRepository.delete(task);
    }

    @Override
    public TaskDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Long userId = null;
        try {
            userId = ((com.taskapp.backend.entities.User) auth.getPrincipal()).getId();
        } catch (Exception e) { /* ignore */ }
        if (!isAdmin && (task.getAssignedTo() == null || userId == null || task.getAssignedTo().getId() != userId)) {
            throw new org.springframework.security.access.AccessDeniedException("You are not allowed to access this task");
        }
        return convertToDTO(task);
    }

    @Override
    public Page<TaskDTO> getAllTasks(int page, int size) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Long userId = null;
        try {
            userId = ((com.taskapp.backend.entities.User) auth.getPrincipal()).getId();
        } catch (Exception e) { /* ignore */ }
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Task> taskPage;
        if (isAdmin) {
            taskPage = taskRepository.findAll(pageRequest);
        } else {
            taskPage = taskRepository.findByAssignedToId(userId, pageRequest);
        }
        return taskPage.map(this::convertToDTO);
    }

    @Override
    public Page<TaskDTO> getTasksByUser(Long userId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Task> taskPage = taskRepository.findByAssignedToId(userId, pageRequest);
        return taskPage.map(this::convertToDTO);
    }

    private void updateTaskFromDTO(Task task, TaskDTO taskDTO) {
        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setDueDate(taskDTO.getDueDate());
        task.setStatus(taskDTO.getStatus());
        task.setPriority(taskDTO.getPriority());

        if (taskDTO.getAssignedToId() != null) {
            Long assignedToId = taskDTO.getAssignedToId();
            userRepository.findById(assignedToId).orElseThrow(() ->
                    new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Assigned user does not exist"));
            task.setAssignedTo(userRepository.findById(assignedToId).get());
        } else {
            task.setAssignedTo(null);
        }
    }

    private TaskDTO convertToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setDueDate(task.getDueDate());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setAssignedToId(task.getAssignedTo() != null ? task.getAssignedTo().getId() : null);
        dto.setCreatedById(task.getCreatedBy() != null ? task.getCreatedBy().getId() : null);
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());

        // Convertir les étiquettes en DTO si elles existent
        if (task.getLabels() != null && !task.getLabels().isEmpty()) {
            Set<LabelDTO> labelDTOs = task.getLabels().stream()
                    .map(this::convertLabelToDTO)
                    .collect(Collectors.toSet());
            dto.setLabels(labelDTOs);
        }

        return dto;
    }

    private LabelDTO convertLabelToDTO(Label label) {
        LabelDTO dto = new LabelDTO();
        dto.setId(label.getId());
        dto.setName(label.getName());
        dto.setColor(label.getColor());
        return dto;
    }

    private void saveTaskHistory(Task task, TaskDTO taskDTO) {
        User currentUser = null; // Dans un cas réel, récupérer l'utilisateur actuel depuis le contexte de sécurité

        // Vérifier les changements de titre
        if (!task.getTitle().equals(taskDTO.getTitle())) {
            createHistoryEntry(task, currentUser, "title", task.getTitle(), taskDTO.getTitle());
            if (task.getAssignedTo() != null) {
                notificationService.createTaskUpdateNotification(task.getId(), "title", task.getTitle(), taskDTO.getTitle());
            }
        }

        // Vérifier les changements de description
        if (!task.getDescription().equals(taskDTO.getDescription())) {
            createHistoryEntry(task, currentUser, "description", task.getDescription(), taskDTO.getDescription());
            if (task.getAssignedTo() != null) {
                notificationService.createTaskUpdateNotification(task.getId(), "description", task.getDescription(), taskDTO.getDescription());
            }
        }

        // Vérifier les changements de statut
        if (!task.getStatus().equals(taskDTO.getStatus())) {
            createHistoryEntry(task, currentUser, "status", task.getStatus(), taskDTO.getStatus());
            if (task.getAssignedTo() != null) {
                notificationService.createTaskUpdateNotification(task.getId(), "status", task.getStatus(), taskDTO.getStatus());
            }
        }

        // Vérifier les changements de priorité
        if (!task.getPriority().equals(taskDTO.getPriority())) {
            createHistoryEntry(task, currentUser, "priority", task.getPriority(), taskDTO.getPriority());
            if (task.getAssignedTo() != null) {
                notificationService.createTaskUpdateNotification(task.getId(), "priority", task.getPriority(), taskDTO.getPriority());
            }
        }

        // Vérifier les changements de date d'échéance
        if (!task.getDueDate().equals(taskDTO.getDueDate())) {
            createHistoryEntry(task, currentUser, "dueDate", task.getDueDate().toString(), taskDTO.getDueDate().toString());
            if (task.getAssignedTo() != null) {
                notificationService.createTaskUpdateNotification(task.getId(), "dueDate", task.getDueDate().toString(), taskDTO.getDueDate().toString());
            }
        }

        // Vérifier les changements d'assignation
        Long oldAssignedId = task.getAssignedTo() != null ? task.getAssignedTo().getId() : null;
        if ((oldAssignedId == null && taskDTO.getAssignedToId() != null) ||
                (oldAssignedId != null && !oldAssignedId.equals(taskDTO.getAssignedToId()))) {
            String oldValue = oldAssignedId != null ? oldAssignedId.toString() : "non assigné";
            String newValue = taskDTO.getAssignedToId() != null ? taskDTO.getAssignedToId().toString() : "non assigné";
            createHistoryEntry(task, currentUser, "assignedTo", oldValue, newValue);
        }
    }

    private void createHistoryEntry(Task task, User modifiedBy, String field, String oldValue, String newValue) {
        TaskHistory history = new TaskHistory();
        history.setTask(task);
        history.setModifiedBy(modifiedBy);
        history.setField(field);
        history.setOldValue(oldValue);
        history.setNewValue(newValue);
        history.setModifiedAt(LocalDateTime.now());

        taskHistoryRepository.save(history);
    }

    // Méthodes pour la gestion des étiquettes
    @Transactional
    public void addLabelToTask(Long taskId, Long labelId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche non trouvée avec l'id: " + taskId));
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new ResourceNotFoundException("Étiquette non trouvée avec l'id: " + labelId));

        if (task.getLabels() == null) {
            task.setLabels(new HashSet<>());
        }

        task.getLabels().add(label);
        taskRepository.save(task);

        // Envoyer une notification
        if (task.getAssignedTo() != null) {
            notificationService.createLabelAddedNotification(taskId, labelId);
        }
    }

    @Transactional
    public void removeLabelFromTask(Long taskId, Long labelId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche non trouvée avec l'id: " + taskId));
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new ResourceNotFoundException("Étiquette non trouvée avec l'id: " + labelId));

        if (task.getLabels() != null) {
            task.getLabels().remove(label);
            taskRepository.save(task);

            // Envoyer une notification
            if (task.getAssignedTo() != null) {
                notificationService.createLabelRemovedNotification(taskId, labelId);
            }
        }
    }

    @Override
    public Page<TaskHistoryDTO> getTaskHistory(Long taskId, int page, int size) {
        // Vérifier que la tâche existe
        if (!taskRepository.existsById(taskId)) {
            throw new ResourceNotFoundException("Tâche non trouvée avec l'id: " + taskId);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<TaskHistory> historyPage = taskHistoryRepository.findByTaskIdOrderByModifiedAtDesc(taskId, pageable);

        return historyPage.map(this::convertToHistoryDTO);
    }

    private TaskHistoryDTO convertToHistoryDTO(TaskHistory history) {
        TaskHistoryDTO dto = new TaskHistoryDTO();
        dto.setId(history.getId());
        dto.setTaskId(history.getTask().getId());

        if (history.getModifiedBy() != null) {
            dto.setModifiedById(history.getModifiedBy().getId());
            dto.setModifierName(history.getModifiedBy().getFirstName() + " " + history.getModifiedBy().getLastName());
        }

        dto.setField(history.getField());
        dto.setOldValue(history.getOldValue());
        dto.setNewValue(history.getNewValue());
        dto.setModifiedAt(history.getModifiedAt());

        return dto;
    }

    @Override
    public Page<TaskDTO> searchTasks(String title, String description, String status, String priority,
                                     List<Long> labelIds, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Specification<Task> spec = Specification.where(null);

        // Filtrer par titre
        if (StringUtils.hasText(title)) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), "%" + title.toLowerCase() + "%"));
        }

        // Filtrer par description
        if (StringUtils.hasText(description)) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), "%" + description.toLowerCase() + "%"));
        }

        // Filtrer par statut
        if (StringUtils.hasText(status)) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("status"), status));
        }

        // Filtrer par priorité
        if (StringUtils.hasText(priority)) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("priority"), priority));
        }

        // Filtrer par étiquettes
        if (labelIds != null && !labelIds.isEmpty()) {
            spec = spec.and((root, query, criteriaBuilder) -> {
                query.distinct(true);
                return root.join("labels").get("id").in(labelIds);
            });
        }

        Page<Task> taskPage = taskRepository.findAll(spec, pageable);
        return taskPage.map(this::convertToDTO);
    }

    @Override
    public Map<String, List<TaskDTO>> getKanbanBoard() {
        List<Task> allTasks = taskRepository.findAll();

        // Grouper les tâches par statut
        Map<String, List<TaskDTO>> kanbanBoard = new HashMap<>();

        // Initialiser les colonnes du tableau Kanban
        kanbanBoard.put("À FAIRE", new ArrayList<>());
        kanbanBoard.put("EN COURS", new ArrayList<>());
        kanbanBoard.put("EN REVUE", new ArrayList<>());
        kanbanBoard.put("TERMINÉ", new ArrayList<>());

        // Remplir les colonnes avec les tâches correspondantes
        for (Task task : allTasks) {
            String status = task.getStatus();
            if (kanbanBoard.containsKey(status)) {
                kanbanBoard.get(status).add(convertToDTO(task));
            } else {
                // Si le statut n'est pas l'un des statuts prédéfinis, l'ajouter à une nouvelle colonne
                List<TaskDTO> taskList = new ArrayList<>();
                taskList.add(convertToDTO(task));
                kanbanBoard.put(status, taskList);
            }
        }

        return kanbanBoard;
    }

    @Override
    public Map<String, Object> getTaskAnalytics(String timeFrame) {
        Map<String, Object> analytics = new HashMap<>();
        List<Task> allTasks = taskRepository.findAll();

        // Statistiques générales
        analytics.put("totalTasks", allTasks.size());

        // Tâches par statut
        Map<String, Long> tasksByStatus = allTasks.stream()
                .collect(Collectors.groupingBy(Task::getStatus, Collectors.counting()));
        analytics.put("tasksByStatus", tasksByStatus);

        // Tâches par priorité
        Map<String, Long> tasksByPriority = allTasks.stream()
                .collect(Collectors.groupingBy(Task::getPriority, Collectors.counting()));
        analytics.put("tasksByPriority", tasksByPriority);

        // Tâches par utilisateur assigné
        Map<String, Long> tasksByUser = allTasks.stream()
                .filter(task -> task.getAssignedTo() != null)
                .collect(Collectors.groupingBy(
                        task -> task.getAssignedTo().getFirstName() + " " + task.getAssignedTo().getLastName(),
                        Collectors.counting()
                ));
        analytics.put("tasksByUser", tasksByUser);

        // Filtrer les tâches en fonction de la période spécifiée
        LocalDate startDate = null;
        if ("week".equals(timeFrame)) {
            startDate = LocalDate.now().minusWeeks(1);
        } else if ("month".equals(timeFrame)) {
            startDate = LocalDate.now().minusMonths(1);
        } else if ("quarter".equals(timeFrame)) {
            startDate = LocalDate.now().minusMonths(3);
        } else {
            // Par défaut, utiliser toutes les tâches
            startDate = LocalDate.now().minusYears(10); // Une date suffisamment ancienne
        }

        final LocalDate filterStartDate = startDate;
        List<Task> filteredTasks = allTasks.stream()
                .filter(task -> task.getCreatedAt().toLocalDate().isAfter(filterStartDate))
                .collect(Collectors.toList());

        // Tâches créées par jour/semaine/mois selon la période
        Map<String, Long> tasksByDate = new HashMap<>();
        DateTimeFormatter formatter;

        if ("week".equals(timeFrame)) {
            formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        } else if ("month".equals(timeFrame)) {
            formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        } else {
            formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        }

        filteredTasks.forEach(task -> {
            String dateKey = task.getCreatedAt().format(formatter);
            tasksByDate.merge(dateKey, 1L, Long::sum);
        });

        analytics.put("tasksByDate", tasksByDate);
        analytics.put("timeFrame", timeFrame != null ? timeFrame : "all");

        return analytics;
    }
}