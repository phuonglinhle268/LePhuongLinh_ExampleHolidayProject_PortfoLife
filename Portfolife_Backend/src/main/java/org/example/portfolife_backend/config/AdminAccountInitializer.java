package org.example.portfolife_backend.config;

import org.example.portfolife_backend.model.entity.User;
import org.example.portfolife_backend.model.entity.UserProfile;
import org.example.portfolife_backend.model.enums.UserRole;
import org.example.portfolife_backend.model.enums.UserStatus;
import org.example.portfolife_backend.repository.UserProfileRepository;
import org.example.portfolife_backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;


/**
 * Seed 1 tài khoản Admin cố định lúc ứng dụng khởi động, chạy 1 lần duy nhất
 * (kiểm tra tồn tại trước khi tạo, nên chạy lại nhiều lần vẫn an toàn - idempotent).
 *
 * Theo yêu cầu: KHÔNG có API đăng ký cho Admin - đây là tài khoản duy nhất,
 * lấy thông tin từ application.properties (app.admin.*), mật khẩu được mã hóa
 * bằng BCrypt giống hệt user thường trước khi lưu vào DB.
 */
@Component
public class AdminAccountInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminAccountInitializer.class);

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.phone-number}")
    private String adminPhoneNumber;

    @Value("${app.admin.password}")
    private String adminRawPassword;

    @Value("${app.admin.full-name}")
    private String adminFullName;

    public AdminAccountInitializer(UserRepository userRepository,
                                   UserProfileRepository userProfileRepository,
                                   PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByUsername(adminUsername)) {
            log.info("Tài khoản admin '{}' đã tồn tại, bỏ qua bước seed.", adminUsername);
            return;
        }

        User admin = new User();
        admin.setUsername(adminUsername);
        admin.setEmail(adminEmail);
        admin.setPhoneNumber(adminPhoneNumber);
        admin.setPasswordHash(passwordEncoder.encode(adminRawPassword));
        admin.setRole(UserRole.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);

        User savedAdmin = userRepository.save(admin);

        UserProfile profile = new UserProfile();
        profile.setUser(savedAdmin);
        profile.setFullName(adminFullName);
        userProfileRepository.save(profile);

        log.info("Đã tạo tài khoản admin mặc định: username='{}'", adminUsername);
    }
}