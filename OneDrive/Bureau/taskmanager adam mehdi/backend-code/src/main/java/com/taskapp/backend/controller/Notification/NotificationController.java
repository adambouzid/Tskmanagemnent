package com.taskapp.backend.controller.Notification;

import com.taskapp.backend.dto.NotificationDTO;
import com.taskapp.backend.services.Notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getNotificationsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<NotificationDTO> notifications = notificationService.getNotificationsByUser(userId, page, size);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<?> getUnreadNotificationsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<NotificationDTO> notifications = notificationService.getUnreadNotificationsByUser(userId, page, size);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}/count-unread")
    public ResponseEntity<?> countUnreadNotifications(@PathVariable Long userId) {
        long count = notificationService.countUnreadNotifications(userId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNotification(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getNotificationById(id));
    }

    @PutMapping("/{id}/mark-read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }
}