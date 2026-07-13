package org.example.portfolife_backend.dto.request;


import jakarta.validation.constraints.NotBlank;

/**
 * Request body cho POST /api/v1/auth/login (UC-01).
 * `identifier` chấp nhận username, email, HOẶC số điện thoại - CustomUserDetailsService
 * sẽ tự tra cứu theo cả 3 trường trong 1 query duy nhất.
 *
 * LƯU Ý BẢO MẬT: endpoint login CHỈ nhận identifier + password ở đây, không
 * đọc bất kỳ token nào từ request. Vì vậy không thể dùng access token hết hạn
 * hay refresh token để "đăng nhập" thay vì nhập mật khẩu thật.
 */
public record LoginRequest(

        @NotBlank(message = "Vui lòng nhập username, email hoặc số điện thoại")
        String identifier,

        @NotBlank(message = "Mật khẩu không được để trống")
        String password
) {
}
