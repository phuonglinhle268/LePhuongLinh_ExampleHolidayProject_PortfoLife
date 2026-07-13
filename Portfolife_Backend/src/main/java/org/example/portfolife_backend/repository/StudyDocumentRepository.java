package org.example.portfolife_backend.repository;

import org.example.portfolife_backend.model.entity.StudyDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyDocumentRepository extends JpaRepository<StudyDocument, Long> {
    List<StudyDocument> findByPostId(Long postId);
}
