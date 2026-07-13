import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';

interface NotificationItem {
  id: number;
  name: string;
  action: string;
  time: string;
  avatar: string;
  read: boolean;
}

// Dữ liệu mẫu (fix cứng) để dựng giao diện - thay bằng API thật sau
const NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    name: 'Trần Minh Khoa',
    action: 'đã thích bài viết của bạn',
    time: '5 phút trước',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80',
    read: false,
  },
  {
    id: 2,
    name: 'Lê Thu Hà',
    action: 'đã bình luận: "Tuyệt vời lắm bạn ơi!"',
    time: '20 phút trước',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    read: false,
  },
  {
    id: 3,
    name: 'Vũ Minh Tuấn',
    action: 'đã gửi lời mời kết bạn cho bạn',
    time: '1 giờ trước',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    read: false,
  },
  {
    id: 4,
    name: 'Hoàng Nam Phong',
    action: 'đã chia sẻ bài viết của bạn',
    time: '2 giờ trước',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&auto=format&fit=crop&q=80',
    read: true,
  },
  {
    id: 5,
    name: 'Nguyễn Đức Anh',
    action: 'đã đề cập đến bạn trong một bình luận',
    time: '3 giờ trước',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    read: true,
  },
  {
    id: 6,
    name: 'Bùi Thị Lan',
    action: 'đã thích ảnh hồ sơ mới của bạn',
    time: '5 giờ trước',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    read: true,
  },
  {
    id: 7,
    name: 'Đỗ Quang Huy',
    action: 'đã bắt đầu theo dõi bạn',
    time: '1 ngày trước',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
    read: true,
  },
];

const NotificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD'>('ALL');
  const [notifications, setNotifications] = useState<NotificationItem[]>(NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const list = activeTab === 'ALL' ? notifications : notifications.filter((n) => !n.read);

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <MainLayout>
      <h1 className="text-2xl font-extrabold text-[#1F1315] mb-6">Thông báo</h1>

      {/* Tabs */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-200 ${
            activeTab === 'ALL'
              ? 'bg-[#D02B52] text-white shadow-[0_4px_12px_rgba(208,43,82,0.25)]'
              : 'bg-[#FFF0F3] text-[#D02B52] hover:bg-[#FCE7EB]'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setActiveTab('UNREAD')}
          className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-200 ${
            activeTab === 'UNREAD'
              ? 'bg-[#D02B52] text-white shadow-[0_4px_12px_rgba(208,43,82,0.25)]'
              : 'bg-[#FFF0F3] text-[#D02B52] hover:bg-[#FCE7EB]'
          }`}
        >
          Chưa đọc ({unreadCount})
        </button>
      </div>

      {/* Notification list */}
      {list.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#FCE7EB] text-gray-400 font-semibold select-none shadow-sm">
          Không có thông báo nào trong mục này.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#FCE7EB] shadow-sm overflow-hidden">
          {list.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => handleMarkAsRead(item.id)}
              className={`flex items-center px-8 py-5 cursor-pointer hover:bg-[#FFF5F6] transition-colors ${
                idx !== list.length - 1 ? 'border-b border-[#FCE7EB]' : ''
              }`}
            >
              <img
                src={item.avatar}
                alt={item.name}
                className="w-12 h-12 rounded-full object-cover shrink-0"
              />
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-base text-[#1F1315] leading-snug">
                  <span className="font-bold">{item.name}</span> {item.action}
                </p>
                <p className="text-sm text-[#D02B52] font-medium mt-1">{item.time}</p>
              </div>

              {!item.read && (
                <span className="w-2.5 h-2.5 bg-[#D02B52] rounded-full shrink-0 ml-4" />
              )}
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

export default NotificationPage;