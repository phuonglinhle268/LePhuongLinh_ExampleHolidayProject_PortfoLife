package org.example.portfolife_backend.dto.response;

import java.time.LocalDate;

public record UserProfileResponse(
        Long id,
        String username,
        String email,
        String phoneNumber,
        String role,
        String status,
        String fullName,
        String avatarUrl,
        String coverUrl,
        String bio,
        String gender,
        LocalDate dateOfBirth,
        String address,
        String education
) {
}
