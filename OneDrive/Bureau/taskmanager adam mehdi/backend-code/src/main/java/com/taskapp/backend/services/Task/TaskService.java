package com.taskapp.backend.services.Task;

import com.taskapp.backend.dto.TaskDTO;
import com.taskapp.backend.dto.TaskHistoryDTO;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

public interface TaskService {
    TaskDTO createTask(TaskDTO taskDTO);
    TaskDTO updateTask(Long id, TaskDTO taskDTO);
    void deleteTask(Long id);
    TaskDTO getTaskById(Long id);
    Page<TaskDTO> getAllTasks(int page, int size);
    Page<TaskDTO> getTasksByUser(Long userId, int page, int size);
    
    // Méthodes pour la gestion des étiquettes
    void addLabelToTask(Long taskId, Long labelId);
    void removeLabelFromTask(Long taskId, Long labelId);
    
    // Méthodes pour l'historique des tâches
    Page<TaskHistoryDTO> getTaskHistory(Long taskId, int page, int size);
    
    // Méthodes pour la recherche avancée
    Page<TaskDTO> searchTasks(String title, String description, String status, String priority, List<Long> labelIds, int page, int size);
    
    // Méthodes pour les tableaux Kanban
    Map<String, List<TaskDTO>> getKanbanBoard();
    
    // Méthodes pour les analyses et rapports
    Map<String, Object> getTaskAnalytics(String timeFrame);
}