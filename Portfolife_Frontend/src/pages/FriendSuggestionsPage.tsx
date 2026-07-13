import React, { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
import axiosClient from '../api/axiosClient';
import Swal from 'sweetalert2';
import { FiUserPlus, FiUsers } from 'react-icons/fi';

interface Friend {
  userId: number;
  username: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
}

const FriendSuggestionsPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response: any = await axiosClient.get('/api/v1/friends/suggestions');
      setSuggestions(response.data || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleSendRequest = async (userId: number) => {
    try {
      Swal.showLoading();
      await axiosClient.post(`/api/v1/friends/request/${userId}`);
      Swal.fire({
        icon: 'success',
        text: 'Đã gửi lời mời kết bạn!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
      });
      setSentRequests(prev => [...prev, userId]);
    } catch (err: any) {
      Swal.fire('Lỗi', err.message, 'error');
    }
  };

  const handleCancelRequest = async (userId: number) => {
    try {
      Swal.showLoading();
      await axiosClient.delete(`/api/v1/friends/cancel/${userId}`);
      Swal.fire({
        icon: 'success',
        text: 'Đã thu hồi lời mời kết bạn!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
      });
      setSentRequests(prev => prev.filter(id => id !== userId));
    } catch (err: any) {
      Swal.fire('Lỗi', err.message, 'error');
    }
  };

  return (
    <MainLayout>
      <div className="bg-white rounded-3xl p-6 border border-[#FCE7EB] shadow-sm space-y-6 animate-fade-in-up">
        <h2 className="text-lg font-extrabold text-[#3C131E] flex items-center">
          <FiUsers className="mr-2 text-[#D02B52]" /> Gợi ý kết bạn dành cho bạn
        </h2>

        {loading ? (
          <div className="text-center py-12 text-[#D02B52] font-semibold">Đang tải danh sách gợi ý...</div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-semibold border border-dashed rounded-2xl">
            Không có gợi ý bạn mới nào tại thời điểm này.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suggestions.map((s) => (
              <div key={s.userId} className="p-4 bg-white border border-[#FCE7EB] hover:border-[#D02B52]/20 rounded-2xl flex items-center space-x-3.5 transition-all">
                <img
                  src={s.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={s.fullName}
                  className="w-12 h-12 rounded-full object-cover border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#3C131E] truncate">{s.fullName}</h4>
                  <p className="text-[10px] text-gray-400 font-medium truncate">@{s.username}</p>
                  <p className="text-[10px] text-gray-500 truncate mt-1 italic">{s.bio || 'Chưa viết giới thiệu'}</p>
                </div>
                <div className="shrink-0">
                  {sentRequests.includes(s.userId) ? (
                    <button
                      onClick={() => handleCancelRequest(s.userId)}
                      className="px-3.5 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500 font-bold text-[10px] rounded-full transition-colors duration-150"
                      title="Thu hồi lời mời kết bạn"
                    >
                      Thu hồi
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(s.userId)}
                      className="px-3.5 py-1.5 border border-[#D02B52] hover:bg-[#D02B52] hover:text-white text-[#D02B52] font-bold text-[10px] rounded-full transition-colors flex items-center"
                    >
                      <FiUserPlus className="mr-1" /> Kết bạn
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default FriendSuggestionsPage;