package org.example.portfolife_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request body cho POST /api/v1/auth/forgot-password.
 * Bước 1 của luồng quên mật khẩu: người dùng nhập email, hệ thống gửi OTP.
 */
public record ForgotPasswordRequest(

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        String email
) {
}
