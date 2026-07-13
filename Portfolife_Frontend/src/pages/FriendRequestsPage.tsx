import React, { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
import axiosClient from '../api/axiosClient';
import Swal from 'sweetalert2';
import { FiUserCheck, FiUserX, FiUsers } from 'react-icons/fi';

interface Friend {
  userId: number;
  username: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
}

const FriendRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response: any = await axiosClient.get('/api/v1/friends/requests');
      setRequests(response.data || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (userId: number) => {
    try {
      Swal.showLoading();
      await axiosClient.put(`/api/v1/friends/accept/${userId}`);
      Swal.fire({
        icon: 'success',
        text: 'Đã đồng ý kết bạn!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
      });
      setRequests(prev => prev.filter(r => r.userId !== userId));
    } catch (err: any) {
      Swal.fire('Lỗi', err.message, 'error');
    }
  };

  const handleDecline = async (userId: number) => {
    try {
      Swal.showLoading();
      await axiosClient.delete(`/api/v1/friends/decline/${userId}`);
      Swal.fire({
        icon: 'success',
        text: 'Đã từ chối lời mời kết bạn!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
      });
      setRequests(prev => prev.filter(r => r.userId !== userId));
    } catch (err: any) {
      Swal.fire('Lỗi', err.message, 'error');
    }
  };

  return (
    <MainLayout>
      <div className="bg-white rounded-3xl p-6 border border-[#FCE7EB] shadow-sm space-y-6 animate-fade-in-up">
        <h2 className="text-lg font-extrabold text-[#3C131E] flex items-center">
          <FiUsers className="mr-2 text-[#D02B52]" /> Lời mời kết bạn đang chờ
        </h2>

        {loading ? (
          <div className="text-center py-12 text-[#D02B52] font-semibold">Đang tải danh sách...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-semibold border border-dashed rounded-2xl">
            Không có lời mời kết bạn nào đang chờ xử lý.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {requests.map((r) => (
              <div key={r.userId} className="p-4 bg-white border border-[#FCE7EB] hover:border-[#D02B52]/20 rounded-2xl flex items-center space-x-3.5 transition-all">
                <img
                  src={r.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={r.fullName}
                  className="w-12 h-12 rounded-full object-cover border shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#3C131E] truncate">{r.fullName}</h4>
                  <p className="text-[10px] text-gray-400 font-medium truncate">@{r.username}</p>
                  <p className="text-[10px] text-gray-500 truncate mt-1 italic">{r.bio || 'Chưa viết giới thiệu'}</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => handleAccept(r.userId)}
                    className="px-3.5 py-1.5 bg-[#D02B52] hover:bg-[#B01E3E] text-white font-bold text-[10px] rounded-full transition-colors flex items-center"
                  >
                    <FiUserCheck className="mr-1" /> Chấp nhận
                  </button>
                  <button
                    onClick={() => handleDecline(r.userId)}
                    className="px-3.5 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-600 font-bold text-[10px] rounded-full transition-colors flex items-center"
                  >
                    <FiUserX className="mr-1" /> Từ chối
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

export default FriendRequestsPage;