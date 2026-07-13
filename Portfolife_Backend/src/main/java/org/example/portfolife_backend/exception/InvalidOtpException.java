package org.example.portfolife_backend.exception;

/**
 * Ném ra khi OTP không tồn tại, sai, đã hết hạn, hoặc đã được sử dụng trước đó.
 * Được GlobalExceptionHandler bắt và trả về HTTP 400.
 */
public class InvalidOtpException extends RuntimeException {

    public InvalidOtpException(String message) {
        super(message);
    }
}
