package org.example.portfolife_backend.dto.response;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        Long postId,
        Long userId,
        String username,
        String userFullName,
        String userAvatarUrl,
        String content,
        boolean isEdited,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
