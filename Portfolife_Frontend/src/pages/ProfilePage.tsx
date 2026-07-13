import React, { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
import axiosClient from '../api/axiosClient';
import Swal from 'sweetalert2';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBookOpen, FiEdit2, FiSave } from 'react-icons/fi';

interface UserProfileResponse {
  userId: number;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  fullName: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  education?: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit fields
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [education, setEducation] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response: any = await axiosClient.get('/api/v1/users/profile');
      const data: UserProfileResponse = response.data;
      setProfile(data);
      
      // Initialize form
      setFullName(data.fullName || '');
      setBio(data.bio || '');
      setEmail(data.email || '');
      setPhoneNumber(data.phoneNumber || '');
      setAddress(data.address || '');
      setEducation(data.education || '');
      setGender(data.gender || 'OTHER');
      setDateOfBirth(data.dateOfBirth || '');
      setAvatarUrl(data.avatarUrl || '');
      setCoverUrl(data.coverUrl || '');
    } catch (err: any) {
      console.error(err.message);
      Swal.fire('Lỗi', 'Không thể tải thông tin cá nhân', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      Swal.showLoading();
      await axiosClient.put('/api/v1/users/profile', {
        fullName,
        bio,
        avatarUrl,
        coverUrl,
        gender,
        dateOfBirth: dateOfBirth || null,
        address,
        education,
        email,
        phoneNumber,
      });

      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Cập nhật thông tin cá nhân thành công!',
        showConfirmButton: false,
        timer: 1500,
      });

      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Thất bại',
        text: err.message || 'Lỗi cập nhật thông tin',
        confirmButtonColor: '#D02B52',
      });
    }
  };

  if (loading && !profile) {
    return (
      <MainLayout>
        <div className="bg-white rounded-3xl p-12 text-center border border-[#FCE7EB] text-[#D02B52] font-semibold">
          Đang tải thông tin cá nhân...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-white rounded-3xl border border-[#FCE7EB] shadow-sm overflow-hidden animate-fade-in-up">
        {/* Cover Image Banner */}
        <div className="h-44 bg-gradient-to-r from-[#D02B52] to-[#B01E3E] relative">
          {profile?.coverUrl && (
            <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          )}
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-[#FFF0F2] overflow-hidden shadow-md">
              <img
                src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Profile Card Body */}
        <div className="pt-16 p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-extrabold text-[#3C131E] flex items-center">
                {profile?.fullName}
                {profile?.role === 'ADMIN' && (
                  <span className="ml-2.5 bg-red-100 text-red-600 font-bold text-[9px] uppercase px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">@{profile?.username}</p>
            </div>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-[#D02B52] hover:bg-[#D02B52] hover:text-white text-[#D02B52] font-bold text-xs rounded-full transition-all flex items-center"
              >
                <FiEdit2 className="mr-1.5" /> Chỉnh sửa
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-500 font-bold text-xs rounded-full transition-all"
              >
                Hủy chỉnh sửa
              </button>
            )}
          </div>

          <p className="text-xs text-gray-600 font-medium italic bg-[#FFF5F6] p-3 rounded-2xl border border-[#FCE7EB]">
            {profile?.bio || 'Chưa cập nhật giới thiệu cá nhân.'}
          </p>

          {!isEditing ? (
            /* View Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="space-y-3.5">
                <div className="flex items-center text-gray-600 font-semibold">
                  <FiMail className="mr-2.5 text-[#D02B52] text-sm shrink-0" />
                  <span>Email: <span className="text-[#3C131E] ml-1">{profile?.email || 'Chưa cập nhật'}</span></span>
                </div>
                <div className="flex items-center text-gray-600 font-semibold">
                  <FiPhone className="mr-2.5 text-[#D02B52] text-sm shrink-0" />
                  <span>Số điện thoại: <span className="text-[#3C131E] ml-1">{profile?.phoneNumber || 'Chưa cập nhật'}</span></span>
                </div>
                <div className="flex items-center text-gray-600 font-semibold">
                  <FiUser className="mr-2.5 text-[#D02B52] text-sm shrink-0" />
                  <span>Giới tính: <span className="text-[#3C131E] ml-1">{profile?.gender === 'MALE' ? 'Nam' : profile?.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</span></span>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center text-gray-600 font-semibold">
                  <FiMapPin className="mr-2.5 text-[#D02B52] text-sm shrink-0" />
                  <span>Địa chỉ: <span className="text-[#3C131E] ml-1">{profile?.address || 'Chưa cập nhật'}</span></span>
                </div>
                <div className="flex items-center text-gray-600 font-semibold">
                  <FiBookOpen className="mr-2.5 text-[#D02B52] text-sm shrink-0" />
                  <span>Học vấn: <span className="text-[#3C131E] ml-1">{profile?.education || 'Chưa cập nhật'}</span></span>
                </div>
                <div className="flex items-center text-gray-600 font-semibold">
                  <FiUser className="mr-2.5 text-[#D02B52] text-sm shrink-0" />
                  <span>Ngày sinh: <span className="text-[#3C131E] ml-1">{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span></span>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Mode Form */
            <form onSubmit={handleUpdateProfile} className="space-y-5 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Họ và tên</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FFF5F6] border border-[#FCE7EB] focus:border-[#D02B52] focus:outline-none rounded-xl text-xs text-gray-700 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FFF5F6] border border-[#FCE7EB] focus:border-[#D02B52] focus:outline-none rounded-xl text-xs text-gray-700 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Số điện thoại</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FFF5F6] border border-[#FCE7EB] focus:border-[#D02B52] focus:outline-none rounded-xl text-xs text-gray-700 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Địa chỉ</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FFF5F6] border border-[#FCE7EB] focus:border-[#D02B52] focus:outline-none rounded-xl text-xs text-gray-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Học vấn</label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FFF5F6] border border-[#FCE7EB] focus:border-[#D02B52] focus:outline-none rounded-xl text-xs text-gray-700 font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Giới tính</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#FFF5F6] border border-[#FCE7EB] focus:border-[#D02B52] focus:outline-none rounded-xl text-xs text-gray-700 font-medium"
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Ngày sinh</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FFF5F6] border border-[#FCE7EB] focus:border-[#D02B52] focus:outline-none rounded-xl text-xs text-gray-700 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Link ảnh đại diện (avatar)</label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FFF5F6] border border-[#FCE7EB] focus:border-[#D02B52] focus:outline-none rounded-xl text-xs text-gray-700 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Link ảnh bìa (cover)</label>
                  <input
                    type="text"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#FFF5F6] border border-[#FCE7EB] focus:border-[#D02B52] focus:outline-none rounded-xl text-xs text-gray-700 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Giới thiệu ngắn (bio)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-[#FFF5F6] border border-[#FCE7EB] focus:border-[#D02B52] focus:outline-none rounded-xl text-xs text-gray-700 font-medium resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#D02B52] hover:bg-[#B01E3E] text-white font-bold text-xs rounded-full shadow-md flex items-center transition-colors"
                >
                  <FiSave className="mr-1.5" /> Lưu thay đổi
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;