package org.example.portfolife_backend.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Request body cho POST /api/v1/auth/refresh-token và POST /api/v1/auth/logout.
 */
public record RefreshTokenRequest(

        @NotBlank(message = "Refresh token không được để trống")
        String refreshToken
) {
}