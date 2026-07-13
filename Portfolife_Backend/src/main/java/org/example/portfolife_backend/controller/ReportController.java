package org.example.portfolife_backend.controller;

import org.example.portfolife_backend.dto.request.ReportRequest;
import org.example.portfolife_backend.dto.response.ApiResponse;
import org.example.portfolife_backend.model.entity.Report;
import org.example.portfolife_backend.model.enums.ReportTargetType;
import org.example.portfolife_backend.security.CustomUserDetails;
import org.example.portfolife_backend.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * Gửi báo cáo vi phạm bài đăng, bình luận hoặc người dùng.
     */
    @PostMapping
    public ApiResponse<Void> submitReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ReportRequest request) {

        ReportTargetType targetType;
        try {
            targetType = ReportTargetType.valueOf(request.targetType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Loại đối tượng báo cáo không hợp lệ (hợp lệ: POST, COMMENT, USER)");
        }

        reportService.createReport(
                userDetails.getUser().getId(),
                targetType,
                request.targetId(),
                request.reason()
        );

        return ApiResponse.success("Báo cáo thành công. Hệ thống sẽ ẩn nội dung này khỏi tài khoản của bạn.", null);
    }
}
