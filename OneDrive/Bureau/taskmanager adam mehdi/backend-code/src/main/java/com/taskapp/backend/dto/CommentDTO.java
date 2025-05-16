package com.taskapp.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CommentDTO {
    private Long parentId;
    private List<CommentDTO> replies;

    private Long id;

    @NotBlank(message = "Le contenu est obligatoire")
    private String content;

    @NotNull(message = "L'ID de la tâche est obligatoire")
    private Long taskId;

    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
}