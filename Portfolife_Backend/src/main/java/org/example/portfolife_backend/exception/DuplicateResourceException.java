package org.example.portfolife_backend.exception;

/**
 * Ném ra khi username hoặc email đã tồn tại lúc signup.
 * Được GlobalExceptionHandler bắt và trả về HTTP 409 Conflict.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}

