package org.example.portfolife_backend.service;

import org.example.portfolife_backend.model.entity.*;
import org.example.portfolife_backend.model.enums.*;
import org.example.portfolife_backend.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final BannedWordRepository bannedWordRepository;

    @Value("${app.admin.username}")
    private String adminUsername;

    public ReportService(ReportRepository reportRepository,
                         UserRepository userRepository,
                         BannedWordRepository bannedWordRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.bannedWordRepository = bannedWordRepository;
    }

    /**
     * Tạo một báo cáo vi phạm nội dung mới.
     */
    @Transactional
    public Report createReport(Long reporterId, ReportTargetType targetType, Long targetId, String reason) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người báo cáo"));

        Report report = new Report();
        report.setReporter(reporter);
        report.setTargetType(targetType);
        report.setTargetId(targetId);
        report.setReason(reason);
        report.setStatus(ReportStatus.PENDING);

        return reportRepository.save(report);
    }

    /**
     * Tự động quét từ cấm trong bài viết hoặc bình luận, nếu vi phạm sẽ tự động tạo báo cáo về hệ thống.
     */
    @Transactional
    public void scanAndFlagContent(String content, ReportTargetType targetType, Long targetId) {
        if (content == null || content.trim().isEmpty()) {
            return;
        }

        List<BannedWord> bannedWords = bannedWordRepository.findAll();
        String lowerContent = content.toLowerCase();

        for (BannedWord bw : bannedWords) {
            String bannedStr = bw.getWord().toLowerCase();
            if (lowerContent.contains(bannedStr)) {
                // Tìm tài khoản hệ thống (admin) làm người đại diện báo cáo tự động
                User systemAdmin = userRepository.findByUsername(adminUsername)
                        .orElseGet(() -> userRepository.findAll().stream()
                                .filter(u -> u.getRole() == UserRole.ADMIN)
                                .findFirst()
                                .orElse(null));

                if (systemAdmin != null) {
                    createReport(
                            systemAdmin.getId(),
                            targetType,
                            targetId,
                            "Hệ thống tự động phát hiện chứa từ ngữ cấm vi phạm: \"" + bw.getWord() + "\""
                    );
                }
                break; // Chỉ cần 1 từ vi phạm là đủ để tạo báo cáo
            }
        }
    }
}
