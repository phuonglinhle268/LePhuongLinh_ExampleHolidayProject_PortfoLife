package org.example.portfolife_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReportRequest(
        @NotBlank(message = "Loại đối tượng báo cáo không được để trống")
        String targetType, // POST, COMMENT, USER
        
        @NotNull(message = "ID đối tượng báo cáo không được để trống")
        Long targetId,
        
        @NotBlank(message = "Lý do báo cáo không được để trống")
        String reason
) {
}
