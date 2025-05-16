package com.taskapp.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AttachmentDTO {
    private Long id;
    
    @NotBlank(message = "Le nom du fichier est obligatoire")
    private String fileName;
    
    private String fileType;
    private Long fileSize;
    
    @NotNull(message = "L'ID de la tâche est obligatoire")
    private Long taskId;
    
    private Long uploadedById;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
}