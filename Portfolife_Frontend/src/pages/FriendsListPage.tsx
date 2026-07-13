import React, { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
import axiosClient from '../api/axiosClient';
import Swal from 'sweetalert2';
import { FiUserMinus, FiUsers } from 'react-icons/fi';

interface Friend {
  userId: number;
  username: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
}

const FriendsListPage: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const response: any = await axiosClient.get('/api/v1/friends');
      setFriends(response.data || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleUnfriend = async (userId: number, name: string) => {
    const confirm = await Swal.fire({
      title: 'Hủy kết bạn',
      text: `Bạn thực sự muốn hủy kết bạn với ${name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Hủy kết bạn',
      confirmButtonColor: '#D02B52',
      cancelButtonText: 'Đóng',
    });

    if (confirm.isConfirmed) {
      try {
        Swal.showLoading();
        await axiosClient.delete(`/api/v1/friends/unfriend/${userId}`);
        Swal.fire('Thành công', 'Đã hủy kết bạn thành công', 'success');
        setFriends(prev => prev.filter(f => f.userId !== userId));
      } catch (err: any) {
        Swal.fire('Lỗi', err.message, 'error');
      }
    }
  };

  return (
    <MainLayout>
      <div className="bg-white rounded-3xl p-6 border border-[#FCE7EB] shadow-sm space-y-6 animate-fade-in-up">
        <h2 className="text-lg font-extrabold text-[#3C131E] flex items-center">
          <FiUsers className="mr-2 text-[#D02B52]" /> Danh sách bạn bè ({friends.length})
        </h2>

        {loading ? (
          <div className="text-center py-12 text-[#D02B52] font-semibold">Đang tải danh sách bạn bè...</div>
        ) : friends.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-semibold border border-dashed rounded-2xl">
            Bạn chưa kết bạn với ai. Hãy tìm bạn bè hoặc xem mục gợi ý nhé!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {friends.map((f) => (
              <div key={f.userId} className="p-4 bg-white border border-[#FCE7EB] hover:border-[#D02B52]/20 rounded-2xl flex items-center space-x-3.5 transition-all">
                <img
                  src={f.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={f.fullName}
                  className="w-12 h-12 rounded-full object-cover border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#3C131E] truncate">{f.fullName}</h4>
                  <p className="text-[10px] text-gray-400 font-medium truncate">@{f.username}</p>
                  <p className="text-[10px] text-gray-500 truncate mt-1 italic">{f.bio || 'Chưa viết giới thiệu'}</p>
                </div>
                <div className="shrink-0">
                  <button
                    onClick={() => handleUnfriend(f.userId, f.fullName)}
                    className="px-3.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-500 font-bold text-[10px] rounded-full transition-colors flex items-center"
                  >
                    <FiUserMinus className="mr-1" /> Hủy kết bạn
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FriendsListPage;
