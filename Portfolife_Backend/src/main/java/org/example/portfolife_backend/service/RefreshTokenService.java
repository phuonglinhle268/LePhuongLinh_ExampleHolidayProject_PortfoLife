package org.example.portfolife_backend.service;

import org.example.portfolife_backend.model.entity.RefreshToken;
import org.example.portfolife_backend.model.entity.User;
import org.example.portfolife_backend.exception.InvalidRefreshTokenException;
import org.example.portfolife_backend.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;

/**
 * Quản lý vòng đời refresh token. Refresh token là 1 chuỗi ngẫu nhiên 64 byte
 * (Base64 URL-safe), KHÔNG phải JWT - xem giải thích chi tiết trong Javadoc
 * của entity RefreshToken.
 */
@Service
public class RefreshTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int TOKEN_BYTE_LENGTH = 64;

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Transactional
    public String createRefreshToken(User user) {
        String tokenValue = generateOpaqueToken();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(tokenValue);
        refreshToken.setExpiresAt(LocalDateTime.now().plus(refreshExpirationMs, ChronoUnit.MILLIS));
        refreshToken.setRevoked(false);

        refreshTokenRepository.save(refreshToken);
        return tokenValue;
    }

    /**
     * Validate refresh token: phải tồn tại trong DB, chưa bị revoke, và chưa hết hạn.
     * Ném InvalidRefreshTokenException nếu bất kỳ điều kiện nào không thỏa -
     * buộc client phải điều hướng người dùng về màn hình login.
     */
    public RefreshToken validateAndGet(String tokenValue) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenAndRevokedFalse(tokenValue)
                .orElseThrow(() -> new InvalidRefreshTokenException(
                        "Refresh token không hợp lệ hoặc đã bị thu hồi, vui lòng đăng nhập lại"));

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidRefreshTokenException("Refresh token đã hết hạn, vui lòng đăng nhập lại");
        }

        return refreshToken;
    }

    @Transactional
    public void revokeToken(String tokenValue) {
        refreshTokenRepository.findByTokenAndRevokedFalse(tokenValue)
                .ifPresent(rt -> {
                    rt.setRevoked(true);
                    refreshTokenRepository.save(rt);
                });
    }

    /**
     * Thu hồi TOÀN BỘ refresh token còn hiệu lực của 1 user - gọi khi đổi mật
     * khẩu (qua quên mật khẩu) hoặc khi Admin khóa tài khoản, để đảm bảo
     * không ai còn dùng được refresh token cũ để lấy access token mới.
     */
    @Transactional
    public void revokeAllForUser(Long userId) {
        List<RefreshToken> tokens = refreshTokenRepository.findAllByUser_IdAndRevokedFalse(userId);
        tokens.forEach(t -> t.setRevoked(true));
        refreshTokenRepository.saveAll(tokens);
    }

    private String generateOpaqueToken() {
        byte[] bytes = new byte[TOKEN_BYTE_LENGTH];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}