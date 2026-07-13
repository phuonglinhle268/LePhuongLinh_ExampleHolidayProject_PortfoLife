package org.example.portfolife_backend.repository;

import org.example.portfolife_backend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByPhoneNumber(String phoneNumber);

    /**
     * Dùng cho login: cho phép đăng nhập bằng username HOẶC email HOẶC số điện thoại.
     * Gọi với cùng 1 giá trị identifier cho cả 3 tham số.
     */
    Optional<User> findByUsernameOrEmailOrPhoneNumber(String username, String email, String phoneNumber);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.status <> 'DELETED' AND (" +
            "LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "EXISTS (SELECT up FROM UserProfile up WHERE up.user = u AND LOWER(up.fullName) LIKE LOWER(CONCAT('%', :query, '%'))))")
    List<User> searchUsers(@org.springframework.data.repository.query.Param("query") String query);
}

