package com.taskapp.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class TaskDTO {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Due date is required")
    private LocalDateTime dueDate;

    private String status;
    private String priority;
    private Long assignedToId;
    private Long createdById;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private Set<LabelDTO> labels;
}