package com.taskapp.backend.services.Notification;

import com.taskapp.backend.dto.NotificationDTO;
import com.taskapp.backend.entities.Label;
import com.taskapp.backend.entities.Notification;
import com.taskapp.backend.entities.Task;
import com.taskapp.backend.entities.User;
import com.taskapp.backend.exceptions.ResourceNotFoundException;
import com.taskapp.backend.repositories.LabelRepository;
import com.taskapp.backend.repositories.NotificationRepository;
import com.taskapp.backend.repositories.TaskRepository;
import com.taskapp.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final LabelRepository labelRepository;

    @Override
    @Transactional
    public NotificationDTO createNotification(String message, Long userId, Long taskId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé avec l'id: " + userId));
        
        Task task = null;
        if (taskId != null) {
            task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tâche non trouvée avec l'id: " + taskId));
        }
        
        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setUser(user);
        notification.setTask(task);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        
        return convertToDTO(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public NotificationDTO markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification non trouvée avec l'id: " + id));
        
        notification.setRead(true);
        return convertToDTO(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public void deleteNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification non trouvée avec l'id: " + id));
        
        notificationRepository.delete(notification);
    }

    @Override
    public NotificationDTO getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification non trouvée avec l'id: " + id));
        
        return convertToDTO(notification);
    }

    @Override
    public Page<NotificationDTO> getNotificationsByUser(Long userId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Notification> notificationPage = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageRequest);
        return notificationPage.map(this::convertToDTO);
    }

    @Override
    public Page<NotificationDTO> getUnreadNotificationsByUser(Long userId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Notification> notificationPage = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false, pageRequest);
        return notificationPage.map(this::convertToDTO);
    }

    @Override
    public long countUnreadNotifications(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    @Override
    @Transactional
    public void createTaskAssignmentNotification(Long taskId, Long assignedUserId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche non trouvée avec l'id: " + taskId));
        
        String message = "Vous avez été assigné à la tâche: " + task.getTitle();
        createNotification(message, assignedUserId, taskId);
    }

    @Override
    @Transactional
    public void createTaskUpdateNotification(Long taskId, String field, String oldValue, String newValue) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche non trouvée avec l'id: " + taskId));
        
        if (task.getAssignedTo() != null) {
            String fieldName = getFieldDisplayName(field);
            String message = "La tâche " + task.getTitle() + " a été mise à jour: " + fieldName + " a changé de '" + oldValue + "' à '" + newValue + "'";
            createNotification(message, task.getAssignedTo().getId(), taskId);
        }
    }

    @Override
    @Transactional
    public void createLabelAddedNotification(Long taskId, Long labelId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche non trouvée avec l'id: " + taskId));
        
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new ResourceNotFoundException("Étiquette non trouvée avec l'id: " + labelId));
        
        if (task.getAssignedTo() != null) {
            String message = "L'étiquette '" + label.getName() + "' a été ajoutée à la tâche: " + task.getTitle();
            createNotification(message, task.getAssignedTo().getId(), taskId);
        }
    }

    @Override
    @Transactional
    public void createLabelRemovedNotification(Long taskId, Long labelId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche non trouvée avec l'id: " + taskId));
        
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new ResourceNotFoundException("Étiquette non trouvée avec l'id: " + labelId));
        
        if (task.getAssignedTo() != null) {
            String message = "L'étiquette '" + label.getName() + "' a été retirée de la tâche: " + task.getTitle();
            createNotification(message, task.getAssignedTo().getId(), taskId);
        }
    }

    private String getFieldDisplayName(String field) {
        switch (field) {
            case "title":
                return "le titre";
            case "description":
                return "la description";
            case "status":
                return "le statut";
            case "priority":
                return "la priorité";
            case "dueDate":
                return "la date d'échéance";
            case "assignedTo":
                return "l'assignation";
            default:
                return field;
        }
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead());
        dto.setUserId(notification.getUser() != null ? notification.getUser().getId() : null);
        dto.setTaskId(notification.getTask() != null ? notification.getTask().getId() : null);
        dto.setTaskTitle(notification.getTask() != null ? notification.getTask().getTitle() : null);
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}