package org.example.portfolife_backend.model.enums;

/**
 * Map với reports.target_type. Quan hệ đa hình - target_id chỉ là Long thường,
 * không dùng @ManyToOne vì có thể trỏ tới Post, Comment, hoặc User tùy loại.
 */
public enum ReportTargetType {
    POST,
    COMMENT,
    USER
}