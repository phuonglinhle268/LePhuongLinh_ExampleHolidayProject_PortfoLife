package org.example.portfolife_backend.repository;

import org.example.portfolife_backend.model.entity.PostCategory;
import org.example.portfolife_backend.model.enums.CategoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostCategoryRepository extends JpaRepository<PostCategory, Long> {
    List<PostCategory> findByStatus(CategoryStatus status);
    Optional<PostCategory> findByName(String name);
}
