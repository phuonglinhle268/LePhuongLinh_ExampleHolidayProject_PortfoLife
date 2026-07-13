package org.example.portfolife_backend.repository;

import org.example.portfolife_backend.model.entity.Comment;
import org.example.portfolife_backend.model.enums.ContentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    @org.springframework.data.jpa.repository.Query("SELECT c FROM Comment c WHERE c.post.id = :postId AND c.status = :status AND " +
            "c.id NOT IN (SELECT r.targetId FROM Report r WHERE r.reporter.id = :userId AND r.targetType = org.example.portfolife_backend.model.enums.ReportTargetType.COMMENT) AND " +
            "c.user.id NOT IN (SELECT r.targetId FROM Report r WHERE r.reporter.id = :userId AND r.targetType = org.example.portfolife_backend.model.enums.ReportTargetType.USER) " +
            "ORDER BY c.createdAt ASC")
    List<Comment> findActiveCommentsFiltered(@org.springframework.data.repository.query.Param("postId") Long postId, 
                                             @org.springframework.data.repository.query.Param("userId") Long userId, 
                                             @org.springframework.data.repository.query.Param("status") ContentStatus status);

    List<Comment> findByPostIdAndStatusOrderByCreatedAtAsc(Long postId, ContentStatus status);
    Page<Comment> findByPostIdAndStatus(Long postId, ContentStatus status, Pageable pageable);
}
