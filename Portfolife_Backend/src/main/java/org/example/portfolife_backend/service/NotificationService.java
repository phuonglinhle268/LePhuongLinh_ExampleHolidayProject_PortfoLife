package org.example.portfolife_backend.service;

import org.example.portfolife_backend.model.entity.Notification;
import org.example.portfolife_backend.model.entity.User;
import org.example.portfolife_backend.model.enums.NotificationReferenceType;
import org.example.portfolife_backend.model.enums.NotificationType;
import org.example.portfolife_backend.repository.NotificationRepository;
import org.example.portfolife_backend.security.NotificationWebSocketHandler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationWebSocketHandler webSocketHandler;

    public NotificationService(NotificationRepository notificationRepository,
                               NotificationWebSocketHandler webSocketHandler) {
        this.notificationRepository = notificationRepository;
        this.webSocketHandler = webSocketHandler;
    }

    /**
     * Tạo thông báo mới, lưu vào cơ sở dữ liệu và đẩy qua WebSocket nếu người dùng trực tuyến.
     */
    @Transactional
    public Notification createNotification(User receiver, User sender, NotificationType type, String content,
                                           NotificationReferenceType refType, Long refId) {
        Notification notification = new Notification();
        notification.setReceiver(receiver);
        notification.setSender(sender);
        notification.setType(type);
        notification.setContent(content);
        notification.setReferenceType(refType);
        notification.setReferenceId(refId);
        notification.setRead(false);

        Notification saved = notificationRepository.save(notification);

        // Chuẩn bị payload JSON gửi qua WebSocket
        String payload = String.format(
                "{\"id\":%d,\"type\":\"%s\",\"content\":\"%s\",\"senderName\":\"%s\",\"referenceType\":\"%s\",\"referenceId\":%s,\"createdAt\":\"%s\"}",
                saved.getId(),
                type.name(),
                content.replace("\"", "\\\""),
                sender != null ? sender.getUsername() : "System",
                refType != null ? refType.name() : "null",
                refId != null ? refId.toString() : "null",
                saved.getCreatedAt().toString()
        );

        webSocketHandler.sendNotification(receiver.getId(), payload);
        return saved;
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByReceiverIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));
        if (!notification.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền thực hiện hành động này");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByReceiverIdAndReadOrderByCreatedAtDesc(userId, false);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}
