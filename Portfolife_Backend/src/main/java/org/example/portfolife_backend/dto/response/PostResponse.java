package org.example.portfolife_backend.dto.response;

import org.example.portfolife_backend.model.enums.PostType;
import org.example.portfolife_backend.model.enums.PostVisibility;

import java.time.LocalDateTime;
import java.util.List;

public record PostResponse(
        Long id,
        Long userId,
        String username,
        String userFullName,
        String userAvatarUrl,
        String content,
        PostType postType,
        Long categoryId,
        String categoryName,
        PostVisibility visibility,
        boolean isEdited,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<String> tags,
        List<String> imageUrls,
        List<DocumentInfo> documents
) {
    public record DocumentInfo(
            Long id,
            String fileName,
            String fileUrl,
            String fileType,
            Long fileSize,
            Long downloadCount
    ) {}
}
