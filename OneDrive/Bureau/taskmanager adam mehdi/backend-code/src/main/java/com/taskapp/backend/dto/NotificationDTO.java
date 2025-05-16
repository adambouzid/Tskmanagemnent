package com.taskapp.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDTO {
    private Long id;
    private String message;
    private boolean isRead;
    private Long userId;
    private Long taskId;
    private String taskTitle;
    private LocalDateTime createdAt;
}