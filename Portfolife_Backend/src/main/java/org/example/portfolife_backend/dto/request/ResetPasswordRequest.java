package org.example.portfolife_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body cho POST /api/v1/auth/reset-password.
 * Bước 2 của luồng quên mật khẩu: xác nhận OTP + đặt mật khẩu mới.
 * Việc so khớp newPassword/confirmPassword được kiểm tra ở PasswordResetService
 * (ném PasswordMismatchException nếu không khớp).
 */
public record ResetPasswordRequest(

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        String email,

        @NotBlank(message = "Mã OTP không được để trống")
        @Size(min = 6, max = 6, message = "Mã OTP gồm 6 chữ số")
        String otpCode,

        @NotBlank(message = "Mật khẩu mới không được để trống")
        @Size(min = 6, max = 100, message = "Mật khẩu phải tối thiểu 6 ký tự")
        String newPassword,

        @NotBlank(message = "Vui lòng xác nhận mật khẩu mới")
        String confirmPassword
) {
}
