package com.taskapp.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LabelDTO {
    private Long id;
    
    @NotBlank(message = "Le nom de l'étiquette est obligatoire")
    private String name;
    
    private String color;
}