package org.example.portfolife_backend.model.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Map với bảng `post_tags` - bảng trung gian quan hệ n-n giữa Post và Tag.
 * Unique constraint (post_id, tag_id) đảm bảo 1 tag không bị gắn trùng vào
 * cùng 1 post.
 */
@Entity
@Table(name = "post_tags", uniqueConstraints = {
        @UniqueConstraint(name = "uk_post_tags_post_tag", columnNames = {"post_id", "tag_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class PostTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", nullable = false)
    private Tag tag;
}