import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store';
import axiosClient from '../api/axiosClient';
import Swal from 'sweetalert2';
import {
  FiAlertOctagon,
  FiSlash,
  FiUnlock,
  FiTrash2,
  FiBookOpen,
  FiCheckCircle,
  FiLogOut,
  FiPlus
} from 'react-icons/fi';

interface Report {
  id: number;
  reporterId: number;
  targetType: 'POST' | 'COMMENT' | 'USER';
  targetId: number;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
}

interface BannedWord {
  id: number;
  word: string;
  createdAt: string;
}

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<'REPORTS' | 'BANNED_WORDS' | 'USERS'>('REPORTS');
  const [reports, setReports] = useState<Report[]>([]);
  const [bannedWords, setBannedWords] = useState<BannedWord[]>([]);
  const [loading, setLoading] = useState(false);

  // States for user action
  const [targetUserId, setTargetUserId] = useState('');
  const [userReason, setUserReason] = useState('');
  const [newBannedWord, setNewBannedWord] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response: any = await axiosClient.get('/api/v1/admin/reports/pending');
      setReports(response.data || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBannedWords = async () => {
    setLoading(true);
    try {
      const response: any = await axiosClient.get('/api/v1/admin/banned-words');
      setBannedWords(response.data || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'REPORTS') {
      fetchReports();
    } else if (activeTab === 'BANNED_WORDS') {
      fetchBannedWords();
    }
  }, [activeTab]);

  const handleResolveReport = async (reportId: number, targetType: string, targetId: number) => {
    const { value: action } = await Swal.fire({
      title: 'Xử lý báo cáo vi phạm',
      input: 'select',
      inputOptions: {
        RESOLVE: 'Duyệt vi phạm & Ẩn nội dung / Khóa tài khoản',
        REJECT: 'Từ chối báo cáo (Nội dung hợp lệ)',
      },
      inputPlaceholder: 'Chọn hành động xử lý',
      showCancelButton: true,
      confirmButtonText: 'Tiếp tục',
      confirmButtonColor: '#D02B52',
      cancelButtonText: 'Hủy',
    });

    if (!action) return;

    const { value: reason } = await Swal.fire({
      title: 'Lý do xử lý',
      input: 'textarea',
      inputPlaceholder: 'Nhập lý do lưu vào hệ thống...',
      showCancelButton: true,
      confirmButtonText: 'Hoàn tất',
      confirmButtonColor: '#D02B52',
      cancelButtonText: 'Hủy',
      inputValidator: (value) => {
        if (!value) {
          return 'Bạn phải điền lý do xử lý!';
        }
      }
    });

    if (!reason) return;

    try {
      Swal.showLoading();
      if (action === 'RESOLVE') {
        // Thực hiện ẩn hoặc xóa tùy theo loại đối tượng
        if (targetType === 'POST') {
          await axiosClient.post(`/api/v1/admin/posts/${targetId}/hide`, { reason });
        } else if (targetType === 'COMMENT') {
          await axiosClient.post(`/api/v1/admin/comments/${targetId}/hide`, { reason });
        } else if (targetType === 'USER') {
          await axiosClient.post(`/api/v1/admin/users/${targetId}/lock`, { reason });
        }
      }

      // Đánh dấu báo cáo đã xử lý
      await axiosClient.post(`/api/v1/admin/reports/${reportId}/resolve`, { reason });

      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Báo cáo vi phạm đã được giải quyết!',
        confirmButtonColor: '#D02B52',
      });
      fetchReports();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Thất bại',
        text: err.message || 'Lỗi hệ thống',
        confirmButtonColor: '#D02B52',
      });
    }
  };

  const handleAddBannedWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannedWord.trim()) return;

    try {
      Swal.showLoading();
      await axiosClient.post('/api/v1/admin/banned-words', { word: newBannedWord.trim() });
      setNewBannedWord('');
      Swal.fire({
        icon: 'success',
        text: 'Đã thêm từ khóa cấm thành công!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
      });
      fetchBannedWords();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: err.message,
        confirmButtonColor: '#D02B52',
      });
    }
  };

  const handleDeleteBannedWord = async (id: number) => {
    const confirm = await Swal.fire({
      title: 'Xóa từ cấm',
      text: 'Bạn chắc chắn muốn xóa từ khóa này khỏi bộ lọc tự động?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      confirmButtonColor: '#D02B52',
      cancelButtonText: 'Hủy',
    });

    if (confirm.isConfirmed) {
      try {
        await axiosClient.delete(`/api/v1/admin/banned-words/${id}`);
        Swal.fire({
          icon: 'success',
          text: 'Đã xóa từ cấm thành công!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500,
        });
        fetchBannedWords();
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          text: err.message,
          confirmButtonColor: '#D02B52',
        });
      }
    }
  };

  const handleLockUnlockUser = async (action: 'LOCK' | 'UNLOCK') => {
    if (!targetUserId.trim() || !userReason.trim()) {
      Swal.fire({
        icon: 'warning',
        text: 'Vui lòng nhập đầy đủ ID người dùng và lý do!',
        confirmButtonColor: '#D02B52',
      });
      return;
    }

    try {
      Swal.showLoading();
      const userId = parseInt(targetUserId.trim(), 10);
      if (action === 'LOCK') {
        await axiosClient.post(`/api/v1/admin/users/${userId}/lock`, { reason: userReason });
        Swal.fire('Thành công', `Đã khóa tài khoản ID ${userId}`, 'success');
      } else {
        await axiosClient.post(`/api/v1/admin/users/${userId}/unlock`, { reason: userReason });
        Swal.fire('Thành công', `Đã mở khóa tài khoản ID ${userId}`, 'success');
      }
      setTargetUserId('');
      setUserReason('');
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Thất bại',
        text: err.message,
        confirmButtonColor: '#D02B52',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF5F6] flex flex-col font-sans">
      {/* Admin Header */}
      <header className="h-16 bg-white border-b border-[#FCE7EB] px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="text-2xl font-extrabold text-[#D02B52] font-serif tracking-tight select-none">
            PortfoLife Admin
          </span>
          <span className="bg-[#D02B52]/10 text-[#D02B52] font-bold text-[10px] uppercase px-2.5 py-1 rounded-full">
            Dashboard
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs font-bold text-gray-500">Xin chào, {user?.username}</span>
          <button
            onClick={handleLogout}
            className="flex items-center text-xs font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-full transition-all"
          >
            <FiLogOut className="mr-1.5" /> Đăng xuất
          </button>
        </div>
      </header>

      {/* Content layout */}
      <div className="flex flex-1 w-full max-w-[1200px] mx-auto px-6 py-8 gap-6 items-start">
        {/* Navigation Sidebar */}
        <aside className="w-56 bg-white rounded-3xl p-5 border border-[#FCE7EB] shadow-sm shrink-0">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('REPORTS')}
              className={`w-full flex items-center px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'REPORTS' ? 'bg-[#D02B52] text-white shadow-sm' : 'text-gray-600 hover:bg-[#FFF5F6] hover:text-[#D02B52]'
              }`}
            >
              <FiAlertOctagon className="mr-2 text-sm shrink-0" />
              Báo cáo vi phạm
            </button>

            <button
              onClick={() => setActiveTab('BANNED_WORDS')}
              className={`w-full flex items-center px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'BANNED_WORDS' ? 'bg-[#D02B52] text-white shadow-sm' : 'text-gray-600 hover:bg-[#FFF5F6] hover:text-[#D02B52]'
              }`}
            >
              <FiBookOpen className="mr-2 text-sm shrink-0" />
              Từ khóa cấm
            </button>

            <button
              onClick={() => setActiveTab('USERS')}
              className={`w-full flex items-center px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'USERS' ? 'bg-[#D02B52] text-white shadow-sm' : 'text-gray-600 hover:bg-[#FFF5F6] hover:text-[#D02B52]'
              }`}
            >
              <FiSlash className="mr-2 text-sm shrink-0" />
              Khóa / Mở tài khoản
            </button>
          </nav>
        </aside>

        {/* Action Panel */}
        <main className="flex-1 min-w-0 bg-white rounded-3xl p-8 border border-[#FCE7EB] shadow-sm">
          {/* TAB 1: REPORTS */}
          {activeTab === 'REPORTS' && (
            <div className="space-y-6 animate-fade-in-up">
              <h2 className="text-lg font-extrabold text-[#3C131E]">Báo cáo vi phạm chờ duyệt</h2>
              {loading ? (
                <div className="text-center py-12 text-[#D02B52] font-semibold">Đang tải dữ liệu...</div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-semibold border border-dashed rounded-2xl">
                  Tuyệt vời! Không có báo cáo vi phạm nào đang chờ xử lý.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#FCE7EB] text-[#8B6B72] font-bold">
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Đối tượng</th>
                        <th className="py-3 px-4">ID Đối tượng</th>
                        <th className="py-3 px-4">Lý do báo cáo</th>
                        <th className="py-3 px-4">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FFF0F2]">
                      {reports.map((r) => (
                        <tr key={r.id} className="hover:bg-[#FFF5F6]/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold">{r.id}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              r.targetType === 'USER' ? 'bg-orange-100 text-orange-600' :
                              r.targetType === 'POST' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                            }`}>
                              {r.targetType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-[#8A1E37]">{r.targetId}</td>
                          <td className="py-3.5 px-4 text-gray-600 font-medium">{r.reason}</td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleResolveReport(r.id, r.targetType, r.targetId)}
                              className="px-3 py-1.5 bg-[#D02B52] hover:bg-[#B01E3E] text-white font-bold rounded-lg transition-colors flex items-center"
                            >
                              <FiCheckCircle className="mr-1" /> Giải quyết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BANNED WORDS */}
          {activeTab === 'BANNED_WORDS' && (
            <div className="space-y-6 animate-fade-in-up">
              <h2 className="text-lg font-extrabold text-[#3C131E]">Quản lý từ khóa cấm hệ thống</h2>
              
              {/* Form add */}
              <form onSubmit={handleAddBannedWord} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Nhập từ cấm mới (ví dụ: spam, xauxi...)"
                  value={newBannedWord}
                  onChange={(e) => setNewBannedWord(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-[#FFF5F6] border border-[#FCE7EB] focus:border-[#D02B52] focus:outline-none rounded-xl text-xs text-gray-700 transition-all"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#D02B52] hover:bg-[#B01E3E] text-white font-bold rounded-xl text-xs flex items-center transition-colors shadow-sm"
                >
                  <FiPlus className="mr-1" /> Thêm từ cấm
                </button>
              </form>

              {loading ? (
                <div className="text-center py-12 text-[#D02B52] font-semibold">Đang tải dữ liệu...</div>
              ) : bannedWords.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-semibold border border-dashed rounded-2xl">
                  Chưa có từ khóa cấm nào được cài đặt trong bộ lọc.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {bannedWords.map((bw) => (
                    <div key={bw.id} className="flex justify-between items-center bg-[#FFF5F6] border border-[#FCE7EB] px-3.5 py-2 rounded-xl text-xs hover:bg-[#FFF0F2] transition-colors">
                      <span className="font-bold text-[#3C131E]">{bw.word}</span>
                      <button
                        onClick={() => handleDeleteBannedWord(bw.id)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-full transition-colors"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: USER BLOCK ACTIONS */}
          {activeTab === 'USERS' && (
            <div className="space-y-6 animate-fade-in-up max-w-md">
              <h2 className="text-lg font-extrabold text-[#3C131E]">Khóa / Mở khóa tài khoản khẩn cấp</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">ID Tài khoản người dùng</label>
                  <input
                    type="number"
                    placeholder="Nhập ID tài khoản (ví dụ: 2)"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FFF5F6] border border-[#FCE7EB] focus:border-[#D02B52] focus:outline-none rounded-xl text-xs text-gray-700 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Lý do hành động</label>
                  <textarea
                    placeholder="Nhập lý do thực hiện hành động này..."
                    value={userReason}
                    onChange={(e) => setUserReason(e.target.value)}
                    rows={3}
                    className="w-full p-4 bg-[#FFF5F6] border border-[#FCE7EB] focus:border-[#D02B52] focus:outline-none rounded-xl text-xs text-gray-700 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => handleLockUnlockUser('LOCK')}
                    className="flex-1 py-3 bg-[#D02B52] hover:bg-[#B01E3E] text-white font-bold rounded-xl text-xs flex items-center justify-center transition-colors shadow-sm"
                  >
                    <FiSlash className="mr-1.5" /> Khóa tài khoản
                  </button>
                  <button
                    onClick={() => handleLockUnlockUser('UNLOCK')}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs flex items-center justify-center transition-colors shadow-sm"
                  >
                    <FiUnlock className="mr-1.5" /> Mở khóa tài khoản
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
