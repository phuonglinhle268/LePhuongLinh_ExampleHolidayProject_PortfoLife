package org.example.portfolife_backend.service;

import org.example.portfolife_backend.model.entity.Post;
import org.example.portfolife_backend.model.entity.User;
import org.example.portfolife_backend.model.enums.ContentStatus;
import org.example.portfolife_backend.repository.PostRepository;
import org.example.portfolife_backend.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SearchService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public SearchService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    /**
     * Tìm kiếm bài đăng theo từ khóa (giới hạn 20 bài đăng mới nhất).
     */
    public List<Post> searchPosts(String query, Long userId) {
        Pageable limit = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        return postRepository.searchPosts(query, userId, ContentStatus.ACTIVE, limit).getContent();
    }

    /**
     * Tìm kiếm người dùng theo từ khóa.
     */
    public List<User> searchUsers(String query) {
        return userRepository.searchUsers(query);
    }
}
