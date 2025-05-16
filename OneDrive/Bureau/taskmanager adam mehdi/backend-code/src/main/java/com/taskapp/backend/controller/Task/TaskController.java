package com.taskapp.backend.controller.Task;

import com.taskapp.backend.dto.TaskDTO;
import com.taskapp.backend.dto.TaskHistoryDTO;
import com.taskapp.backend.services.Task.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> createTask(@Valid @RequestBody TaskDTO taskDTO) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        System.out.println("[DEBUG] Principal: " + auth.getPrincipal());
        System.out.println("[DEBUG] Authorities: " + auth.getAuthorities());
        return ResponseEntity.ok(taskService.createTask(taskDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @Valid @RequestBody TaskDTO taskDTO) {
        return ResponseEntity.ok(taskService.updateTask(id, taskDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> getTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(taskService.getAllTasks(page, size));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> getTasksByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(taskService.getTasksByUser(userId, page, size));
    }

    @PostMapping("/{taskId}/labels/{labelId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> addLabelToTask(
            @PathVariable Long taskId,
            @PathVariable Long labelId) {
        taskService.addLabelToTask(taskId, labelId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{taskId}/labels/{labelId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> removeLabelFromTask(
            @PathVariable Long taskId,
            @PathVariable Long labelId) {
        taskService.removeLabelFromTask(taskId, labelId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{taskId}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> getTaskHistory(
            @PathVariable Long taskId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(taskService.getTaskHistory(taskId, page, size));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> searchTasks(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) List<Long> labelIds,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(taskService.searchTasks(title, description, status, priority, labelIds, page, size));
    }

    @GetMapping("/kanban")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<?> getKanbanBoard() {
        return ResponseEntity.ok(taskService.getKanbanBoard());
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<?> getTaskAnalytics(
            @RequestParam(required = false) String timeFrame) {
        return ResponseEntity.ok(taskService.getTaskAnalytics(timeFrame));
    }
}