package org.example.portfolife_backend.repository;

import org.example.portfolife_backend.model.entity.BannedWord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BannedWordRepository extends JpaRepository<BannedWord, Long> {
    Optional<BannedWord> findByWord(String word);
    boolean existsByWord(String word);
}
