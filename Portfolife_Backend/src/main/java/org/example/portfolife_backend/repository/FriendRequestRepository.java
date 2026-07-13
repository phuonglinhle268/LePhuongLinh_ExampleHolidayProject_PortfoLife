package org.example.portfolife_backend.repository;

import org.example.portfolife_backend.model.entity.FriendRequest;
import org.example.portfolife_backend.model.enums.FriendRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    
    Optional<FriendRequest> findBySenderIdAndReceiverId(Long senderId, Long receiverId);
    
    @Query("SELECT fr FROM FriendRequest fr WHERE " +
            "(fr.sender.id = :u1 AND fr.receiver.id = :u2) OR " +
            "(fr.sender.id = :u2 AND fr.receiver.id = :u1)")
    Optional<FriendRequest> findBetweenUsers(@Param("u1") Long u1, @Param("u2") Long u2);
    
    long countBySenderIdAndStatus(Long senderId, FriendRequestStatus status);
    
    List<FriendRequest> findByReceiverIdAndStatusOrderByCreatedAtDesc(Long receiverId, FriendRequestStatus status);
    
    List<FriendRequest> findBySenderIdAndStatusOrderByCreatedAtDesc(Long senderId, FriendRequestStatus status);
}
