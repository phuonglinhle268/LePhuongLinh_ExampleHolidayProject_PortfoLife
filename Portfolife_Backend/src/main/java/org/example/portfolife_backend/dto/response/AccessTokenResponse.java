package org.example.portfolife_backend.dto.response;

/**
 * Response cho POST /api/v1/auth/refresh-token - chỉ cấp lại accessToken mới,
 * refreshToken cũ vẫn giữ nguyên hiệu lực (không rotate) trong bản triển khai này.
 */
public record AccessTokenResponse(
        String accessToken,
        String tokenType
) {
    public AccessTokenResponse(String accessToken) {
        this(accessToken, "Bearer");
    }
}