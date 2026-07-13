package org.example.portfolife_backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ReactionRequest(
        @NotBlank(message = "Loại reaction không được để trống")
        String reactionType
) {
}
