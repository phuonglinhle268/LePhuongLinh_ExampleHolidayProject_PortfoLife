package org.example.portfolife_backend.model.enums;

/**
 * Map với admin_action_logs.target_type. Quan hệ đa hình - target_id chỉ là
 * Long thường, không dùng @ManyToOne.
 */
public enum AdminTargetType {
    USER,
    POST,
    COMMENT,
    REPORT
}
