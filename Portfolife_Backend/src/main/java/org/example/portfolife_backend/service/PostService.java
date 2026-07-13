package org.example.portfolife_backend.service;

import org.example.portfolife_backend.model.entity.*;
import org.example.portfolife_backend.model.enums.*;
import org.example.portfolife_backend.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final PostCategoryRepository postCategoryRepository;
    private final TagRepository tagRepository;
    private final PostImageRepository postImageRepository;
    private final PostTagRepository postTagRepository;
    private final StudyDocumentRepository studyDocumentRepository;
    private final CommentRepository commentRepository;
    private final ReactionRepository reactionRepository;
    private final SavedPostRepository savedPostRepository;
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final UploadService uploadService;
    private final NotificationService notificationService;
    private final ReportRepository reportRepository;
    private final ReportService reportService;

    public PostService(PostRepository postRepository,
                       PostCategoryRepository postCategoryRepository,
                       TagRepository tagRepository,
                       PostImageRepository postImageRepository,
                       PostTagRepository postTagRepository,
                       StudyDocumentRepository studyDocumentRepository,
                       CommentRepository commentRepository,
                       ReactionRepository reactionRepository,
                       SavedPostRepository savedPostRepository,
                       UserRepository userRepository,
                       FriendshipRepository friendshipRepository,
                       UploadService uploadService,
                       NotificationService notificationService,
                       ReportRepository reportRepository,
                       ReportService reportService) {
        this.postRepository = postRepository;
        this.postCategoryRepository = postCategoryRepository;
        this.tagRepository = tagRepository;
        this.postImageRepository = postImageRepository;
        this.postTagRepository = postTagRepository;
        this.studyDocumentRepository = studyDocumentRepository;
        this.commentRepository = commentRepository;
        this.reactionRepository = reactionRepository;
        this.savedPostRepository = savedPostRepository;
        this.userRepository = userRepository;
        this.friendshipRepository = friendshipRepository;
        this.uploadService = uploadService;
        this.notificationService = notificationService;
        this.reportRepository = reportRepository;
        this.reportService = reportService;
    }

    /**
     * Tạo bài đăng mới. Có thể bao gồm hình ảnh, nhãn dán tags, và tài liệu đính kèm (nếu là bài học/tài liệu).
     */
    @Transactional
    public Post createPost(Long userId, String content, PostType postType, Long categoryId,
                           PostVisibility visibility, List<String> tagNames,
                           MultipartFile[] imageFiles, MultipartFile documentFile) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Post post = new Post();
        post.setUser(user);
        post.setContent(content);
        post.setPostType(postType != null ? postType : PostType.NORMAL);
        post.setVisibility(visibility != null ? visibility : PostVisibility.PUBLIC);
        post.setStatus(ContentStatus.ACTIVE);

        if (categoryId != null) {
            PostCategory category = postCategoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục bài viết"));
            post.setCategory(category);
        }

        Post savedPost = postRepository.save(post);

        // 1. Lưu hình ảnh bài đăng
        if (imageFiles != null && imageFiles.length > 0) {
            for (MultipartFile img : imageFiles) {
                String imgUrl = uploadService.uploadFile(img);
                if (imgUrl != null) {
                    PostImage postImage = new PostImage();
                    postImage.setPost(savedPost);
                    postImage.setImageUrl(imgUrl);
                    postImageRepository.save(postImage);
                }
            }
        }

        // 2. Lưu tài liệu đính kèm (STUDY)
        if (postType == PostType.STUDY && documentFile != null && !documentFile.isEmpty()) {
            String docUrl = uploadService.uploadFile(documentFile);
            if (docUrl != null) {
                StudyDocument doc = new StudyDocument();
                doc.setPost(savedPost);
                doc.setFileName(documentFile.getOriginalFilename());
                doc.setFileUrl(docUrl);
                doc.setFileType(documentFile.getContentType());
                doc.setFileSize(documentFile.getSize());
                doc.setDownloadCount(0L);
                studyDocumentRepository.save(doc);
            }
        }

        // 3. Xử lý gắn tags
        if (tagNames != null && !tagNames.isEmpty()) {
            for (String tagName : tagNames) {
                String cleanName = tagName.trim().toLowerCase();
                if (!cleanName.isEmpty()) {
                    Tag tag = tagRepository.findByName(cleanName)
                            .orElseGet(() -> {
                                Tag newTag = new Tag();
                                newTag.setName(cleanName);
                                return tagRepository.save(newTag);
                            });

                    PostTag postTag = new PostTag();
                    postTag.setPost(savedPost);
                    postTag.setTag(tag);
                    postTagRepository.save(postTag);
                }
            }
        }

        // Gửi thông báo đến danh sách bạn bè
        List<Friendship> friendships = friendshipRepository.findAllByUserId(userId);
        for (Friendship f : friendships) {
            User friend = f.getUserOne().getId().equals(userId) ? f.getUserTwo() : f.getUserOne();
            notificationService.createNotification(
                    friend,
                    user,
                    NotificationType.POST_COMMENT, // Mượn type này hoặc gửi đẩy thông báo hệ thống
                    user.getUsername() + " vừa chia sẻ một bài viết mới: " + postType.name(),
                    NotificationReferenceType.POST,
                    savedPost.getId()
            );
        }

        // Tự động quét từ cấm vi phạm điều khoản hệ thống
        reportService.scanAndFlagContent(content, ReportTargetType.POST, savedPost.getId());

        return savedPost;
    }

    public List<Post> getFeed(Long userId) {
        return postRepository.findFeedPosts(userId, ContentStatus.ACTIVE);
    }

    public List<Post> getUserPosts(Long targetUserId, Long currentUserId) {
        return postRepository.findUserTimelinePosts(targetUserId, currentUserId, ContentStatus.ACTIVE);
    }

    public Post getPostById(Long postId, Long currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng"));
        if (post.getStatus() != ContentStatus.ACTIVE) {
            throw new RuntimeException("Bài viết này đã bị ẩn hoặc xóa");
        }
        // Kiểm tra xem người dùng hiện tại đã báo cáo bài viết hoặc tác giả bài viết chưa
        if (reportRepository.existsByReporterIdAndTargetTypeAndTargetId(currentUserId, ReportTargetType.POST, postId)) {
            throw new RuntimeException("Bạn đã báo cáo bài viết này nên không thể xem");
        }
        if (reportRepository.existsByReporterIdAndTargetTypeAndTargetId(currentUserId, ReportTargetType.USER, post.getUser().getId())) {
            throw new RuntimeException("Bạn đã báo cáo tác giả bài viết này nên không thể xem");
        }
        // Kiểm tra quyền xem
        if (post.getVisibility() == PostVisibility.PRIVATE && !post.getUser().getId().equals(currentUserId)) {
            throw new RuntimeException("Bạn không có quyền xem bài viết này");
        }
        if (post.getVisibility() == PostVisibility.FRIENDS && !post.getUser().getId().equals(currentUserId)) {
            boolean isFriend = friendshipRepository.existBetweenUsers(post.getUser().getId(), currentUserId);
            if (!isFriend) {
                throw new RuntimeException("Bài viết này chỉ hiển thị với bạn bè");
            }
        }
        return post;
    }

    @Transactional
    public Post updatePost(Long postId, Long userId, String content, PostVisibility visibility) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng"));
        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa bài viết này");
        }

        if (content != null && !content.trim().isEmpty()) {
            post.setContent(content);
        }
        if (visibility != null) {
            post.setVisibility(visibility);
        }
        post.setEdited(true);
        return postRepository.save(post);
    }

    @Transactional
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng"));
        if (!post.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa bài viết này");
        }
        postRepository.delete(post);
    }

    // =========================================================================
    // BÌNH LUẬN (COMMENTS)
    // =========================================================================
    
    @Transactional
    public Comment addComment(Long postId, Long userId, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setUser(user);
        comment.setContent(content);
        comment.setStatus(ContentStatus.ACTIVE);

        Comment saved = commentRepository.save(comment);

        // Tự động quét từ cấm vi phạm điều khoản hệ thống cho bình luận
        reportService.scanAndFlagContent(content, ReportTargetType.COMMENT, saved.getId());

        // Gửi thông báo đến chủ bài đăng
        if (!post.getUser().getId().equals(userId)) {
            notificationService.createNotification(
                    post.getUser(),
                    user,
                    NotificationType.POST_COMMENT,
                    user.getUsername() + " đã bình luận về bài viết của bạn: \"" + content + "\"",
                    NotificationReferenceType.POST,
                    postId
            );
        }

        return saved;
    }

    public List<Comment> getComments(Long postId, Long currentUserId) {
        return commentRepository.findActiveCommentsFiltered(postId, currentUserId, ContentStatus.ACTIVE);
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bình luận"));
        if (!comment.getUser().getId().equals(userId) && !comment.getPost().getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền xóa bình luận này");
        }
        commentRepository.delete(comment);
    }

    // =========================================================================
    // CẢM XÚC (REACTIONS)
    // =========================================================================
    
    @Transactional
    public Reaction toggleReaction(Long postId, Long userId, ReactionType reactionType) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Optional<Reaction> existing = reactionRepository.findByPostIdAndUserId(postId, userId);

        if (existing.isPresent()) {
            Reaction reaction = existing.get();
            if (reaction.getReactionType() == reactionType) {
                // Thả lại cùng loại -> hủy reaction (toggle off)
                reactionRepository.delete(reaction);
                return null;
            } else {
                // Đổi loại reaction
                reaction.setReactionType(reactionType);
                return reactionRepository.save(reaction);
            }
        } else {
            // Tạo mới reaction
            Reaction reaction = new Reaction();
            reaction.setPost(post);
            reaction.setUser(user);
            reaction.setReactionType(reactionType);
            Reaction saved = reactionRepository.save(reaction);

            // Gửi thông báo đến chủ bài đăng
            if (!post.getUser().getId().equals(userId)) {
                notificationService.createNotification(
                        post.getUser(),
                        user,
                        NotificationType.POST_REACTION,
                        user.getUsername() + " đã bày tỏ cảm xúc \"" + reactionType.name() + "\" về bài viết của bạn",
                        NotificationReferenceType.POST,
                        postId
                );
            }
            return saved;
        }
    }

    // =========================================================================
    // LƯU BÀI VIẾT (SAVED POSTS)
    // =========================================================================
    
    @Transactional
    public boolean toggleSavePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Optional<SavedPost> existing = savedPostRepository.findByUserIdAndPostId(userId, postId);
        if (existing.isPresent()) {
            savedPostRepository.delete(existing.get());
            return false; // Đã bỏ lưu
        } else {
            SavedPost saved = new SavedPost();
            saved.setUser(user);
            saved.setPost(post);
            savedPostRepository.save(saved);
            return true; // Đã lưu
        }
    }

    public Page<SavedPost> getSavedPosts(Long userId, Pageable pageable) {
        return savedPostRepository.findByUserId(userId, pageable);
    }
}
