package org.example.portfolife_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import jakarta.validation.constraints.Pattern;

/**
 * Request body cho POST /api/v1/auth/signup (UC-01).
 */
public record SignupRequest(

        @NotBlank(message = "Username không được để trống")
        @Size(min = 3, max = 50, message = "Username phải từ 3 đến 50 ký tự")
        String username,

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        @Size(max = 100, message = "Email tối đa 100 ký tự")
        String email,

        @NotBlank(message = "Số điện thoại không được để trống")
        @Pattern(
                regexp = "^(\\+84|0)(3|5|7|8|9)[0-9]{8}$",
                message = "Số điện thoại không đúng định dạng (VD: 0912345678 hoặc +84912345678)"
        )
        String phoneNumber,

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 6, max = 100, message = "Mật khẩu phải tối thiểu 6 ký tự")
        String password,

        @NotBlank(message = "Họ tên không được để trống")
        @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
        String fullName
) {
}
