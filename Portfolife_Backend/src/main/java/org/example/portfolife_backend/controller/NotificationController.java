package org.example.portfolife_backend.controller;

import org.example.portfolife_backend.dto.response.ApiResponse;
import org.example.portfolife_backend.model.entity.Notification;
import org.example.portfolife_backend.security.CustomUserDetails;
import org.example.portfolife_backend.service.NotificationService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ApiResponse<List<Notification>> getNotifications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Notification> list = notificationService.getNotificationsForUser(userDetails.getUser().getId());
        return ApiResponse.success("Lấy danh sách thông báo thành công", list);
    }

    @PutMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        notificationService.markAsRead(id, userDetails.getUser().getId());
        return ApiResponse.success("Đã đánh dấu đã đọc", null);
    }

    @PutMapping("/read-all")
    public ApiResponse<Void> markAllAsRead(@AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.markAllAsRead(userDetails.getUser().getId());
        return ApiResponse.success("Đã đánh dấu đã đọc tất cả", null);
    }
}
