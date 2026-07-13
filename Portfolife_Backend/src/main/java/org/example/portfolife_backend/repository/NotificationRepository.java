package org.example.portfolife_backend.repository;

import org.example.portfolife_backend.model.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);
    List<Notification> findByReceiverIdAndReadOrderByCreatedAtDesc(Long receiverId, boolean read);
}
