import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Swal from 'sweetalert2';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    fullName?: string;
    username?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  // Clear errors onChange
  const handleFieldChange = (field: string, val: string, setter: (v: string) => void) => {
    setter(val);
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: typeof errors = {};

    // Validations
    if (!fullName.trim()) {
      tempErrors.fullName = 'Họ và tên không được để trống';
    }
    if (!username.trim()) {
      tempErrors.username = 'Tên người dùng không được để trống';
    } else if (username.trim().length < 3) {
      tempErrors.username = 'Tên người dùng phải chứa ít nhất 3 ký tự';
    }
    if (!email.trim()) {
      tempErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = 'Địa chỉ email không đúng định dạng';
    }
    if (!phoneNumber.trim()) {
      tempErrors.phoneNumber = 'Số điện thoại không được để trống';
    } else if (!/^(\+84|0)(3|5|7|8|9)[0-9]{8}$/.test(phoneNumber.trim())) {
      tempErrors.phoneNumber = 'Số điện thoại không đúng định dạng (VD: 0912345678)';
    }
    if (!password) {
      tempErrors.password = 'Mật khẩu không được để trống';
    } else if (password.length < 6) {
      tempErrors.password = 'Mật khẩu phải chứa tối thiểu 6 ký tự';
    }
    if (!confirmPassword) {
      tempErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await axiosClient.post('/api/v1/auth/signup', {
        username,
        email,
        phoneNumber,
        password,
        fullName,
      });

      if (gender || dateOfBirth) {
        try {
          const loginResponse: any = await axiosClient.post('/api/v1/auth/login', {
            identifier: username,
            password,
          });

          const { accessToken } = loginResponse.data;

          await axiosClient.put('/api/v1/users/profile', {
            gender: gender || undefined,
            dateOfBirth: dateOfBirth || undefined,
          }, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        } catch (profileErr) {
          console.warn('Không thể tự động cập nhật giới tính/ngày sinh:', profileErr);
        }
      }

      Swal.fire({
        icon: 'success',
        title: 'Đăng ký thành công',
        text: 'Tài khoản của bạn đã được đăng ký thành công!',
        confirmButtonColor: '#D02B52',
      });

      navigate('/login');
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Đăng ký thất bại',
        text: err.message || 'Có lỗi xảy ra trong quá trình tạo tài khoản',
        confirmButtonColor: '#D02B52',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#FFF5F6] p-4">
      {/* Expanded floated Register Card */}
      <div className="w-full max-w-[720px] bg-white/95 backdrop-blur-[6px] rounded-3xl p-12 shadow-[0_20px_50px_rgba(208,43,82,0.12),0_10px_25px_rgba(208,43,82,0.08)] border border-[#FCE7EB] animate-fade-in-up">
        
        <Link to="/" className="inline-flex items-center text-sm font-semibold text-[#D02B52] hover:underline mb-8 select-none">
          <span className="mr-1.5">←</span> Trang chủ
        </Link>

        <div className="mb-8">
          <h2 className="text-4xl font-extrabold text-[#D02B52] font-serif tracking-tight select-none">
            Tạo tài khoản
          </h2>
          <p className="mt-2 text-base text-[#8B6B72] select-none">
            Gia nhập cộng đồng PortfoLife ngay hôm nay
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#8B6B72] uppercase tracking-wider mb-1.5 select-none">
                Họ và tên *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => handleFieldChange('fullName', e.target.value, setFullName)}
                placeholder="Nguyễn Văn An"
                className={`w-full px-5 py-3 bg-[#FFF5F6] border ${
                  errors.fullName ? 'border-red-500' : 'border-[#FCE7EB]'
                } focus:border-[#D02B52] focus:outline-none rounded-xl text-base placeholder-gray-400 transition-all`}
              />
              {errors.fullName && (
                <span className="text-red-500 text-xs mt-1 block font-semibold animate-pulse">
                  {errors.fullName}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8B6B72] uppercase tracking-wider mb-1.5 select-none">
                Tên người dùng *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => handleFieldChange('username', e.target.value, setUsername)}
                placeholder="@vanaan"
                className={`w-full px-5 py-3 bg-[#FFF5F6] border ${
                  errors.username ? 'border-red-500' : 'border-[#FCE7EB]'
                } focus:border-[#D02B52] focus:outline-none rounded-xl text-base placeholder-gray-400 transition-all`}
              />
              {errors.username && (
                <span className="text-red-500 text-xs mt-1 block font-semibold animate-pulse">
                  {errors.username}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#8B6B72] uppercase tracking-wider mb-1.5 select-none">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => handleFieldChange('email', e.target.value, setEmail)}
                placeholder="email@example.com"
                className={`w-full px-5 py-3 bg-[#FFF5F6] border ${
                  errors.email ? 'border-red-500' : 'border-[#FCE7EB]'
                } focus:border-[#D02B52] focus:outline-none rounded-xl text-base placeholder-gray-400 transition-all`}
              />
              {errors.email && (
                <span className="text-red-500 text-xs mt-1 block font-semibold animate-pulse">
                  {errors.email}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8B6B72] uppercase tracking-wider mb-1.5 select-none">
                Số điện thoại *
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => handleFieldChange('phoneNumber', e.target.value, setPhoneNumber)}
                placeholder="0901234567"
                className={`w-full px-5 py-3 bg-[#FFF5F6] border ${
                  errors.phoneNumber ? 'border-red-500' : 'border-[#FCE7EB]'
                } focus:border-[#D02B52] focus:outline-none rounded-xl text-base placeholder-gray-400 transition-all`}
              />
              {errors.phoneNumber && (
                <span className="text-red-500 text-xs mt-1 block font-semibold animate-pulse">
                  {errors.phoneNumber}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#8B6B72] uppercase tracking-wider mb-1.5 select-none">
                Giới tính
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-5 py-3 bg-[#FFF5F6] border border-[#FCE7EB] focus:border-[#D02B52] focus:outline-none rounded-xl text-base text-gray-700 transition-all"
              >
                <option value="">Chọn giới tính</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8B6B72] uppercase tracking-wider mb-1.5 select-none">
                Ngày sinh
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-5 py-3 bg-[#FFF5F6] border border-[#FCE7EB] focus:border-[#D02B52] focus:outline-none rounded-xl text-base text-gray-700 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#8B6B72] uppercase tracking-wider mb-1.5 select-none">
                Mật khẩu *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
                placeholder="••••••••"
                className={`w-full px-5 py-3 bg-[#FFF5F6] border ${
                  errors.password ? 'border-red-500' : 'border-[#FCE7EB]'
                } focus:border-[#D02B52] focus:outline-none rounded-xl text-base placeholder-gray-400 transition-all`}
              />
              {errors.password && (
                <span className="text-red-500 text-xs mt-1 block font-semibold animate-pulse">
                  {errors.password}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8B6B72] uppercase tracking-wider mb-1.5 select-none">
                Xác nhận mật khẩu *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => handleFieldChange('confirmPassword', e.target.value, setConfirmPassword)}
                placeholder="••••••••"
                className={`w-full px-5 py-3 bg-[#FFF5F6] border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-[#FCE7EB]'
                } focus:border-[#D02B52] focus:outline-none rounded-xl text-base placeholder-gray-400 transition-all`}
              />
              {errors.confirmPassword && (
                <span className="text-red-500 text-xs mt-1 block font-semibold animate-pulse">
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Link
              to="/login"
              className="text-sm font-bold text-[#D02B52] hover:underline select-none"
            >
              Đã có tài khoản
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#D02B52] hover:bg-[#B01E3E] active:scale-95 disabled:opacity-50 text-white text-sm font-bold rounded-full shadow-[0_4px_12px_rgba(208,43,82,0.3)] hover:shadow-[0_6px_16px_rgba(208,43,82,0.4)] transition-all duration-200"
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;