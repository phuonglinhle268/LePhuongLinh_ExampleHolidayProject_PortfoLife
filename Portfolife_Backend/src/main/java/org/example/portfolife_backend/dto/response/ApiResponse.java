package org.example.portfolife_backend.dto.response;

/**
 * Envelope chuẩn hóa cho mọi response trả về từ API,
 * đồng bộ với format { "status": ..., "message": ..., "data": ... }
 * đã mô tả trong SRS phần 3.4.
 */
public record ApiResponse<T>(
        String status,
        String message,
        T data
) {
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>("SUCCESS", message, data);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>("ERROR", message, null);
    }
}
