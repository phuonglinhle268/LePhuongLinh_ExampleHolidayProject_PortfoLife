package org.example.portfolife_backend.model.enums;

/**
 * Dùng chung cho posts.status và comments.status
 * (cả 2 bảng dùng chính xác cùng bộ giá trị ENUM trong schema).
 */
public enum ContentStatus {
    ACTIVE,
    HIDDEN,
    DELETED
}