package org.example.portfolife_backend.repository;

import org.example.portfolife_backend.model.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, Long> {

    Optional<PasswordResetOtp> findByUser_IdAndOtpCodeAndUsedFalse(Long userId, String otpCode);

    List<PasswordResetOtp> findAllByUser_IdAndUsedFalse(Long userId);
}