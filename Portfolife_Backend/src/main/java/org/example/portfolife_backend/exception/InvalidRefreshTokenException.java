package org.example.portfolife_backend.exception;

/**
 * Ném ra khi refresh token không tồn tại, đã bị thu hồi (revoked), hoặc đã hết hạn.
 * Được GlobalExceptionHandler bắt và trả về HTTP 401 - buộc client phải yêu cầu
 * người dùng đăng nhập lại bằng identifier + password, KHÔNG có cách nào khác
 * để lấy lại access token.
 */
public class InvalidRefreshTokenException extends RuntimeException {

    public InvalidRefreshTokenException(String message) {
        super(message);
    }
}
