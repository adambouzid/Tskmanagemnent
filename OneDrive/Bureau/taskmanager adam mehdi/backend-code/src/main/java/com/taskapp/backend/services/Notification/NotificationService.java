package com.taskapp.backend.services.Notification;

import com.taskapp.backend.dto.NotificationDTO;
import org.springframework.data.domain.Page;

public interface NotificationService {
    NotificationDTO createNotification(String message, Long userId, Long taskId);
    NotificationDTO markAsRead(Long id);
    void deleteNotification(Long id);
    NotificationDTO getNotificationById(Long id);
    Page<NotificationDTO> getNotificationsByUser(Long userId, int page, int size);
    Page<NotificationDTO> getUnreadNotificationsByUser(Long userId, int page, int size);
    long countUnreadNotifications(Long userId);
    void createTaskAssignmentNotification(Long taskId, Long assignedUserId);
    void createTaskUpdateNotification(Long taskId, String field, String oldValue, String newValue);
    void createLabelAddedNotification(Long taskId, Long labelId);
    void createLabelRemovedNotification(Long taskId, Long labelId);
}