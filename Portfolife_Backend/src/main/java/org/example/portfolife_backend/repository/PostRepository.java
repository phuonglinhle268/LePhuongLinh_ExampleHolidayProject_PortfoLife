package org.example.portfolife_backend.repository;

import org.example.portfolife_backend.model.entity.Post;
import org.example.portfolife_backend.model.enums.ContentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("SELECT p FROM Post p WHERE p.status = :status AND (" +
            "p.user.id = :userId OR " +
            "p.visibility = 'PUBLIC' OR " +
            "(p.visibility = 'FRIENDS' AND EXISTS (SELECT f FROM Friendship f WHERE " +
            "(f.userOne.id = :userId AND f.userTwo.id = p.user.id) OR " +
            "(f.userTwo.id = :userId AND f.userOne.id = p.user.id)))) AND " +
            "p.id NOT IN (SELECT r.targetId FROM Report r WHERE r.reporter.id = :userId AND r.targetType = org.example.portfolife_backend.model.enums.ReportTargetType.POST) AND " +
            "p.user.id NOT IN (SELECT r.targetId FROM Report r WHERE r.reporter.id = :userId AND r.targetType = org.example.portfolife_backend.model.enums.ReportTargetType.USER)")
    List<Post> findFeedPosts(@Param("userId") Long userId, @Param("status") ContentStatus status);

    @Query("SELECT p FROM Post p WHERE p.user.id = :targetUserId AND p.status = :status AND (" +
            "p.user.id = :userId OR " +
            "p.visibility = 'PUBLIC' OR " +
            "(p.visibility = 'FRIENDS' AND EXISTS (SELECT f FROM Friendship f WHERE " +
            "(f.userOne.id = :userId AND f.userTwo.id = p.user.id) OR " +
            "(f.userTwo.id = :userId AND f.userOne.id = p.user.id)))) AND " +
            "p.id NOT IN (SELECT r.targetId FROM Report r WHERE r.reporter.id = :userId AND r.targetType = org.example.portfolife_backend.model.enums.ReportTargetType.POST) AND " +
            "p.user.id NOT IN (SELECT r.targetId FROM Report r WHERE r.reporter.id = :userId AND r.targetType = org.example.portfolife_backend.model.enums.ReportTargetType.USER) " +
            "ORDER BY p.createdAt DESC")
    List<Post> findUserTimelinePosts(@Param("targetUserId") Long targetUserId, @Param("userId") Long userId, @Param("status") ContentStatus status);

    Page<Post> findByUserIdAndStatus(Long userId, ContentStatus status, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.status = :status AND (" +
            "LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "EXISTS (SELECT pt FROM PostTag pt WHERE pt.post = p AND LOWER(pt.tag.name) LIKE LOWER(CONCAT('%', :query, '%')))) AND " +
            "p.id NOT IN (SELECT r.targetId FROM Report r WHERE r.reporter.id = :userId AND r.targetType = org.example.portfolife_backend.model.enums.ReportTargetType.POST) AND " +
            "p.user.id NOT IN (SELECT r.targetId FROM Report r WHERE r.reporter.id = :userId AND r.targetType = org.example.portfolife_backend.model.enums.ReportTargetType.USER)")
    Page<Post> searchPosts(@Param("query") String query, @Param("userId") Long userId, @Param("status") ContentStatus status, Pageable pageable);
}
