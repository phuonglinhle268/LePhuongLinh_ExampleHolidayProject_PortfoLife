package org.example.portfolife_backend.service;

import org.example.portfolife_backend.dto.response.FriendResponse;
import org.example.portfolife_backend.model.entity.*;
import org.example.portfolife_backend.model.enums.ContentStatus;
import org.example.portfolife_backend.model.enums.FriendRequestStatus;
import org.example.portfolife_backend.model.enums.NotificationReferenceType;
import org.example.portfolife_backend.model.enums.NotificationType;
import org.example.portfolife_backend.repository.*;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FriendService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final FriendshipRepository friendshipRepository;
    private final PostRepository postRepository;
    private final PostTagRepository postTagRepository;
    private final NotificationService notificationService;

    public FriendService(UserRepository userRepository,
                         UserProfileRepository userProfileRepository,
                         FriendRequestRepository friendRequestRepository,
                         FriendshipRepository friendshipRepository,
                         PostRepository postRepository,
                         PostTagRepository postTagRepository,
                         NotificationService notificationService) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.friendRequestRepository = friendRequestRepository;
        this.friendshipRepository = friendshipRepository;
        this.postRepository = postRepository;
        this.postTagRepository = postTagRepository;
        this.notificationService = notificationService;
    }

    /**
     * Gửi yêu cầu kết bạn từ senderId tới receiverId.
     */
    @Transactional
    public void sendFriendRequest(Long senderId, Long receiverId) {
        if (senderId.equals(receiverId)) {
            throw new RuntimeException("Bạn không thể tự gửi lời mời kết bạn cho chính mình");
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người gửi"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người nhận"));

        // Kiểm tra quan hệ bạn bè đã tồn tại chưa
        if (friendshipRepository.existBetweenUsers(senderId, receiverId)) {
            throw new RuntimeException("Hai bạn đã là bạn bè của nhau");
        }

        // Kiểm tra lời mời kết bạn hiện tại
        Optional<FriendRequest> existing = friendRequestRepository.findBetweenUsers(senderId, receiverId);
        if (existing.isPresent()) {
            FriendRequest req = existing.get();
            if (req.getStatus() == FriendRequestStatus.PENDING) {
                throw new RuntimeException("Yêu cầu kết bạn đã tồn tại và đang chờ duyệt");
            }
            // Nếu đã bị hủy/từ chối, cho phép tạo lại
            friendRequestRepository.delete(req);
        }

        // Giới hạn 500 yêu cầu kết bạn PENDING gửi đi
        long pendingCount = friendRequestRepository.countBySenderIdAndStatus(senderId, FriendRequestStatus.PENDING);
        if (pendingCount >= 500) {
            throw new RuntimeException("Bạn đã đạt giới hạn gửi tối đa 500 lời mời kết bạn chờ duyệt");
        }

        FriendRequest request = new FriendRequest();
        request.setSender(sender);
        request.setReceiver(receiver);
        request.setStatus(FriendRequestStatus.PENDING);
        FriendRequest saved = friendRequestRepository.save(request);

        // Gửi thông báo WebSocket thời gian thực
        notificationService.createNotification(
                receiver,
                sender,
                NotificationType.FRIEND_REQUEST,
                sender.getUsername() + " đã gửi cho bạn lời mời kết bạn",
                NotificationReferenceType.FRIEND_REQUEST,
                saved.getId()
        );
    }

    /**
     * Chấp nhận lời mời kết bạn từ senderId.
     */
    @Transactional
    public void acceptFriendRequest(Long receiverId, Long senderId) {
        FriendRequest request = friendRequestRepository.findBySenderIdAndReceiverId(senderId, receiverId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lời mời kết bạn hợp lệ"));

        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new RuntimeException("Yêu cầu kết bạn này đã được xử lý");
        }

        request.setStatus(FriendRequestStatus.ACCEPTED);
        friendRequestRepository.save(request);

        // Tạo liên kết bạn bè trong bảng friendships
        Friendship friendship = new Friendship();
        // Quy ước lưu id nhỏ hơn vào userOne, lớn hơn vào userTwo
        if (senderId < receiverId) {
            friendship.setUserOne(request.getSender());
            friendship.setUserTwo(request.getReceiver());
        } else {
            friendship.setUserOne(request.getReceiver());
            friendship.setUserTwo(request.getSender());
        }
        friendshipRepository.save(friendship);

        // Gửi thông báo xác nhận thành công tới người gửi
        notificationService.createNotification(
                request.getSender(),
                request.getReceiver(),
                NotificationType.FRIEND_ACCEPTED,
                request.getReceiver().getUsername() + " đã chấp nhận lời mời kết bạn của bạn",
                NotificationReferenceType.USER,
                receiverId
        );
    }

    /**
     * Từ chối lời mời kết bạn từ senderId.
     */
    @Transactional
    public void declineFriendRequest(Long receiverId, Long senderId) {
        FriendRequest request = friendRequestRepository.findBySenderIdAndReceiverId(senderId, receiverId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lời mời kết bạn"));

        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new RuntimeException("Yêu cầu kết bạn này đã được xử lý");
        }

        // Xóa hoàn toàn bản ghi yêu cầu kết bạn
        friendRequestRepository.delete(request);
    }

    /**
     * Hủy kết bạn với friendId.
     */
    @Transactional
    public void unfriend(Long userId, Long friendId) {
        Friendship friendship = friendshipRepository.findBetweenUsers(userId, friendId)
                .orElseThrow(() -> new RuntimeException("Hai người hiện không phải là bạn bè"));

        friendshipRepository.delete(friendship);

        // Xóa/Cập nhật yêu cầu kết bạn cũ để có thể gửi lại trong tương lai
        friendRequestRepository.findBetweenUsers(userId, friendId)
                .ifPresent(friendRequestRepository::delete);
    }

    /**
     * Lấy danh sách bạn bè hiện tại của người dùng.
     */
    public List<FriendResponse> getFriends(Long userId) {
        List<Friendship> friendships = friendshipRepository.findAllByUserId(userId);
        List<FriendResponse> friends = new ArrayList<>();

        for (Friendship f : friendships) {
            User friend = f.getUserOne().getId().equals(userId) ? f.getUserTwo() : f.getUserOne();
            UserProfile profile = userProfileRepository.findByUserId(friend.getId()).orElse(null);
            friends.add(new FriendResponse(
                    friend.getId(),
                    friend.getUsername(),
                    profile != null ? profile.getFullName() : friend.getUsername(),
                    profile != null ? profile.getAvatarUrl() : null,
                    profile != null ? profile.getBio() : null,
                    0, 0
            ));
        }

        return friends;
    }

    /**
     * Lấy danh sách lời mời kết bạn chưa được phê duyệt (đã nhận).
     */
    public List<FriendResponse> getPendingRequests(Long userId) {
        return friendRequestRepository.findByReceiverIdAndStatusOrderByCreatedAtDesc(userId, FriendRequestStatus.PENDING)
                .stream()
                .map(req -> {
                    User sender = req.getSender();
                    UserProfile profile = userProfileRepository.findByUserId(sender.getId()).orElse(null);
                    return new FriendResponse(
                            sender.getId(),
                            sender.getUsername(),
                            profile != null ? profile.getFullName() : sender.getUsername(),
                            profile != null ? profile.getAvatarUrl() : null,
                            profile != null ? profile.getBio() : null,
                            0, 0
                    );
                })
                .toList();
    }

    /**
     * Gợi ý bạn bè thông minh dựa trên tag chung từ các bài đăng và bạn bè chung.
     */
    public List<FriendResponse> getFriendSuggestions(Long userId) {
        List<User> allUsers = userRepository.findAll();
        List<Friendship> myFriendships = friendshipRepository.findAllByUserId(userId);
        
        Set<Long> excludedUserIds = new HashSet<>();
        excludedUserIds.add(userId);

        // Loại trừ bạn bè hiện tại
        for (Friendship f : myFriendships) {
            excludedUserIds.add(f.getUserOne().getId());
            excludedUserIds.add(f.getUserTwo().getId());
        }

        // Loại trừ các yêu cầu kết bạn PENDING (cả gửi đi và nhận về)
        friendRequestRepository.findBySenderIdAndStatusOrderByCreatedAtDesc(userId, FriendRequestStatus.PENDING)
                .forEach(req -> excludedUserIds.add(req.getReceiver().getId()));
        friendRequestRepository.findByReceiverIdAndStatusOrderByCreatedAtDesc(userId, FriendRequestStatus.PENDING)
                .forEach(req -> excludedUserIds.add(req.getSender().getId()));

        // Danh sách ID bạn bè của tôi để đếm bạn chung
        Set<Long> myFriendIds = myFriendships.stream()
                .map(f -> f.getUserOne().getId().equals(userId) ? f.getUserTwo().getId() : f.getUserOne().getId())
                .collect(Collectors.toSet());

        // Lấy danh sách tất cả các tag từ bài đăng của tôi
        List<Post> myPosts = postRepository.findByUserIdAndStatus(userId, ContentStatus.ACTIVE, Pageable.unpaged()).getContent();
        Set<String> myTags = myPosts.stream()
                .flatMap(p -> postTagRepository.findByPostId(p.getId()).stream())
                .map(pt -> pt.getTag().getName())
                .collect(Collectors.toSet());

        List<FriendResponse> suggestions = new ArrayList<>();

        for (User user : allUsers) {
            if (excludedUserIds.contains(user.getId())) {
                continue;
            }

            // Đếm bạn chung
            List<Friendship> candidateFriendships = friendshipRepository.findAllByUserId(user.getId());
            Set<Long> candidateFriendIds = candidateFriendships.stream()
                    .map(f -> f.getUserOne().getId().equals(user.getId()) ? f.getUserTwo().getId() : f.getUserOne().getId())
                    .collect(Collectors.toSet());

            Set<Long> mutualFriends = new HashSet<>(myFriendIds);
            mutualFriends.retainAll(candidateFriendIds);
            int mutualCount = mutualFriends.size();

            // Đếm tag chung từ bài đăng
            List<Post> candidatePosts = postRepository.findByUserIdAndStatus(user.getId(), ContentStatus.ACTIVE, Pageable.unpaged()).getContent();
            Set<String> candidateTags = candidatePosts.stream()
                    .flatMap(p -> postTagRepository.findByPostId(p.getId()).stream())
                    .map(pt -> pt.getTag().getName())
                    .collect(Collectors.toSet());

            Set<String> commonTags = new HashSet<>(myTags);
            commonTags.retainAll(candidateTags);
            int commonTagsCount = commonTags.size();

            // Gợi ý nếu có ít nhất 1 bạn chung hoặc có tag chung
            if (mutualCount > 0 || commonTagsCount > 0) {
                UserProfile profile = userProfileRepository.findByUserId(user.getId()).orElse(null);
                suggestions.add(new FriendResponse(
                        user.getId(),
                        user.getUsername(),
                        profile != null ? profile.getFullName() : user.getUsername(),
                        profile != null ? profile.getAvatarUrl() : null,
                        profile != null ? profile.getBio() : null,
                        mutualCount,
                        commonTagsCount
                ));
            }
        }

        // Sắp xếp gợi ý theo số lượng bạn chung và tag chung
        suggestions.sort((s1, s2) -> {
            int score1 = s1.mutualFriendsCount() * 3 + s1.commonTagsCount();
            int score2 = s2.mutualFriendsCount() * 3 + s2.commonTagsCount();
            return Integer.compare(score2, score1);
        });

        return suggestions;
    }
}
