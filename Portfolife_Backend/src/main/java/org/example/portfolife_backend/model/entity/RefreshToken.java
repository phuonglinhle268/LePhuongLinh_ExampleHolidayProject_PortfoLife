package org.example.portfolife_backend.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Map với bảng `refresh_tokens`.
 *
 * QUAN TRỌNG: Refresh token ở đây là 1 chuỗi ngẫu nhiên (opaque token, xem
 * RefreshTokenService.generateOpaqueToken()) - KHÔNG phải JWT như access token.
 * Nhờ khác định dạng hoàn toàn, refresh token:
 * - Không thể dùng làm Bearer token cho các API cần xác thực
 *   (JwtAuthenticationFilter cố parse như JWT sẽ thất bại ngay lập tức).
 * - Không thể dùng để gọi /api/v1/auth/login (endpoint này chỉ nhận
 *   identifier + password, không đọc token từ request).
 * Being lưu trong DB nên có thể thu hồi (revoke) chủ động khi logout,
 * đổi mật khẩu, hoặc khóa tài khoản.
 */
@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 255)
    private String token;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean revoked = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}