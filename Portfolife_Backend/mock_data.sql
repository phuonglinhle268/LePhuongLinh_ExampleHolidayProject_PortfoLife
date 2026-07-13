-- =========================================================
-- MOCK DATA FOR PORTFOLIFE DATABASE
-- Mật khẩu mặc định cho các tài khoản người dùng thường: 123456
-- Mật khẩu mặc định cho tài khoản quản trị (admin): admin@123
-- =========================================================

USE portfolife;

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
(2, 3, 'Hôm nay mình chia sẻ tài liệu về nguyên lý thiết kế lưới (Grid System) trong thiết kế giao diện Mobile. Hi vọng sẽ giúp ích cho các bạn mới học UX/UI.', 'DOCUMENT', 2, 'PUBLIC', 'ACTIVE', FALSE),
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
