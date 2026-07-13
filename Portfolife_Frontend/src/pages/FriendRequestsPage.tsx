import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';

interface FriendRequestItem {
  id: number;
  name: string;
  role: string;
  meta: string; // "X bạn chung · Y trước"
  avatar: string;
}

// Dữ liệu mẫu (fix cứng) để dựng giao diện - thay bằng API thật sau
const RECEIVED_REQUESTS: FriendRequestItem[] = [
  {
    id: 1,
    name: 'Lý Thị Bích Ngọc',
    role: 'AI Researcher',
    meta: '6 bạn chung · 1 giờ trước',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    name: 'Vũ Đức Tài',
    role: 'iOS Developer',
    meta: '3 bạn chung · 3 giờ trước',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    name: 'Hồ Thanh Hương',
    role: 'Fullstack Dev',
    meta: '11 bạn chung · Hôm qua',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    name: 'Bùi Quốc Khánh',
    role: 'UX Designer',
    meta: '2 bạn chung · 2 ngày trước',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];

const SENT_REQUESTS: FriendRequestItem[] = [
  {
    id: 5,
    name: 'Nguyễn Bảo Linh',
    role: 'Graphic Designer',
    meta: '2 ngày trước',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 6,
    name: 'Trần Công Minh',
    role: 'React Developer',
    meta: '5 ngày trước',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 7,
    name: 'Phạm Hải Yến',
    role: 'Product Manager',
    meta: '1 tuần trước',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 8,
    name: 'Đỗ Quang Huy',
    role: 'Data Engineer',
    meta: '2 tuần trước',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  },
];

const FriendRequestsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RECEIVED' | 'SENT'>('RECEIVED');
  const [received, setReceived] = useState<FriendRequestItem[]>(RECEIVED_REQUESTS);
  const [sent, setSent] = useState<FriendRequestItem[]>(SENT_REQUESTS);

  const handleAccept = (id: number) => {
    setReceived((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDecline = (id: number) => {
    setReceived((prev) => prev.filter((item) => item.id !== id));
  };

  const handleWithdraw = (id: number) => {
    setSent((prev) => prev.filter((item) => item.id !== id));
  };

  const list = activeTab === 'RECEIVED' ? received : sent;

  return (
    <MainLayout>
      <h1 className="text-2xl font-extrabold text-[#1F1315] mb-6">Lời mời kết bạn</h1>

      {/* Tabs */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => setActiveTab('RECEIVED')}
          className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-200 ${
            activeTab === 'RECEIVED'
              ? 'bg-[#D02B52] text-white shadow-[0_4px_12px_rgba(208,43,82,0.25)]'
              : 'bg-[#FFF0F3] text-[#D02B52] hover:bg-[#FCE7EB]'
          }`}
        >
          Lời mời nhận được ({received.length})
        </button>
        <button
          onClick={() => setActiveTab('SENT')}
          className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-200 ${
            activeTab === 'SENT'
              ? 'bg-[#D02B52] text-white shadow-[0_4px_12px_rgba(208,43,82,0.25)]'
              : 'bg-[#FFF0F3] text-[#D02B52] hover:bg-[#FCE7EB]'
          }`}
        >
          Lời mời đã gửi ({sent.length})
        </button>
      </div>

      {/* Requests grid */}
      {list.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#FCE7EB] text-gray-400 font-semibold select-none shadow-sm">
          Không có lời mời nào trong mục này.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-[#FCE7EB] shadow-sm"
            >
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-14 h-14 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-base font-bold text-[#1F1315] truncate">{item.name}</h4>
                  <p className="text-sm text-[#8B6B72] font-medium truncate">{item.role}</p>
                  <p className="text-xs text-gray-400 font-medium truncate">{item.meta}</p>
                </div>
              </div>

              {activeTab === 'RECEIVED' ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleAccept(item.id)}
                    className="flex-1 px-4 py-2.5 bg-[#D02B52] hover:bg-[#B01E3E] active:scale-95 text-white text-sm font-bold rounded-full transition-all"
                  >
                    Đồng ý
                  </button>
                  <button
                    onClick={() => handleDecline(item.id)}
                    className="flex-1 px-4 py-2.5 bg-white border border-[#FCE7EB] hover:bg-[#FFF5F6] text-gray-600 text-sm font-bold rounded-full transition-all"
                  >
                    Xóa
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleWithdraw(item.id)}
                  className="w-full px-4 py-2.5 bg-white border border-[#FCE7EB] hover:bg-[#FFF5F6] text-[#D02B52] text-sm font-bold rounded-full transition-all"
                >
                  Thu hồi lời mời
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

export default FriendRequestsPage;