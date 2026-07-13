package org.example.portfolife_backend.service;

import org.example.portfolife_backend.model.entity.User;
import org.example.portfolife_backend.model.entity.UserProfile;
import org.example.portfolife_backend.model.enums.Gender;
import org.example.portfolife_backend.repository.UserProfileRepository;
import org.example.portfolife_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    public UserProfileService(UserProfileRepository userProfileRepository, UserRepository userRepository) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
    }

    public UserProfile getProfileByUserId(Long userId) {
        return userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ người dùng"));
    }

    public UserProfile getProfileByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return getProfileByUserId(user.getId());
    }

    /**
     * Cập nhật thông tin hồ sơ của người dùng (tất cả các trường thông tin).
     */
    @Transactional
    public UserProfile updateProfile(Long userId, String fullName, String bio, String avatarUrl, String coverUrl,
                                     Gender gender, LocalDate dateOfBirth, String address, String education,
                                     String email, String phoneNumber) {
        UserProfile profile = getProfileByUserId(userId);
        User user = profile.getUser();

        // Kiểm tra trùng lặp email nếu thay đổi
        if (email != null && !email.trim().isEmpty() && !email.equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(email)) {
                throw new RuntimeException("Email đã được sử dụng bởi tài khoản khác: " + email);
            }
            user.setEmail(email);
        }

        // Kiểm tra trùng lặp số điện thoại nếu thay đổi
        if (phoneNumber != null && !phoneNumber.trim().isEmpty() && !phoneNumber.equals(user.getPhoneNumber())) {
            if (userRepository.existsByPhoneNumber(phoneNumber)) {
                throw new RuntimeException("Số điện thoại đã được sử dụng bởi tài khoản khác: " + phoneNumber);
            }
            user.setPhoneNumber(phoneNumber);
        }

        if (fullName != null && !fullName.trim().isEmpty()) {
            profile.setFullName(fullName);
        }
        profile.setBio(bio);
        profile.setAvatarUrl(avatarUrl);
        profile.setCoverUrl(coverUrl);
        profile.setGender(gender);
        profile.setDateOfBirth(dateOfBirth);
        profile.setAddress(address);
        profile.setEducation(education);

        userRepository.save(user);
        return userProfileRepository.save(profile);
    }
}
