package org.example.portfolife_backend.service;

import org.example.portfolife_backend.dto.request.LoginRequest;
import org.example.portfolife_backend.dto.request.SignupRequest;
import org.example.portfolife_backend.dto.response.AuthResponse;
import org.example.portfolife_backend.model.entity.User;
import org.example.portfolife_backend.model.entity.UserProfile;
import org.example.portfolife_backend.model.enums.UserRole;
import org.example.portfolife_backend.model.enums.UserStatus;
import org.example.portfolife_backend.exception.DuplicateResourceException;
import org.example.portfolife_backend.repository.UserProfileRepository;
import org.example.portfolife_backend.repository.UserRepository;
import org.example.portfolife_backend.security.CustomUserDetails;
import org.example.portfolife_backend.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.example.portfolife_backend.dto.response.AccessTokenResponse;
import org.example.portfolife_backend.model.entity.RefreshToken;
import org.example.portfolife_backend.exception.InvalidRefreshTokenException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    public AuthService(UserRepository userRepository,
                       UserProfileRepository userProfileRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil,
                       RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
    }

    /**
     * UC-01 - Đăng ký.
     * Tạo User (role mặc định USER, status ACTIVE) + UserProfile tương ứng
     * (bắt buộc vì user_profiles.full_name là NOT NULL trong schema).
     */
    @Transactional
    public void signup(SignupRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateResourceException("Username đã tồn tại: " + request.username());
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email đã được sử dụng: " + request.email());
        }
        if (userRepository.existsByPhoneNumber(request.phoneNumber())) {
            throw new DuplicateResourceException("Số điện thoại đã được sử dụng: " + request.phoneNumber());
        }

        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        user.setPhoneNumber(request.phoneNumber());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.USER);
        user.setStatus(UserStatus.ACTIVE);

        User savedUser = userRepository.save(user);

        UserProfile profile = new UserProfile();
        profile.setUser(savedUser);
        profile.setFullName(request.fullName());
        userProfileRepository.save(profile);
    }

    /**
     * UC-01 - Đăng nhập.
     * Cho phép đăng nhập bằng username, email, HOẶC số điện thoại (identifier) -
     * CustomUserDetailsService xử lý tra cứu cả 3.
     * Nếu tài khoản LOCKED/DELETED, AuthenticationManager sẽ tự ném
     * LockedException/DisabledException dựa trên CustomUserDetails.isAccountNonLocked()/isEnabled().
     *
     * Trả về CẢ accessToken (JWT, ngắn hạn) VÀ refreshToken (opaque, dài hạn).
     * Endpoint này KHÔNG bao giờ đọc token từ request - chỉ xác thực bằng
     * identifier + password, nên không có cách nào dùng access token hết hạn
     * hay refresh token để bypass bước đăng nhập này.
     */
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.identifier(), request.password())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        String accessToken = jwtUtil.generateToken(user.getUsername(), user.getId(), user.getRole().name());
        String refreshToken = refreshTokenService.createRefreshToken(user);

        return new AuthResponse(accessToken, refreshToken, user.getId(), user.getUsername(), user.getRole().name());
    }

    /**
     * POST /api/v1/auth/refresh-token.
     * Cấp lại accessToken mới khi accessToken cũ hết hạn, dùng refreshToken hợp lệ
     * (chưa hết hạn, chưa bị revoke) thay vì bắt người dùng đăng nhập lại bằng
     * mật khẩu mỗi 24h.
     *
     * Vì refreshToken là chuỗi opaque (không phải JWT), nếu ai đó gửi nhầm
     * accessToken (JWT) vào đây, RefreshTokenService.validateAndGet() sẽ không
     * tìm thấy bản ghi khớp trong bảng refresh_tokens -> ném
     * InvalidRefreshTokenException ngay lập tức.
     */
    public AccessTokenResponse refreshAccessToken(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenService.validateAndGet(refreshTokenValue);
        User user = refreshToken.getUser();

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new InvalidRefreshTokenException("Tài khoản không còn hoạt động, vui lòng liên hệ quản trị viên.");
        }

        String newAccessToken = jwtUtil.generateToken(user.getUsername(), user.getId(), user.getRole().name());
        return new AccessTokenResponse(newAccessToken);
    }

    /**
     * POST /api/v1/auth/logout - thu hồi refresh token hiện tại, buộc phải
     * đăng nhập lại (đăng nhập lại bằng mật khẩu) để lấy access token mới sau đó.
     */
    public void logout(String refreshTokenValue) {
        refreshTokenService.revokeToken(refreshTokenValue);
    }
}
