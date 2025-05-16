package com.taskapp.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskHistoryDTO {
    private Long id;
    private Long taskId;
    private Long modifiedById;
    private String modifierName;
    private String field;
    private String oldValue;
    private String newValue;
    private LocalDateTime modifiedAt;
}