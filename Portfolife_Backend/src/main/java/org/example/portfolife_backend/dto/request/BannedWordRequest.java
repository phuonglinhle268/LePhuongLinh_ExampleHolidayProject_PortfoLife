package org.example.portfolife_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BannedWordRequest(
        @NotBlank(message = "Từ cấm không được để trống")
        @Size(max = 100, message = "Từ cấm không được vượt quá 100 ký tự")
        String word
) {
}
