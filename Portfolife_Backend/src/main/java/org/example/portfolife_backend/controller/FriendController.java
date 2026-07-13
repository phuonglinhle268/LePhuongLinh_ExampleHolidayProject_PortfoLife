package org.example.portfolife_backend.controller;

import org.example.portfolife_backend.dto.response.ApiResponse;
import org.example.portfolife_backend.dto.response.FriendResponse;
import org.example.portfolife_backend.security.CustomUserDetails;
import org.example.portfolife_backend.service.FriendService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/friends")
public class FriendController {

    private final FriendService friendService;

    public FriendController(FriendService friendService) {
        this.friendService = friendService;
    }

    /**
     * Gửi yêu cầu kết bạn.
     */
    @PostMapping("/request/{userId}")
    public ApiResponse<Void> sendFriendRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long userId) {
        friendService.sendFriendRequest(userDetails.getUser().getId(), userId);
        return ApiResponse.success("Gửi yêu cầu kết bạn thành công", null);
    }

    /**
     * Đồng ý kết bạn.
     */
    @PutMapping("/accept/{userId}")
    public ApiResponse<Void> acceptFriendRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long userId) {
        friendService.acceptFriendRequest(userDetails.getUser().getId(), userId);
        return ApiResponse.success("Đồng ý kết bạn thành công", null);
    }

    /**
     * Từ chối kết bạn.
     */
    @DeleteMapping("/decline/{userId}")
    public ApiResponse<Void> declineFriendRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long userId) {
        friendService.declineFriendRequest(userDetails.getUser().getId(), userId);
        return ApiResponse.success("Từ chối kết bạn thành công", null);
    }

    /**
     * Thu hồi yêu cầu kết bạn đã gửi.
     */
    @DeleteMapping("/cancel/{userId}")
    public ApiResponse<Void> cancelFriendRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long userId) {
        friendService.cancelFriendRequest(userDetails.getUser().getId(), userId);
        return ApiResponse.success("Thu hồi lời mời kết bạn thành công", null);
    }

    /**
     * Hủy kết bạn.
     */
    @DeleteMapping("/unfriend/{userId}")
    public ApiResponse<Void> unfriend(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long userId) {
        friendService.unfriend(userDetails.getUser().getId(), userId);
        return ApiResponse.success("Hủy kết bạn thành công", null);
    }

    /**
     * Xem danh sách bạn bè hiện tại.
     */
    @GetMapping
    public ApiResponse<List<FriendResponse>> getFriends(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<FriendResponse> friends = friendService.getFriends(userDetails.getUser().getId());
        return ApiResponse.success("Lấy danh sách bạn bè thành công", friends);
    }

    /**
     * Xem danh sách lời mời kết bạn đang chờ xử lý (lời mời nhận được).
     */
    @GetMapping("/requests")
    public ApiResponse<List<FriendResponse>> getPendingRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<FriendResponse> requests = friendService.getPendingRequests(userDetails.getUser().getId());
        return ApiResponse.success("Lấy danh sách lời mời chờ duyệt thành công", requests);
    }

    /**
     * Gợi ý bạn bè thông minh.
     */
    @GetMapping("/suggestions")
    public ApiResponse<List<FriendResponse>> getSuggestions(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<FriendResponse> suggestions = friendService.getFriendSuggestions(userDetails.getUser().getId());
        return ApiResponse.success("Lấy danh sách gợi ý thành công", suggestions);
    }
}
