package org.example.portfolife_backend.controller;

import org.example.portfolife_backend.dto.request.CommentCreateRequest;
import org.example.portfolife_backend.dto.request.ReactionRequest;
import org.example.portfolife_backend.dto.response.ApiResponse;
import org.example.portfolife_backend.dto.response.CommentResponse;
import org.example.portfolife_backend.dto.response.PostResponse;
import org.example.portfolife_backend.model.entity.*;
import org.example.portfolife_backend.model.enums.PostType;
import org.example.portfolife_backend.model.enums.PostVisibility;
import org.example.portfolife_backend.model.enums.ReactionType;
import org.example.portfolife_backend.repository.*;
import org.example.portfolife_backend.security.CustomUserDetails;
import org.example.portfolife_backend.service.PostService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostService postService;
    private final UserProfileRepository userProfileRepository;
    private final PostTagRepository postTagRepository;
    private final PostImageRepository postImageRepository;
    private final StudyDocumentRepository studyDocumentRepository;

    public PostController(PostService postService,
                          UserProfileRepository userProfileRepository,
                          PostTagRepository postTagRepository,
                          PostImageRepository postImageRepository,
                          StudyDocumentRepository studyDocumentRepository) {
        this.postService = postService;
        this.userProfileRepository = userProfileRepository;
        this.postTagRepository = postTagRepository;
        this.postImageRepository = postImageRepository;
        this.studyDocumentRepository = studyDocumentRepository;
    }

    /**
     * Tạo bài đăng mới (bao gồm hỗ trợ tải nhiều ảnh, đính kèm tệp tài liệu và gắn tags).
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("content") String content,
            @RequestParam(value = "postType", required = false) String postTypeStr,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "visibility", required = false) String visibilityStr,
            @RequestParam(value = "tags", required = false) List<String> tags,
            @RequestParam(value = "images", required = false) MultipartFile[] images,
            @RequestParam(value = "documentFile", required = false) MultipartFile documentFile) {

        PostType postType = PostType.NORMAL;
        if (postTypeStr != null && !postTypeStr.trim().isEmpty()) {
            try {
                postType = PostType.valueOf(postTypeStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Loại bài viết không hợp lệ: " + postTypeStr);
            }
        }

        PostVisibility visibility = PostVisibility.PUBLIC;
        if (visibilityStr != null && !visibilityStr.trim().isEmpty()) {
            try {
                visibility = PostVisibility.valueOf(visibilityStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Quyền riêng tư không hợp lệ: " + visibilityStr);
            }
        }

        Post post = postService.createPost(
                userDetails.getUser().getId(),
                content,
                postType,
                categoryId,
                visibility,
                tags,
                images,
                documentFile
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo bài viết thành công", mapToPostResponse(post)));
    }

    @GetMapping("/feed")
    public ApiResponse<List<PostResponse>> getFeed(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        List<PostResponse> feed = postService.getFeed(userDetails.getUser().getId()).stream()
                .map(this::mapToPostResponse)
                .toList();
        return ApiResponse.success("Lấy bảng tin thành công", feed);
    }

    /**
     * Lấy danh sách bài đăng của một tài khoản cụ thể.
     */
    @GetMapping("/user/{targetUserId}")
    public ApiResponse<List<PostResponse>> getUserPosts(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long targetUserId) {

        List<PostResponse> userPosts = postService.getUserPosts(targetUserId, userDetails.getUser().getId()).stream()
                .map(this::mapToPostResponse)
                .toList();
        return ApiResponse.success("Lấy danh sách bài viết thành công", userPosts);
    }

    /**
     * Xem chi tiết bài viết.
     */
    @GetMapping("/{postId}")
    public ApiResponse<PostResponse> getPostById(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long postId) {
        Post post = postService.getPostById(postId, userDetails.getUser().getId());
        return ApiResponse.success("Lấy bài viết thành công", mapToPostResponse(post));
    }

    /**
     * Chỉnh sửa bài đăng.
     */
    @PutMapping("/{postId}")
    public ApiResponse<PostResponse> updatePost(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long postId,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "visibility", required = false) String visibilityStr) {

        PostVisibility visibility = null;
        if (visibilityStr != null && !visibilityStr.trim().isEmpty()) {
            try {
                visibility = PostVisibility.valueOf(visibilityStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Quyền riêng tư không hợp lệ: " + visibilityStr);
            }
        }

        Post updated = postService.updatePost(postId, userDetails.getUser().getId(), content, visibility);
        return ApiResponse.success("Cập nhật bài viết thành công", mapToPostResponse(updated));
    }

    /**
     * Xóa bài đăng.
     */
    @DeleteMapping("/{postId}")
    public ApiResponse<Void> deletePost(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long postId) {
        postService.deletePost(postId, userDetails.getUser().getId());
        return ApiResponse.success("Xóa bài viết thành công", null);
    }

    // =========================================================================
    // BÌNH LUẬN (COMMENTS)
    // =========================================================================

    @PostMapping("/{postId}/comments")
    public ApiResponse<CommentResponse> addComment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long postId,
            @Valid @RequestBody CommentCreateRequest request) {
        
        Comment comment = postService.addComment(postId, userDetails.getUser().getId(), request.content());
        return ApiResponse.success("Bình luận thành công", mapToCommentResponse(comment));
    }

    @GetMapping("/{postId}/comments")
    public ApiResponse<List<CommentResponse>> getComments(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long postId) {
        List<CommentResponse> comments = postService.getComments(postId, userDetails.getUser().getId()).stream()
                .map(this::mapToCommentResponse)
                .toList();
        return ApiResponse.success("Lấy danh sách bình luận thành công", comments);
    }

    @DeleteMapping("/{postId}/comments/{commentId}")
    public ApiResponse<Void> deleteComment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long postId,
            @PathVariable Long commentId) {
        
        postService.deleteComment(commentId, userDetails.getUser().getId());
        return ApiResponse.success("Xóa bình luận thành công", null);
    }

    // =========================================================================
    // CẢM XÚC (REACTIONS)
    // =========================================================================

    @PostMapping("/{postId}/reactions")
    public ApiResponse<String> toggleReaction(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long postId,
            @Valid @RequestBody ReactionRequest request) {

        ReactionType reactionType;
        try {
            reactionType = ReactionType.valueOf(request.reactionType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Loại cảm xúc không hợp lệ: " + request.reactionType());
        }

        Reaction reaction = postService.toggleReaction(postId, userDetails.getUser().getId(), reactionType);
        String msg = reaction != null ? "Đã bày tỏ cảm xúc thành công" : "Đã hủy bày tỏ cảm xúc";
        return ApiResponse.success(msg, msg);
    }

    // =========================================================================
    // LƯU BÀI VIẾT (SAVED POSTS)
    // =========================================================================

    @PostMapping("/{postId}/save")
    public ApiResponse<String> toggleSavePost(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long postId) {
        
        boolean saved = postService.toggleSavePost(postId, userDetails.getUser().getId());
        String msg = saved ? "Đã lưu bài viết thành công" : "Đã hủy lưu bài viết";
        return ApiResponse.success(msg, msg);
    }

    @GetMapping("/saved")
    public ApiResponse<Page<PostResponse>> getSavedPosts(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<PostResponse> savedList = postService.getSavedPosts(userDetails.getUser().getId(), pageable)
                .map(savedPost -> mapToPostResponse(savedPost.getPost()));
        
        return ApiResponse.success("Lấy danh sách bài viết đã lưu thành công", savedList);
    }

    // =========================================================================
    // MAPPING HELPERS
    // =========================================================================

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

    private CommentResponse mapToCommentResponse(Comment comment) {
        UserProfile profile = userProfileRepository.findByUserId(comment.getUser().getId()).orElse(null);
        String fullName = profile != null ? profile.getFullName() : comment.getUser().getUsername();
        String avatarUrl = profile != null ? profile.getAvatarUrl() : null;

        return new CommentResponse(
                comment.getId(),
                comment.getPost().getId(),
                comment.getUser().getId(),
                comment.getUser().getUsername(),
                fullName,
                avatarUrl,
                comment.getContent(),
                comment.isEdited(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}
