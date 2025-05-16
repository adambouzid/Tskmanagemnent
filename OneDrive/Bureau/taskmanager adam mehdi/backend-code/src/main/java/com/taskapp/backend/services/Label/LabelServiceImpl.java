package com.taskapp.backend.services.Label;

import com.taskapp.backend.dto.LabelDTO;
import com.taskapp.backend.entities.Label;
import com.taskapp.backend.entities.Task;
import com.taskapp.backend.exceptions.ResourceNotFoundException;
import com.taskapp.backend.repositories.LabelRepository;
import com.taskapp.backend.repositories.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class LabelServiceImpl implements LabelService {

    private final LabelRepository labelRepository;
    private final TaskRepository taskRepository;

    @Override
    @Transactional
    public LabelDTO createLabel(LabelDTO labelDTO) {
        Label label = new Label();
        updateLabelFromDTO(label, labelDTO);
        return convertToDTO(labelRepository.save(label));
    }

    @Override
    @Transactional
    public LabelDTO updateLabel(Long id, LabelDTO labelDTO) {
        Label label = labelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Étiquette non trouvée avec l'id: " + id));
        updateLabelFromDTO(label, labelDTO);
        return convertToDTO(labelRepository.save(label));
    }

    @Override
    @Transactional
    public void deleteLabel(Long id) {
        Label label = labelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Étiquette non trouvée avec l'id: " + id));
        labelRepository.delete(label);
    }

    @Override
    public LabelDTO getLabelById(Long id) {
        Label label = labelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Étiquette non trouvée avec l'id: " + id));
        return convertToDTO(label);
    }

    @Override
    public Page<LabelDTO> getAllLabels(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Label> labelPage = labelRepository.findAll(pageRequest);
        return labelPage.map(this::convertToDTO);
    }

    @Override
    public List<LabelDTO> searchLabelsByName(String name) {
        return labelRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<LabelDTO> getLabelsByTaskId(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche non trouvée avec l'id: " + taskId));
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        Long userId = null;
        try {
            userId = ((com.taskapp.backend.entities.User) auth.getPrincipal()).getId();
        } catch (Exception e) { /* ignore */ }
        if (!isAdmin && (task.getAssignedTo() == null || userId == null || task.getAssignedTo().getId() != userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Vous ne pouvez consulter les labels que de vos propres tâches");
        }
        return task.getLabels().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
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
    }

    @Override
    @Transactional
    public void removeLabelFromTask(Long taskId, Long labelId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Tâche non trouvée avec l'id: " + taskId));
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new ResourceNotFoundException("Étiquette non trouvée avec l'id: " + labelId));

        if (task.getLabels() != null) {
            task.getLabels().remove(label);
            taskRepository.save(task);
        }
    }

    private void updateLabelFromDTO(Label label, LabelDTO labelDTO) {
        label.setName(labelDTO.getName());
        label.setColor(labelDTO.getColor());
    }

    private LabelDTO convertToDTO(Label label) {
        LabelDTO dto = new LabelDTO();
        dto.setId(label.getId());
        dto.setName(label.getName());
        dto.setColor(label.getColor());
        return dto;
    }
}