package org.example.portfolife_backend.controller;

import org.example.portfolife_backend.dto.request.AdminActionRequest;
import org.example.portfolife_backend.dto.request.BannedWordRequest;
import org.example.portfolife_backend.dto.response.ApiResponse;
import org.example.portfolife_backend.model.entity.BannedWord;
import org.example.portfolife_backend.model.entity.Report;
import org.example.portfolife_backend.security.CustomUserDetails;
import org.example.portfolife_backend.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/ping")
    public ApiResponse<String> ping() {
        return ApiResponse.success("Xin chào Admin", "pong");
    }

    /**
     * Khóa tài khoản người dùng.
     */
    @PostMapping("/users/{userId}/lock")
    public ApiResponse<Void> lockUser(
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            @PathVariable Long userId,
            @Valid @RequestBody AdminActionRequest request) {
        adminService.lockUser(adminDetails.getUser().getId(), userId, request.reason());
        return ApiResponse.success("Đã khóa tài khoản thành công", null);
    }

    /**
     * Mở khóa tài khoản người dùng.
     */
    @PostMapping("/users/{userId}/unlock")
    public ApiResponse<Void> unlockUser(
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            @PathVariable Long userId,
            @Valid @RequestBody AdminActionRequest request) {
        adminService.unlockUser(adminDetails.getUser().getId(), userId, request.reason());
        return ApiResponse.success("Đã mở khóa tài khoản thành công", null);
    }

    /**
     * Ẩn bài đăng vi phạm.
     */
    @PostMapping("/posts/{postId}/hide")
    public ApiResponse<Void> hidePost(
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            @PathVariable Long postId,
            @Valid @RequestBody AdminActionRequest request) {
        adminService.hidePost(adminDetails.getUser().getId(), postId, request.reason());
        return ApiResponse.success("Đã ẩn bài viết thành công", null);
    }

    /**
     * Xóa hoàn toàn bài đăng vi phạm.
     */
    @DeleteMapping("/posts/{postId}")
    public ApiResponse<Void> deletePost(
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            @PathVariable Long postId,
            @Valid @RequestBody AdminActionRequest request) {
        adminService.deletePost(adminDetails.getUser().getId(), postId, request.reason());
        return ApiResponse.success("Đã xóa bài viết thành công", null);
    }

    /**
     * Ẩn bình luận vi phạm.
     */
    @PostMapping("/comments/{commentId}/hide")
    public ApiResponse<Void> hideComment(
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            @PathVariable Long commentId,
            @Valid @RequestBody AdminActionRequest request) {
        adminService.hideComment(adminDetails.getUser().getId(), commentId, request.reason());
        return ApiResponse.success("Đã ẩn bình luận thành công", null);
    }

    /**
     * Xóa hoàn toàn bình luận vi phạm.
     */
    @DeleteMapping("/comments/{commentId}")
    public ApiResponse<Void> deleteComment(
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            @PathVariable Long commentId,
            @Valid @RequestBody AdminActionRequest request) {
        adminService.deleteComment(adminDetails.getUser().getId(), commentId, request.reason());
        return ApiResponse.success("Đã xóa bình luận thành công", null);
    }

    /**
     * Giải quyết báo cáo vi phạm nội dung.
     */
    @PostMapping("/reports/{reportId}/resolve")
    public ApiResponse<Void> resolveReport(
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            @PathVariable Long reportId,
            @Valid @RequestBody AdminActionRequest request) {
        adminService.resolveReport(adminDetails.getUser().getId(), reportId, request.reason());
        return ApiResponse.success("Đã giải quyết báo cáo thành công", null);
    }

    /**
     * Lấy danh sách các báo cáo vi phạm đang chờ xử lý.
     */
    @GetMapping("/reports/pending")
    public ApiResponse<List<Report>> getPendingReports() {
        List<Report> reports = adminService.getPendingReports();
        return ApiResponse.success("Lấy danh sách báo cáo chờ duyệt thành công", reports);
    }

    /**
     * Thêm từ cấm mới vào hệ thống.
     */
    @PostMapping("/banned-words")
    public ApiResponse<BannedWord> addBannedWord(
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            @Valid @RequestBody BannedWordRequest request,
            @RequestParam(defaultValue = "Admin thêm từ cấm") String reason) {
        BannedWord bw = adminService.addBannedWord(adminDetails.getUser().getId(), request.word(), reason);
        return ApiResponse.success("Thêm từ cấm vi phạm thành công", bw);
    }

    /**
     * Lấy danh sách tất cả từ khóa cấm.
     */
    @GetMapping("/banned-words")
    public ApiResponse<List<BannedWord>> getBannedWords() {
        List<BannedWord> list = adminService.getBannedWords();
        return ApiResponse.success("Lấy danh sách từ khóa cấm thành công", list);
    }

    /**
     * Xóa từ cấm khỏi hệ thống.
     */
    @DeleteMapping("/banned-words/{id}")
    public ApiResponse<Void> deleteBannedWord(
            @AuthenticationPrincipal CustomUserDetails adminDetails,
            @PathVariable Long id) {
        adminService.deleteBannedWord(adminDetails.getUser().getId(), id);
        return ApiResponse.success("Xóa từ khóa cấm thành công", null);
    }
}
