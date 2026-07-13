package org.example.portfolife_backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UserProfileUpdateRequest(
        @Size(max = 100, message = "Họ tên không được vượt quá 100 ký tự")
        String fullName,
        
        String bio,
        String avatarUrl,
        String coverUrl,
        
        String gender, // MALE, FEMALE, OTHER
        
        LocalDate dateOfBirth,
        String address,
        String education,
        
        @Email(message = "Email không đúng định dạng")
        @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
        String email,
        
        @Size(max = 15, message = "Số điện thoại không được vượt quá 15 ký tự")
        String phoneNumber
) {
}
