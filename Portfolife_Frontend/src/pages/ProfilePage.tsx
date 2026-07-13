import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiEdit2,
  FiShare2,
  FiUserPlus,
  FiImage,
  FiFolder,
  FiHeart,
  FiMessageCircle,
  FiBookmark,
  FiMoreHorizontal,
} from 'react-icons/fi';

// ==== Dữ liệu giả lập (mock) để dựng giao diện - thay bằng API thật sau ====

const PROFILE = {
  handle: '@anhthu_ux',
  fullName: 'Phạm Anh Thư',
  title: 'UI/UX Designer',
  avatar:
    'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=300&auto=format&fit=crop&q=80',
  stats: {
    projects: 12,
    friends: 348,
    followers: '1.2k',
  },
  info: {
    job: 'UI/UX Designer',
    workplace: 'Freelance',
    school: 'HCMUT',
    city: 'TP. Hồ Chí Minh',
    joined: 'Tháng 3, 2023',
  },
};

const FRIENDS = [
  { name: 'Tuấn', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  { name: 'Lan', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
  { name: 'Phong', avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&auto=format&fit=crop&q=80' },
  { name: 'Đăng', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80' },
  { name: 'Linh', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80' },
  { name: 'Hùng', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
];

const MY_POSTS = [
  {
    id: 1,
    author: 'Trần Minh Khoa',
    handle: '@minhkhoa_dev',
    time: '2 giờ trước',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80',
    content:
      'Vừa hoàn thành module Machine Learning đầu tiên trong khóa học AI! Cảm giác khi model đầu tiên của mình có độ chính xác 92% thật sự rất tuyệt. Cảm ơn cộng đồng PortfoLife đã hỗ trợ mình trong suốt hành trình này.',
    tags: ['MachineLearning', 'AI'],
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&auto=format&fit=crop&q=80',
    likes: 142,
    comments: 28,
    shares: 11,
  },
  {
    id: 2,
    author: 'Lê Thu Hà',
    handle: '@thuha_design',
    time: '4 giờ trước',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    content:
      'Chia sẻ một số bố cục mới mình vừa hoàn thiện cho dự án portfolio cá nhân. Rất mong nhận được góp ý từ mọi người trong cộng đồng!',
    tags: ['UIDesign'],
    image: '',
    likes: 87,
    comments: 15,
    shares: 4,
  },
];

const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFF5F6] font-sans">
      {/* Top bar */}
      <header className="relative h-16 bg-[#FFF5F6] border-b border-[#FCE7EB] px-8 flex items-center">
        <Link
          to="/home"
          className="flex items-center text-sm font-semibold text-[#D02B52] hover:underline select-none"
        >
          <span className="mr-1.5">←</span> Quay lại
        </Link>
        <span className="absolute left-1/2 -translate-x-1/2 text-2xl font-extrabold text-[#D02B52] font-serif tracking-tight select-none">
          PortfoLife
        </span>
      </header>

      <div className="max-w-[1200px] mx-auto px-8 py-8">
        {/* Profile header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#FCE7EB]">
          <div className="flex items-center gap-6">
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden ring-4 ring-white shadow-[0_0_40px_rgba(208,43,82,0.15)] shrink-0">
              <img
                src={PROFILE.avatar}
                alt={PROFILE.handle}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-[#1F1315]">{PROFILE.handle}</h1>
              <p className="text-base text-[#8B6B72] font-medium mt-1">
                {PROFILE.fullName} · {PROFILE.title}
              </p>
              <div className="flex items-center gap-6 mt-3 text-sm">
                <span className="text-[#1F1315]">
                  <span className="font-extrabold">{PROFILE.stats.projects}</span>{' '}
                  <span className="text-[#8B6B72] font-medium">Dự án</span>
                </span>
                <span className="text-[#1F1315]">
                  <span className="font-extrabold">{PROFILE.stats.friends}</span>{' '}
                  <span className="text-[#8B6B72] font-medium">Bạn bè</span>
                </span>
                <span className="text-[#1F1315]">
                  <span className="font-extrabold">{PROFILE.stats.followers}</span>{' '}
                  <span className="text-[#8B6B72] font-medium">Theo dõi</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#D02B52] hover:bg-[#B01E3E] active:scale-95 text-white text-sm font-bold rounded-full shadow-[0_4px_12px_rgba(208,43,82,0.25)] transition-all">
              <FiEdit2 className="text-base" /> Chỉnh sửa trang
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#FFF0F3] hover:bg-[#FCE7EB] text-[#D02B52] text-sm font-bold rounded-full transition-all">
              <FiShare2 className="text-base" /> Chia sẻ trang
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#FCE7EB] hover:bg-[#FFF5F6] text-[#1F1315] text-sm font-bold rounded-full transition-all">
              <FiUserPlus className="text-base" /> Gợi ý bạn bè
            </button>
          </div>
        </div>

        {/* Content: 2 columns */}
        <div className="flex flex-col md:flex-row gap-6 mt-8 items-start">
          {/* Left column */}
          <div className="w-full md:w-[340px] shrink-0 space-y-6">
            {/* Thông tin cá nhân */}
            <div className="bg-white rounded-3xl p-6 border border-[#FCE7EB] shadow-sm">
              <h3 className="text-sm font-extrabold text-[#8B6B72] uppercase tracking-wider mb-4">
                Thông tin cá nhân
              </h3>
              <div className="divide-y divide-[#FFF2F4]">
                {[
                  { label: 'Nghề nghiệp', value: PROFILE.info.job },
                  { label: 'Nơi làm việc', value: PROFILE.info.workplace },
                  { label: 'Học tại', value: PROFILE.info.school },
                  { label: 'Thành phố', value: PROFILE.info.city },
                  { label: 'Tham gia', value: PROFILE.info.joined },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-3 text-sm">
                    <span className="text-[#8B6B72] font-medium">{row.label}</span>
                    <span className="text-[#1F1315] font-bold">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bạn bè */}
            <div className="bg-white rounded-3xl p-6 border border-[#FCE7EB] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-[#8B6B72] uppercase tracking-wider">
                  Bạn bè · 8
                </h3>
                <Link
                  to="/friends"
                  className="text-sm font-bold text-[#D02B52] hover:underline flex items-center"
                >
                  Xem tất cả <span className="ml-0.5">›</span>
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {FRIENDS.map((f) => (
                  <div key={f.name} className="flex flex-col items-center">
                    <img
                      src={f.avatar}
                      alt={f.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <span className="text-xs font-semibold text-[#1F1315] mt-2">{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: create post + feed */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Create post box */}
            <div className="bg-white rounded-3xl p-5 border border-[#FCE7EB] shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <img
                    src={PROFILE.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  type="text"
                  readOnly
                  placeholder="Bạn đang nghĩ gì? Chia sẻ hành trình học tập..."
                  className="flex-1 bg-[#FFF5F6] border border-[#FCE7EB] focus:border-[#D02B52] focus:outline-none rounded-full px-5 py-3 text-sm placeholder-gray-400 text-gray-700 transition-all"
                />
              </div>

              <div className="flex justify-between items-center pt-4">
                <div className="flex items-center space-x-6 text-sm font-bold text-[#D02B52]">
                  <button type="button" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                    <FiImage className="text-base shrink-0" />
                    <span>Ảnh/Video</span>
                  </button>
                  <button type="button" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                    <FiFolder className="text-base shrink-0" />
                    <span>Dự án</span>
                  </button>
                  <button type="button" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                    <span className="text-base shrink-0">😊</span>
                    <span>Cảm xúc</span>
                  </button>
                </div>

                <button
                  type="button"
                  className="px-6 py-3 bg-[#D02B52] hover:bg-[#B01E3E] active:scale-95 text-white text-sm font-bold rounded-full shadow-[0_4px_12px_rgba(208,43,82,0.25)] flex items-center transition-all"
                >
                  <svg className="w-4 h-4 mr-2 fill-current transform rotate-45" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  Đăng
                </button>
              </div>
            </div>

            {/* Feed of posts */}
            {MY_POSTS.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-3xl p-6 border border-[#FCE7EB] shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                      <img
                        src={post.avatar}
                        alt={post.author}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1F1315]">{post.author}</h4>
                      <p className="text-xs text-gray-400 font-medium">
                        {post.handle} · {post.time}
                      </p>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-[#FFF5F6] rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                    <FiMoreHorizontal className="text-xl" />
                  </button>
                </div>

                {/* Content */}
                <div className="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap font-medium">
                  {post.content}
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-[#FFF0F2] text-[#D02B52] rounded-full text-xs font-bold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Image */}
                {post.image && (
                  <div className="mb-4 rounded-2xl overflow-hidden border border-[#FCE7EB]">
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full max-h-[380px] object-cover"
                    />
                  </div>
                )}

                {/* Interaction bar */}
                <div className="flex items-center justify-between border-t border-[#FCE7EB] pt-4 text-sm text-[#8B6B72] font-bold">
                  <div className="flex items-center space-x-6">
                    <button className="flex items-center space-x-1.5 hover:text-[#D02B52] transition-colors">
                      <FiHeart className="text-lg" />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1.5 hover:text-[#D02B52] transition-colors">
                      <FiMessageCircle className="text-lg" />
                      <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-1.5 hover:text-[#D02B52] transition-colors">
                      <FiShare2 className="text-lg" />
                      <span>{post.shares}</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1.5 hover:text-[#D02B52] transition-colors">
                      <FiBookmark className="text-lg" />
                      <span>Lưu</span>
                    </button>
                    <span className="text-[#D02B52] hover:underline cursor-pointer select-none">
                      Xem thêm
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;