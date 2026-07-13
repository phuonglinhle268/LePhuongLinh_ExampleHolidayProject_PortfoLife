import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';
import { FiShare2, FiBookmark } from 'react-icons/fi';

interface SavedPostItem {
  id: number;
  title: string;
  thumbnail: string;
  authorName: string;
  authorAvatar: string;
  time: string;
}

// Dữ liệu mẫu (fix cứng) để dựng giao diện - thay bằng API thật sau
const SAVED_POSTS: SavedPostItem[] = [
  {
    id: 1,
    title: 'Vừa hoàn thành module Machine Learning đầu tiên trong khóa học AI!',
    thumbnail:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&auto=format&fit=crop&q=80',
    authorName: 'Trần Minh Khoa',
    authorAvatar:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80',
    time: '2 giờ trước',
  },
  {
    id: 2,
    title: 'Portfolio UI/UX mới của mình đã live rồi! Mất 3 tuần để hoàn thiện.',
    thumbnail:
      'https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=200&auto=format&fit=crop&q=80',
    authorName: 'Lê Thu Hà',
    authorAvatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    time: '5 giờ trước',
  },
  {
    id: 3,
    title: 'Roadmap học Full-Stack Web Development trong 6 tháng từ cơ bản đến nâng cao.',
    thumbnail:
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=200&auto=format&fit=crop&q=80',
    authorName: 'Nguyễn Đức Anh',
    authorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    time: 'Hôm qua',
  },
  {
    id: 4,
    title: 'Chia sẻ bộ UI Kit Figma miễn phí mình tự thiết kế, 200+ components.',
    thumbnail:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&auto=format&fit=crop&q=80',
    authorName: 'Vũ Minh Tuấn',
    authorAvatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    time: '2 ngày trước',
  },
];

const SavedPage: React.FC = () => {
  const [savedPosts, setSavedPosts] = useState<SavedPostItem[]>(SAVED_POSTS);

  const handleUnsave = (id: number) => {
    setSavedPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <MainLayout>
      <h1 className="text-2xl font-extrabold text-[#1F1315] mb-6">Bài viết đã lưu</h1>

      {savedPosts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#FCE7EB] text-gray-400 font-semibold select-none shadow-sm">
          Bạn chưa lưu bài viết nào.
        </div>
      ) : (
        <div className="space-y-5">
          {savedPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-3xl p-5 border border-[#FCE7EB] shadow-sm flex items-center gap-5"
            >
              <img
                src={post.thumbnail}
                alt={post.title}
                className="w-24 h-24 rounded-2xl object-cover shrink-0"
              />

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-[#1F1315] mb-2 truncate">
                  {post.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-[#8B6B72] font-medium">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span>
                    Đã lưu bài viết từ{' '}
                    <span className="font-bold text-[#1F1315]">{post.authorName}</span>
                    {' · '}
                    {post.time}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <button className="flex items-center gap-1.5 px-4 py-2 border border-[#FCE7EB] hover:bg-[#FFF5F6] text-[#D02B52] text-sm font-bold rounded-full transition-all">
                    <FiShare2 className="text-sm" /> Chia sẻ
                  </button>
                  <button
                    onClick={() => handleUnsave(post.id)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-[#FCE7EB] hover:bg-[#FFF5F6] text-[#8B6B72] text-sm font-bold rounded-full transition-all"
                  >
                    <FiBookmark className="text-sm" /> Bỏ lưu
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

export default SavedPage;