package org.example.portfolife_backend.repository;

import org.example.portfolife_backend.model.entity.Reaction;
import org.example.portfolife_backend.model.enums.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    Optional<Reaction> findByPostIdAndUserId(Long postId, Long userId);
    long countByPostIdAndReactionType(Long postId, ReactionType reactionType);
    List<Reaction> findByPostId(Long postId);
}
