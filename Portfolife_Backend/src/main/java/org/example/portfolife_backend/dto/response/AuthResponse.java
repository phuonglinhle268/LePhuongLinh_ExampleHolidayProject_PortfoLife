package org.example.portfolife_backend.dto.response;

/**
 * Response trả về sau khi login thành công.
 * accessToken: JWT, hết hạn theo app.jwt.expiration-ms (mặc định 24h) - dùng
 *   cho header Authorization: Bearer <accessToken> khi gọi API.
 * refreshToken: chuỗi ngẫu nhiên (KHÔNG phải JWT), hết hạn theo
 *   app.jwt.refresh-expiration-ms (mặc định 7 ngày) - CHỈ dùng để gọi
 *   POST /api/v1/auth/refresh-token khi accessToken hết hạn, không dùng
 *   được cho việc gì khác.
 */
public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        Long userId,
        String username,
        String role
) {
    public AuthResponse(String accessToken, String refreshToken, Long userId, String username, String role) {
        this(accessToken, refreshToken, "Bearer", userId, username, role);
    }
}

