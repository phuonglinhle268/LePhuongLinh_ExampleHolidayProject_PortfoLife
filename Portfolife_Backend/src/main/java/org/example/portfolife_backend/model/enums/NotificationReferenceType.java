package org.example.portfolife_backend.model.enums;
/**
 * Map với notifications.reference_type - đối tượng mà reference_id trỏ tới.
 * Đây là quan hệ đa hình (polymorphic), KHÔNG phải FK thật trong DB,
 * nên reference_id chỉ là Long thường, không dùng @ManyToOne.
 */
public enum NotificationReferenceType {
    POST,
    COMMENT,
    USER,
    FRIEND_REQUEST,
    SYSTEM
}
