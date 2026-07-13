package org.example.portfolife_backend.controller;

import org.example.portfolife_backend.dto.request.UserProfileUpdateRequest;
import org.example.portfolife_backend.dto.response.ApiResponse;
import org.example.portfolife_backend.dto.response.UserProfileResponse;
import org.example.portfolife_backend.model.entity.User;
import org.example.portfolife_backend.model.entity.UserProfile;
import org.example.portfolife_backend.model.enums.Gender;
import org.example.portfolife_backend.security.CustomUserDetails;
import org.example.portfolife_backend.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserProfileService userProfileService;

    public UserController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/profile")
    public ApiResponse<UserProfileResponse> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        UserProfile profile = userProfileService.getProfileByUserId(userDetails.getUser().getId());
        return ApiResponse.success("Lấy thông tin thành công", mapToResponse(profile));
    }

    @GetMapping("/profile/{username}")
    public ApiResponse<UserProfileResponse> getProfileByUsername(@PathVariable String username) {
        UserProfile profile = userProfileService.getProfileByUsername(username);
        return ApiResponse.success("Lấy thông tin thành công", mapToResponse(profile));
    }

    @PutMapping("/profile")
    public ApiResponse<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UserProfileUpdateRequest request) {
        
        Gender genderEnum = null;
        if (request.gender() != null && !request.gender().trim().isEmpty()) {
            try {
                genderEnum = Gender.valueOf(request.gender().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Giới tính không hợp lệ (hợp lệ: MALE, FEMALE, OTHER)");
            }
        }

        UserProfile updated = userProfileService.updateProfile(
                userDetails.getUser().getId(),
                request.fullName(),
                request.bio(),
                request.avatarUrl(),
                request.coverUrl(),
                genderEnum,
                request.dateOfBirth(),
                request.address(),
                request.education(),
                request.email(),
                request.phoneNumber()
        );

        return ApiResponse.success("Cập nhật thông tin thành công", mapToResponse(updated));
    }

    private UserProfileResponse mapToResponse(UserProfile profile) {
        User user = profile.getUser();
        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole().name(),
                user.getStatus().name(),
                profile.getFullName(),
                profile.getAvatarUrl(),
                profile.getCoverUrl(),
                profile.getBio(),
                profile.getGender() != null ? profile.getGender().name() : null,
                profile.getDateOfBirth(),
                profile.getAddress(),
                profile.getEducation()
        );
    }
}
