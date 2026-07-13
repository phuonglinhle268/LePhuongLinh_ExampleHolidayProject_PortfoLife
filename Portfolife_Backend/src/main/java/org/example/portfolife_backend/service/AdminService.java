package org.example.portfolife_backend.service;

import org.example.portfolife_backend.model.entity.*;
import org.example.portfolife_backend.model.enums.*;
import org.example.portfolife_backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final ReportRepository reportRepository;
    private final AdminActionLogRepository adminActionLogRepository;
    private final BannedWordRepository bannedWordRepository;

    public AdminService(UserRepository userRepository,
                        PostRepository postRepository,
                        CommentRepository commentRepository,
                        ReportRepository reportRepository,
                        AdminActionLogRepository adminActionLogRepository,
                        BannedWordRepository bannedWordRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.reportRepository = reportRepository;
        this.adminActionLogRepository = adminActionLogRepository;
        this.bannedWordRepository = bannedWordRepository;
    }

    /**
     * Khóa tài khoản người dùng.
     */
    @Transactional
    public void lockUser(Long adminId, Long userId, String reason) {
        User admin = userRepository.findById(adminId).orElseThrow();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        user.setStatus(UserStatus.LOCKED);
        userRepository.save(user);

        logAction(admin, AdminActionType.LOCK_USER, AdminTargetType.USER, userId, reason);
    }

    /**
     * Mở khóa tài khoản người dùng.
     */
    @Transactional
    public void unlockUser(Long adminId, Long userId, String reason) {
        User admin = userRepository.findById(adminId).orElseThrow();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        logAction(admin, AdminActionType.UNLOCK_USER, AdminTargetType.USER, userId, reason);
    }

    /**
     * Ẩn bài viết vi phạm.
     */
    @Transactional
    public void hidePost(Long adminId, Long postId, String reason) {
        User admin = userRepository.findById(adminId).orElseThrow();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));

        post.setStatus(ContentStatus.HIDDEN);
        postRepository.save(post);

        logAction(admin, AdminActionType.HIDE_POST, AdminTargetType.POST, postId, reason);
    }

    /**
     * Xóa hoàn toàn bài viết vi phạm.
     */
    @Transactional
    public void deletePost(Long adminId, Long postId, String reason) {
        User admin = userRepository.findById(adminId).orElseThrow();
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));

        postRepository.delete(post);

        logAction(admin, AdminActionType.DELETE_POST, AdminTargetType.POST, postId, reason);
    }

    /**
     * Ẩn bình luận vi phạm.
     */
    @Transactional
    public void hideComment(Long adminId, Long commentId, String reason) {
        User admin = userRepository.findById(adminId).orElseThrow();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bình luận"));

        comment.setStatus(ContentStatus.HIDDEN);
        commentRepository.save(comment);

        logAction(admin, AdminActionType.HIDE_COMMENT, AdminTargetType.COMMENT, commentId, reason);
    }

    /**
     * Xóa bình luận vi phạm.
     */
    @Transactional
    public void deleteComment(Long adminId, Long commentId, String reason) {
        User admin = userRepository.findById(adminId).orElseThrow();
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bình luận"));

        commentRepository.delete(comment);

        logAction(admin, AdminActionType.DELETE_COMMENT, AdminTargetType.COMMENT, commentId, reason);
    }

    /**
     * Giải quyết báo cáo vi phạm.
     */
    @Transactional
    public void resolveReport(Long adminId, Long reportId, String reason) {
        User admin = userRepository.findById(adminId).orElseThrow();
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo"));

        report.setStatus(ReportStatus.RESOLVED);
        reportRepository.save(report);

        logAction(admin, AdminActionType.RESOLVE_REPORT, AdminTargetType.REPORT, reportId, reason);
    }

    /**
     * Lấy danh sách báo cáo chưa xử lý.
     */
    public List<Report> getPendingReports() {
        return reportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.PENDING);
    }

    /**
     * Thêm từ cấm mới vào hệ thống.
     */
    @Transactional
    public BannedWord addBannedWord(Long adminId, String word, String reason) {
        User admin = userRepository.findById(adminId).orElseThrow();
        String cleanWord = word.trim();
        if (bannedWordRepository.existsByWord(cleanWord)) {
            throw new RuntimeException("Từ khóa cấm đã tồn tại: " + cleanWord);
        }

        BannedWord bannedWord = new BannedWord();
        bannedWord.setWord(cleanWord);
        BannedWord saved = bannedWordRepository.save(bannedWord);

        logAction(admin, AdminActionType.RESOLVE_REPORT, AdminTargetType.REPORT, saved.getId(), "Thêm từ cấm: " + cleanWord + " - Lý do: " + reason);
        return saved;
    }

    /**
     * Lấy danh sách tất cả từ khóa cấm.
     */
    public List<BannedWord> getBannedWords() {
        return bannedWordRepository.findAll();
    }

    /**
     * Xóa từ cấm khỏi hệ thống.
     */
    @Transactional
    public void deleteBannedWord(Long adminId, Long id) {
        User admin = userRepository.findById(adminId).orElseThrow();
        BannedWord bw = bannedWordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy từ khóa cấm"));

        bannedWordRepository.delete(bw);
        logAction(admin, AdminActionType.RESOLVE_REPORT, AdminTargetType.REPORT, id, "Xóa từ cấm: " + bw.getWord());
    }

    private void logAction(User admin, AdminActionType actionType, AdminTargetType targetType, Long targetId, String reason) {
        AdminActionLog log = new AdminActionLog();
        log.setAdmin(admin);
        log.setActionType(actionType);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setReason(reason);
        log.setCreatedAt(LocalDateTime.now());
        adminActionLogRepository.save(log);
    }
}
