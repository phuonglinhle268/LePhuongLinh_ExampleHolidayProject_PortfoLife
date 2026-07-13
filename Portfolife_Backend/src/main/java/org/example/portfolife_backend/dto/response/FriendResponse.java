package org.example.portfolife_backend.dto.response;

public record FriendResponse(
        Long userId,
        String username,
        String fullName,
        String avatarUrl,
        String bio,
        int mutualFriendsCount,
        int commonTagsCount
) {
}
