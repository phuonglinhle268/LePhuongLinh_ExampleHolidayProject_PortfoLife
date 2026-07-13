import React, { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
import axiosClient from '../api/axiosClient';
import Swal from 'sweetalert2';

interface NotificationItem {
  id: number;
  name: string;
  action: string;
  time: string;
  avatar: string;
  read: boolean;
}

const NotificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD'>('ALL');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response: any = await axiosClient.get('/api/v1/notifications');
      const list = response.data || [];
      const mapped: NotificationItem[] = list.map((n: any) => ({
        id: n.id,
        name: n.sender?.fullName || n.senderName || 'Hệ thống',
        action: n.content || '',
        time: formatTime(n.createdAt),
        avatar: n.sender?.avatarUrl || `https://images.unsplash.com/photo-${1500000000000 + (n.sender?.id || 1) * 10000}?w=100&auto=format&fit=crop&q=80`,
        read: n.read,
      }));
      setNotifications(mapped);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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

  const handleMarkAsRead = async (id: number) => {
    try {
      await axiosClient.put(`/api/v1/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      Swal.showLoading();
      await axiosClient.put('/api/v1/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      Swal.fire({
        icon: 'success',
        text: 'Đã đánh dấu đọc tất cả thông báo!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err: any) {
      Swal.fire('Lỗi', err.message, 'error');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const list = activeTab === 'ALL' ? notifications : notifications.filter((n) => !n.read);

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-extrabold text-[#1F1315]">Thông báo</h1>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-[#FFF0F3] hover:bg-[#D02B52] hover:text-white text-[#D02B52] font-bold text-xs rounded-full transition-all"
          >
            Đọc tất cả
          </button>
        )}
      </div>

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
      {loading ? (
        <div className="text-center py-12 text-[#D02B52] font-semibold">Đang tải thông báo...</div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#FCE7EB] text-gray-400 font-semibold select-none shadow-sm">
          Không có thông báo nào trong mục này.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#FCE7EB] shadow-sm overflow-hidden">
          {list.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => !item.read && handleMarkAsRead(item.id)}
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