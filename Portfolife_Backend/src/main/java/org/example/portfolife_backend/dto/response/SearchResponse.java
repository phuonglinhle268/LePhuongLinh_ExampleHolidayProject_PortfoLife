package org.example.portfolife_backend.dto.response;

import java.util.List;

public record SearchResponse(
        List<PostResponse> posts,
        List<UserProfileResponse> users
) {
}
