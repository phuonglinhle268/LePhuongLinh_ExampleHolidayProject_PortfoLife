package org.example.portfolife_backend.controller;

import org.example.portfolife_backend.dto.response.ApiResponse;
import org.example.portfolife_backend.dto.response.PostResponse;
import org.example.portfolife_backend.dto.response.SearchResponse;
import org.example.portfolife_backend.dto.response.UserProfileResponse;
import org.example.portfolife_backend.model.entity.*;
import org.example.portfolife_backend.repository.*;
import org.example.portfolife_backend.security.CustomUserDetails;
import org.example.portfolife_backend.service.SearchService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
public class SearchController {

    private final SearchService searchService;
    private final UserProfileRepository userProfileRepository;
    private final PostTagRepository postTagRepository;
    private final PostImageRepository postImageRepository;
    private final StudyDocumentRepository studyDocumentRepository;

    public SearchController(SearchService searchService,
                            UserProfileRepository userProfileRepository,
                            PostTagRepository postTagRepository,
                            PostImageRepository postImageRepository,
                            StudyDocumentRepository studyDocumentRepository) {
        this.searchService = searchService;
        this.userProfileRepository = userProfileRepository;
        this.postTagRepository = postTagRepository;
        this.postImageRepository = postImageRepository;
        this.studyDocumentRepository = studyDocumentRepository;
    }

    /**
     * Tìm kiếm bài đăng và người dùng theo từ khóa.
     */
    @GetMapping
    public ApiResponse<SearchResponse> search(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("q") String query) {
        if (query == null || query.trim().isEmpty()) {
            return ApiResponse.success("Lấy thông tin tìm kiếm thành công", new SearchResponse(List.of(), List.of()));
        }

        List<PostResponse> posts = searchService.searchPosts(query, userDetails.getUser().getId()).stream()
                .map(this::mapToPostResponse)
                .toList();

        List<UserProfileResponse> users = searchService.searchUsers(query).stream()
                .map(user -> {
                    UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
                    return new UserProfileResponse(
                            user.getId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getPhoneNumber(),
                            user.getRole().name(),
                            user.getStatus().name(),
                            profile != null ? profile.getFullName() : user.getUsername(),
                            profile != null ? profile.getAvatarUrl() : null,
                            profile != null ? profile.getCoverUrl() : null,
                            profile != null ? profile.getBio() : null,
                            profile != null && profile.getGender() != null ? profile.getGender().name() : null,
                            profile != null ? profile.getDateOfBirth() : null,
                            profile != null ? profile.getAddress() : null,
                            profile != null ? profile.getEducation() : null
                    );
                })
                .toList();

        return ApiResponse.success("Tìm kiếm thành công", new SearchResponse(posts, users));
    }

    private PostResponse mapToPostResponse(Post post) {
        UserProfile profile = userProfileRepository.findByUserId(post.getUser().getId()).orElse(null);
        String fullName = profile != null ? profile.getFullName() : post.getUser().getUsername();
        String avatarUrl = profile != null ? profile.getAvatarUrl() : null;

        List<String> tags = postTagRepository.findByPostId(post.getId()).stream()
                .map(pt -> pt.getTag().getName())
                .toList();

        List<String> imageUrls = postImageRepository.findByPostId(post.getId()).stream()
                .map(PostImage::getImageUrl)
                .toList();

        List<PostResponse.DocumentInfo> documents = studyDocumentRepository.findByPostId(post.getId()).stream()
                .map(doc -> new PostResponse.DocumentInfo(
                        doc.getId(),
                        doc.getFileName(),
                        doc.getFileUrl(),
                        doc.getFileType(),
                        doc.getFileSize(),
                        doc.getDownloadCount()
                ))
                .toList();

        return new PostResponse(
                post.getId(),
                post.getUser().getId(),
                post.getUser().getUsername(),
                fullName,
                avatarUrl,
                post.getContent(),
                post.getPostType(),
                post.getCategory() != null ? post.getCategory().getId() : null,
                post.getCategory() != null ? post.getCategory().getName() : null,
                post.getVisibility(),
                post.isEdited(),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                tags,
                imageUrls,
                documents
        );
    }
}
