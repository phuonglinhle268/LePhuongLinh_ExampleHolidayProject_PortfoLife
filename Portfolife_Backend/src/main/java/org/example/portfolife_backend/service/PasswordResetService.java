package org.example.portfolife_backend.service;

import org.example.portfolife_backend.dto.request.ForgotPasswordRequest;
import org.example.portfolife_backend.dto.request.ResetPasswordRequest;
import org.example.portfolife_backend.model.entity.PasswordResetOtp;
import org.example.portfolife_backend.model.entity.User;
import org.example.portfolife_backend.exception.InvalidOtpException;
import org.example.portfolife_backend.exception.PasswordMismatchException;
import org.example.portfolife_backend.repository.PasswordResetOtpRepository;
import org.example.portfolife_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

/**
 * UC-01 mở rộng: Quên mật khẩu qua OTP gửi email.
 *
 * Luồng:
 * 1. requestOtp()   - POST /api/v1/auth/forgot-password  (nhập email)
 * 2. resetPassword() - POST /api/v1/auth/reset-password  (nhập OTP + mật khẩu mới)
 *
 * Sau khi resetPassword() thành công, KHÔNG trả JWT mới - bắt buộc người dùng
 * phải gọi lại /api/v1/auth/login. Đồng thời user.passwordChangedAt được cập
 * nhật để JWT cũ (nếu còn hạn) cũng bị JwtAuthenticationFilter từ chối.
 */
@Service
public class PasswordResetService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int OTP_MIN = 100000;
    private static final int OTP_RANGE = 900000; // sinh số từ 100000 - 999999 (6 chữ số)

    private final UserRepository userRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.otp.expiration-minutes}")
    private int otpExpirationMinutes;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetOtpRepository otpRepository,
                                PasswordEncoder passwordEncoder,
                                MailService mailService,
                                RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailService = mailService;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public void requestOtp(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Không tìm thấy tài khoản với email: " + request.email()));

        // Vô hiệu hóa toàn bộ OTP cũ chưa dùng của user này, tránh trường hợp
        // còn nhiều mã cùng lúc hợp lệ.
        List<PasswordResetOtp> oldOtps = otpRepository.findAllByUser_IdAndUsedFalse(user.getId());
        oldOtps.forEach(otp -> otp.setUsed(true));
        otpRepository.saveAll(oldOtps);

        String otpCode = generateOtpCode();

        PasswordResetOtp otp = new PasswordResetOtp();
        otp.setUser(user);
        otp.setOtpCode(otpCode);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes));
        otp.setUsed(false);
        otpRepository.save(otp);

        mailService.sendOtpEmail(user.getEmail(), otpCode, otpExpirationMinutes);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new PasswordMismatchException("Mật khẩu xác nhận không khớp với mật khẩu mới");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Không tìm thấy tài khoản với email: " + request.email()));

        PasswordResetOtp otp = otpRepository
                .findByUser_IdAndOtpCodeAndUsedFalse(user.getId(), request.otpCode())
                .orElseThrow(() -> new InvalidOtpException("Mã OTP không hợp lệ"));

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidOtpException("Mã OTP đã hết hạn, vui lòng yêu cầu mã mới");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        userRepository.save(user);

        otp.setUsed(true);
        otpRepository.save(otp);

        // Vô hiệu hóa toàn bộ refresh token cũ - nếu không, ai đang giữ refresh
        // token cũ (VD trên thiết bị khác) vẫn có thể lấy access token mới mãi mãi
        // dù mật khẩu đã đổi.
        refreshTokenService.revokeAllForUser(user.getId());
    }

    private String generateOtpCode() {
        int code = OTP_MIN + RANDOM.nextInt(OTP_RANGE);
        return String.valueOf(code);
    }
}