package org.example.portfolife_backend.controller;

import org.example.portfolife_backend.dto.request.LoginRequest;
import org.example.portfolife_backend.dto.request.SignupRequest;
import org.example.portfolife_backend.dto.response.ApiResponse;
import org.example.portfolife_backend.dto.response.AuthResponse;
import org.example.portfolife_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.example.portfolife_backend.dto.request.ForgotPasswordRequest;
import org.example.portfolife_backend.dto.request.ResetPasswordRequest;
import org.example.portfolife_backend.service.PasswordResetService;

import org.example.portfolife_backend.dto.request.RefreshTokenRequest;
import org.example.portfolife_backend.dto.response.AccessTokenResponse;

/**
 * UC-01: Đăng ký & Đăng nhập (JWT) + Quên mật khẩu qua OTP email.
 * Toàn bộ endpoint tại đây là public (xem SecurityConfig: "/api/v1/auth/**".permitAll()).
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> signup(@Valid @RequestBody SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully.", null));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", authResponse));
    }

    /**
     * Bước 1 quên mật khẩu: nhập email, hệ thống gửi OTP 6 số qua email
     * (hiệu lực app.otp.expiration-minutes phút, cấu hình trong application.properties).
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.requestOtp(request);
        return ResponseEntity.ok(ApiResponse.success("Mã OTP đã được gửi đến email của bạn.", null));
    }

    /**
     * Bước 2 quên mật khẩu: xác nhận OTP + đặt mật khẩu mới.
     * Không trả JWT ở đây - người dùng phải đăng nhập lại bằng mật khẩu mới.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(
                "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.", null));
    }

    /**
     * Cấp lại accessToken mới khi accessToken cũ đã hết hạn, dùng refreshToken
     * hợp lệ thay vì bắt người dùng nhập lại mật khẩu.
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AccessTokenResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        AccessTokenResponse response = authService.refreshAccessToken(request.refreshToken());
        return ResponseEntity.ok(ApiResponse.success("Cấp lại access token thành công", response));
    }

    /**
     * Thu hồi refresh token hiện tại (đăng xuất trên thiết bị này).
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.refreshToken());
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", null));
    }
}