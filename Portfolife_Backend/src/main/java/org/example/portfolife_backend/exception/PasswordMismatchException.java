package org.example.portfolife_backend.exception;

/**
 * Ném ra khi newPassword và confirmPassword không khớp lúc reset password.
 * Được GlobalExceptionHandler bắt và trả về HTTP 400.
 */
public class PasswordMismatchException extends RuntimeException {

    public PasswordMismatchException(String message) {
        super(message);
    }
}
