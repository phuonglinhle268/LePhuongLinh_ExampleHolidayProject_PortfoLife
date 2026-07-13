import React, { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
import axiosClient from '../api/axiosClient';
import Swal from 'sweetalert2';
import { FiShare2, FiBookmark } from 'react-icons/fi';

interface SavedPostItem {
  id: number;
  title: string;
  thumbnail: string;
  authorName: string;
  authorAvatar: string;
  time: string;
}

const SavedPage: React.FC = () => {
  const [savedPosts, setSavedPosts] = useState<SavedPostItem[]>([]);
  const [loading, setLoading] = useState(false);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const d = new Date(timeStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHrs < 1) return 'Vừa xong';
    if (diffHrs < 24) return `${diffHrs} giờ trước`;
    return d.toLocaleDateString('vi-VN');
  };

  const fetchSavedPosts = async () => {
    setLoading(true);
    try {
      const response: any = await axiosClient.get('/api/v1/posts/saved');
      const list = response.data || [];
      const mapped: SavedPostItem[] = list.map((p: any) => ({
        id: p.id,
        title: p.content || '',
        thumbnail: p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls[0] : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        authorName: p.userFullName || p.username || 'Người dùng',
        authorAvatar: p.userAvatarUrl || `https://images.unsplash.com/photo-${1500000000000 + p.userId * 10000}?w=100&auto=format&fit=crop&q=80`,
        time: formatTime(p.createdAt),
      }));
      setSavedPosts(mapped);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPosts();
  }, []);

  const handleUnsave = async (postId: number) => {
    try {
      await axiosClient.post(`/api/v1/posts/${postId}/save`);
      setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
      Swal.fire({
        icon: 'success',
        text: 'Đã bỏ lưu bài viết!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err: any) {
      Swal.fire('Lỗi', err.message, 'error');
    }
  };

  return (
    <MainLayout>
      <h1 className="text-2xl font-extrabold text-[#1F1315] mb-6">Bài viết đã lưu</h1>

      {loading ? (
        <div className="text-center py-12 text-[#D02B52] font-semibold">Đang tải bài viết đã lưu...</div>
      ) : savedPosts.length === 0 ? (
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
                    className="w-6 h-6 rounded-full object-cover shrink-0"
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