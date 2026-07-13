create DATABASE portfolife;
USE portfolife;

-- =========================================================
-- 1. USERS
-- =========================================================
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(15) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    status ENUM('ACTIVE', 'LOCKED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    password_changed_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================================
-- 2. REFRESH TOKENS
-- Token dạng chuỗi ngẫu nhiên (KHÔNG phải JWT) - lưu DB để có thể thu hồi
-- (logout, đổi mật khẩu, khóa tài khoản...). Tách biệt hoàn toàn khỏi access
-- token (JWT) để không thể dùng refresh token thay cho access token.
-- =========================================================
CREATE TABLE refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================
-- 3. PASSWORD RESET OTPS
-- Lưu mã OTP gửi qua email khi user quên mật khẩu (UC-01 mở rộng)
-- =========================================================
CREATE TABLE password_reset_otps (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_password_reset_otps_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================
-- 4. USER PROFILES
-- =========================================================
CREATE TABLE user_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255),
    cover_url VARCHAR(255),
    bio TEXT,
    gender ENUM('MALE', 'FEMALE', 'OTHER'),
    date_of_birth DATE,
    address VARCHAR(255),
    education VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================
-- 5. POST CATEGORIES
-- (Tạo trước posts vì posts sẽ tham chiếu tới bảng này ngay từ đầu)
-- =========================================================
CREATE TABLE post_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================================
-- 6. TAGS
-- =========================================================
CREATE TABLE tags (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- 7. POSTS
-- (post_type & category_id đã gộp thẳng vào đây, không dùng ALTER TABLE)
-- =========================================================
CREATE TABLE posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    post_type ENUM('NORMAL', 'STUDY') NOT NULL DEFAULT 'NORMAL',
    category_id BIGINT NULL,
    visibility ENUM('PUBLIC', 'FRIENDS', 'PRIVATE') NOT NULL DEFAULT 'PUBLIC',
    status ENUM('ACTIVE', 'HIDDEN', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    is_edited BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_posts_category FOREIGN KEY (category_id) REFERENCES post_categories(id) ON DELETE SET NULL
);

-- =========================================================
-- 8. POST IMAGES
-- =========================================================
CREATE TABLE post_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_post_images_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- =========================================================
-- 9. POST TAGS
-- =========================================================
CREATE TABLE post_tags (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,

    CONSTRAINT fk_post_tags_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_post_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    CONSTRAINT uk_post_tags_post_tag UNIQUE (post_id, tag_id)
);

-- =========================================================
-- 10. STUDY DOCUMENTS
-- (Tài liệu đính kèm cho bài đăng dạng STUDY/DOCUMENT)
-- =========================================================
CREATE TABLE study_documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    download_count BIGINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_study_documents_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- =========================================================
-- 11. COMMENTS
-- =========================================================
CREATE TABLE comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    status ENUM('ACTIVE', 'HIDDEN', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    is_edited BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================
-- 12. REACTIONS
-- =========================================================
CREATE TABLE reactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reaction_type ENUM('LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY') NOT NULL DEFAULT 'LIKE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reactions_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT fk_reactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_reactions_post_user UNIQUE (post_id, user_id)
);

-- =========================================================
-- 13. SAVED POSTS
-- =========================================================
CREATE TABLE saved_posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    post_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_saved_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_saved_posts_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT uk_saved_posts_user_post UNIQUE (user_id, post_id)
);

-- =========================================================
-- 14. FRIEND REQUESTS
-- =========================================================
CREATE TABLE friend_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_friend_requests_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friend_requests_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_friend_requests_pair UNIQUE (sender_id, receiver_id),
    CONSTRAINT chk_friend_requests_not_self CHECK (sender_id <> receiver_id)
);

-- =========================================================
-- 15. FRIENDSHIPS
-- =========================================================
CREATE TABLE friendships (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id_1 BIGINT NOT NULL,
    user_id_2 BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_friendships_user_1 FOREIGN KEY (user_id_1) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friendships_user_2 FOREIGN KEY (user_id_2) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_friendships_pair UNIQUE (user_id_1, user_id_2),
    CONSTRAINT chk_friendships_not_self CHECK (user_id_1 <> user_id_2)
);

-- =========================================================
-- 16. NOTIFICATIONS
-- =========================================================
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    receiver_id BIGINT NOT NULL,
    sender_id BIGINT,
    type ENUM(
        'FRIEND_REQUEST',
        'FRIEND_ACCEPTED',
        'POST_REACTION',
        'POST_COMMENT',
        'ADMIN_WARNING'
    ) NOT NULL,
    content VARCHAR(255) NOT NULL,
    reference_type ENUM('POST', 'COMMENT', 'USER', 'FRIEND_REQUEST', 'SYSTEM'),
    reference_id BIGINT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notifications_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =========================================================
-- 17. REPORTS
-- =========================================================
CREATE TABLE reports (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reporter_id BIGINT NOT NULL,
    target_type ENUM('POST', 'COMMENT', 'USER') NOT NULL,
    target_id BIGINT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('PENDING', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================
-- 18. ADMIN ACTION LOGS
-- =========================================================
CREATE TABLE admin_action_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    admin_id BIGINT NOT NULL,
    action_type ENUM(
        'LOCK_USER',
        'UNLOCK_USER',
        'HIDE_POST',
        'DELETE_POST',
        'HIDE_COMMENT',
        'DELETE_COMMENT',
        'RESOLVE_REPORT'
    ) NOT NULL,
    target_type ENUM('USER', 'POST', 'COMMENT', 'REPORT') NOT NULL,
    target_id BIGINT NOT NULL,
    reason TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_admin_action_logs_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================
-- 19. BANNED WORDS
-- =========================================================
CREATE TABLE banned_words (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    word VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- INDEXES
-- =========================================================
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status_created_at ON posts(status, created_at);
CREATE INDEX idx_posts_post_type ON posts(post_type);
CREATE INDEX idx_posts_category_id ON posts(category_id);

CREATE INDEX idx_post_categories_status ON post_categories(status);

CREATE INDEX idx_tags_name ON tags(name);

CREATE INDEX idx_post_images_post_id ON post_images(post_id);

CREATE INDEX idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);

CREATE INDEX idx_study_documents_post_id ON study_documents(post_id);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_status_created_at ON comments(status, created_at);

CREATE INDEX idx_reactions_post_id ON reactions(post_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);

CREATE INDEX idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX idx_saved_posts_post_id ON saved_posts(post_id);

CREATE INDEX idx_friend_requests_sender_id ON friend_requests(sender_id);
CREATE INDEX idx_friend_requests_receiver_id ON friend_requests(receiver_id);
CREATE INDEX idx_friend_requests_status ON friend_requests(status);

CREATE INDEX idx_friendships_user_id_1 ON friendships(user_id_1);
CREATE INDEX idx_friendships_user_id_2 ON friendships(user_id_2);

CREATE INDEX idx_notifications_receiver_read ON notifications(receiver_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);

CREATE INDEX idx_password_reset_otps_user_id ON password_reset_otps(user_id);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

CREATE INDEX idx_banned_words_word ON banned_words(word);


-- =========================================================
-- MOCK DATA FOR PORTFOLIFE DATABASE
-- Mật khẩu mặc định cho các tài khoản là: 123456 (được băm bằng BCrypt)
-- =========================================================

-- =========================================================
-- MOCK DATA FOR PORTFOLIFE DATABASE
-- Mật khẩu mặc định cho các tài khoản người dùng thường: 123456
-- Mật khẩu mặc định cho tài khoản quản trị (admin): admin@123
-- =========================================================


-- Xóa dữ liệu cũ để tránh trùng lặp
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE admin_action_logs;
TRUNCATE TABLE reports;
TRUNCATE TABLE notifications;
TRUNCATE TABLE friendships;
TRUNCATE TABLE friend_requests;
TRUNCATE TABLE saved_posts;
TRUNCATE TABLE reactions;
TRUNCATE TABLE comments;
TRUNCATE TABLE study_documents;
TRUNCATE TABLE post_tags;
TRUNCATE TABLE post_images;
TRUNCATE TABLE posts;
TRUNCATE TABLE tags;
TRUNCATE TABLE post_categories;
TRUNCATE TABLE user_profiles;
TRUNCATE TABLE password_reset_otps;
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- 1. CHÈN BẢNG USERS
-- =========================================================
INSERT INTO users (id, username, email, phone_number, password_hash, role, status) VALUES
(1, 'admin', 'admin@portfolife.com', '0900000000', '$2a$10$pKe8b6FaiWZrzWrgvJrpTOhsrT5r5yvFgl81bVLEBw/3Lfk4iFPDi', 'ADMIN', 'ACTIVE'),
(2, 'minhkhoa_dev', 'minhkhoa@example.com', '0912345678', '$2a$10$PmZDzcT8EZ074zG.zKdj8eQ1MY9XAqxpx6lo1woLW2Vt3jwP.w0xK', 'USER', 'ACTIVE'),
(3, 'thuha_design', 'thuha@example.com', '0987654321', '$2a$10$PmZDzcT8EZ074zG.zKdj8eQ1MY9XAqxpx6lo1woLW2Vt3jwP.w0xK', 'USER', 'ACTIVE'),
(4, 'viethung_qa', 'viethung@example.com', '0901112223', '$2a$10$PmZDzcT8EZ074zG.zKdj8eQ1MY9XAqxpx6lo1woLW2Vt3jwP.w0xK', 'USER', 'ACTIVE'),
(5, 'lananh_marketing', 'lananh@example.com', '0933344455', '$2a$10$PmZDzcT8EZ074zG.zKdj8eQ1MY9XAqxpx6lo1woLW2Vt3jwP.w0xK', 'USER', 'ACTIVE');

-- =========================================================
-- 2. CHÈN BẢNG USER PROFILES
-- =========================================================
INSERT INTO user_profiles (id, user_id, full_name, avatar_url, cover_url, bio, gender, date_of_birth, address, education) VALUES
(1, 1, 'Hệ thống Quản trị viên', NULL, NULL, 'Tài khoản điều trị và quản trị PortfoLife', 'OTHER', '1995-01-01', 'Hà Nội, Việt Nam', 'Đại học Bách Khoa Hà Nội'),
(2, 2, 'Trần Minh Khoa', 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', NULL, 'Lập trình viên đam mê AI và học máy. Thích chia sẻ kiến thức cộng đồng.', 'MALE', '2001-05-15', 'TP. Hồ Chí Minh, Việt Nam', 'Đại học Công nghệ Thông tin - ĐHQG TPHCM'),
(3, 3, 'Lê Thu Hà', 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg', NULL, 'UX/UI Designer. Thích tìm tòi các giải pháp thiết kế ứng dụng tối giản, tinh tế.', 'FEMALE', '2002-09-20', 'Đà Nẵng, Việt Nam', 'Đại học Kiến trúc Đà Nẵng'),
(4, 4, 'Nguyễn Việt Hùng', NULL, NULL, 'QA Engineer tại FPT Software. Chuyên gia automation testing.', 'MALE', '2000-11-12', 'Hà Nội, Việt Nam', 'Đại học Công nghiệp Hà Nội'),
(5, 5, 'Phạm Lan Anh', NULL, NULL, 'Content Creator & Digital Marketer. Thích chụp ảnh và kết nối bạn bè.', 'FEMALE', '2003-03-08', 'Cần Thơ, Việt Nam', 'Đại học Cần Thơ');

-- =========================================================
-- 3. CHÈN BẢNG POST CATEGORIES
-- =========================================================
INSERT INTO post_categories (id, name, description, status) VALUES
(1, 'Công nghệ thông tin', 'Thảo luận về lập trình, phần mềm, phần cứng và các xu hướng công nghệ mới.', 'ACTIVE'),
(2, 'Thiết kế đồ họa', 'Chia sẻ kinh nghiệm thiết kế UI/UX, đồ họa, vẽ minh họa.', 'ACTIVE'),
(3, 'Cuộc sống thường nhật', 'Nơi tâm sự, chia sẻ khoảnh khắc vui buồn trong cuộc sống.', 'ACTIVE');

-- =========================================================
-- 4. CHÈN BẢNG TAGS
-- =========================================================
INSERT INTO tags (id, name) VALUES
(1, 'MachineLearning'),
(2, 'AI'),
(3, 'HọcTập'),
(4, 'Design'),
(5, 'Java'),
(6, 'React'),
(7, 'Dailylife');

-- =========================================================
-- 5. CHÈN BẢNG POSTS
-- =========================================================
INSERT INTO posts (id, user_id, content, post_type, category_id, visibility, status, is_edited) VALUES
(1, 2, 'Vừa hoàn thành module Machine Learning đầu tiên trong khóa học AI! Cảm giác khi model đầu tiên của mình có độ chính xác 92% thật sự rất tuyệt. Cảm ơn cộng đồng PortfoLife đã hỗ trợ mình trong suốt hành trình này.', 'STUDY', 1, 'PUBLIC', 'ACTIVE', FALSE),
(2, 3, 'Hôm nay mình chia sẻ tài liệu về nguyên lý thiết kế lưới (Grid System) trong thiết kế giao diện Mobile. Hi vọng sẽ giúp ích cho các bạn mới học UX/UI.', 'STUDY', 2, 'PUBLIC', 'ACTIVE', FALSE),
(3, 5, 'Một ngày cuối tuần bình yên ở quán cà phê quen thuộc. Nhìn dòng người qua lại bỗng thấy nhẹ nhàng hẳn.', 'NORMAL', 3, 'FRIENDS', 'ACTIVE', FALSE);

-- =========================================================
-- 6. CHÈN BẢNG POST TAGS & IMAGES & DOCUMENTS
-- =========================================================
-- Tags cho bài viết 1 (Khoa)
INSERT INTO post_tags (post_id, tag_id) VALUES
(1, 1), -- MachineLearning
(1, 2), -- AI
(1, 3); -- HọcTập

-- Tags cho bài viết 2 (Hà)
INSERT INTO post_tags (post_id, tag_id) VALUES
(2, 4), -- Design
(2, 3); -- HọcTập

-- Tags cho bài viết 3 (Lan Anh)
INSERT INTO post_tags (post_id, tag_id) VALUES
(3, 7); -- Dailylife

-- Ảnh cho bài viết 1 (Khoa)
INSERT INTO post_images (post_id, image_url) VALUES
(1, 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800');

-- Ảnh cho bài viết 3 (Lan Anh)
INSERT INTO post_images (post_id, image_url) VALUES
(3, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800');

-- Tài liệu đính kèm cho bài viết 2 (Hà)
INSERT INTO study_documents (post_id, file_name, file_url, file_type, file_size, download_count) VALUES
(2, 'Grid_Systems_Mobile_Design.pdf', 'https://res.cloudinary.com/demo/image/upload/sample.pdf', 'pdf', 2453120, 15);

-- =========================================================
-- 7. CHÈN BẢNG COMMENTS
-- =========================================================
INSERT INTO comments (post_id, user_id, content, status) VALUES
(1, 3, 'Chúc mừng anh Khoa nhé! Quá xịn xò luôn ạ.', 'ACTIVE'),
(1, 4, 'Model này có gặp vấn đề overfitting không bạn ơi?', 'ACTIVE'),
(2, 2, 'Tài liệu bổ ích quá, đúng phần em đang tìm kiếm. Cảm ơn chị Hà!', 'ACTIVE');

-- =========================================================
-- 8. CHÈN BẢNG REACTIONS
-- =========================================================
INSERT INTO reactions (post_id, user_id, reaction_type) VALUES
(1, 3, 'LOVE'),
(1, 4, 'LIKE'),
(1, 5, 'LIKE'),
(2, 2, 'LIKE'),
(2, 5, 'WOW'),
(3, 2, 'LIKE');

-- =========================================================
-- 9. CHÈN BẢNG FRIENDSHIPS & REQUESTS
-- =========================================================
-- Kết bạn giữa Khoa (2) và Hà (3) (user_id_1 < user_id_2)
INSERT INTO friendships (user_id_1, user_id_2) VALUES
(2, 3);

-- Kết bạn giữa Khoa (2) và Lan Anh (5)
INSERT INTO friendships (user_id_1, user_id_2) VALUES
(2, 5);

-- Lời mời kết bạn đang chờ từ Hùng (4) gửi cho Khoa (2)
INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES
(4, 2, 'PENDING');

