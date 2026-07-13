package org.example.portfolife_backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AdminActionRequest(
        @NotBlank(message = "Lý do hành động không được để trống")
        String reason
) {
}
