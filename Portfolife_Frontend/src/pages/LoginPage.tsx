import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import axiosClient from '../api/axiosClient';
import Swal from 'sweetalert2';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleIdentifierChange = (val: string) => {
    setIdentifier(val);
    if (errors.identifier) {
      setErrors((prev) => ({ ...prev, identifier: undefined }));
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: { identifier?: string; password?: string } = {};

    if (!identifier.trim()) {
      tempErrors.identifier = 'Vui lòng nhập tên đăng nhập, email hoặc số điện thoại';
    }
    if (!password) {
      tempErrors.password = 'Vui lòng nhập mật khẩu';
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const response: any = await axiosClient.post('/api/v1/auth/login', {
        identifier,
        password,
      });

      const { accessToken, refreshToken, userId, username, role } = response.data;

      dispatch(
        setCredentials({
          accessToken,
          refreshToken,
          user: { id: userId, username, role },
        })
      );

      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Đăng nhập hệ thống thành công!',
        showConfirmButton: false,
        timer: 1500,
      });

      if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Đăng nhập thất bại',
        text: err.message || 'Sai tên đăng nhập hoặc mật khẩu',
        confirmButtonColor: '#D02B52',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const { value: email } = await Swal.fire({
      title: 'Quên mật khẩu',
      input: 'email',
      inputLabel: 'Nhập địa chỉ email đăng ký tài khoản của bạn:',
      inputPlaceholder: 'email@example.com',
      confirmButtonText: 'Gửi mã OTP',
      confirmButtonColor: '#D02B52',
      cancelButtonText: 'Hủy',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Vui lòng nhập địa chỉ email!';
        }
      }
    });

    if (email) {
      try {
        Swal.showLoading();
        await axiosClient.post('/api/v1/auth/forgot-password', { email });
        
        const { value: formValues } = await Swal.fire({
          title: 'Khôi phục mật khẩu',
          html:
            `<input id="swal-otp" class="swal2-input" placeholder="Mã OTP (6 chữ số)" maxLength="6">` +
            `<input id="swal-password" type="password" class="swal2-input" placeholder="Mật khẩu mới">` +
            `<input id="swal-confirm" type="password" class="swal2-input" placeholder="Xác nhận mật khẩu">`,
          focusConfirm: false,
          confirmButtonText: 'Xác nhận đổi mật khẩu',
          confirmButtonColor: '#D02B52',
          cancelButtonText: 'Hủy',
          showCancelButton: true,
          preConfirm: () => {
            const otpCode = (document.getElementById('swal-otp') as HTMLInputElement).value;
            const newPassword = (document.getElementById('swal-password') as HTMLInputElement).value;
            const confirmPassword = (document.getElementById('swal-confirm') as HTMLInputElement).value;
            
            if (!otpCode || !newPassword || !confirmPassword) {
              Swal.showValidationMessage('Vui lòng điền đầy đủ các thông tin!');
              return false;
            }
            if (newPassword !== confirmPassword) {
              Swal.showValidationMessage('Mật khẩu xác nhận không trùng khớp!');
              return false;
            }
            return { otpCode, newPassword, confirmPassword };
          }
        });

        if (formValues) {
          Swal.showLoading();
          await axiosClient.post('/api/v1/auth/reset-password', {
            email,
            otpCode: formValues.otpCode,
            newPassword: formValues.newPassword,
            confirmPassword: formValues.confirmPassword,
          });

          Swal.fire({
            icon: 'success',
            title: 'Thành công',
            text: 'Mật khẩu đã được thay đổi thành công! Vui lòng đăng nhập lại.',
            confirmButtonColor: '#D02B52',
          });
        }
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: err.message || 'Có lỗi xảy ra, vui lòng thử lại',
          confirmButtonColor: '#D02B52',
        });
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#FFF5F6] p-4">
      {/* Expanded floated Login Card */}
      <div className="w-full max-w-[540px] bg-white/95 backdrop-blur-[6px] rounded-3xl p-12 shadow-[0_20px_50px_rgba(208,43,82,0.12),0_10px_25px_rgba(208,43,82,0.08)] border border-[#FCE7EB] animate-fade-in-up">
        
        <Link to="/" className="inline-flex items-center text-sm font-semibold text-[#D02B52] hover:underline mb-8 select-none">
          <span className="mr-1.5">←</span> Trang chủ
        </Link>

        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-[#D02B52] font-serif tracking-tight select-none">
            PortfoLife
          </h2>
          <p className="mt-2 text-base text-[#8B6B72] select-none">
            Chào mừng trở lại!
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#8B6B72] uppercase tracking-wider mb-2 select-none">
              Tên người dùng
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => handleIdentifierChange(e.target.value)}
              placeholder="@username"
              className={`w-full px-5 py-3.5 bg-[#FFF5F6] border ${
                errors.identifier ? 'border-red-500' : 'border-[#FCE7EB]'
              } focus:border-[#D02B52] focus:outline-none rounded-xl text-base placeholder-gray-400 transition-all`}
            />
            {errors.identifier && (
              <span className="text-red-500 text-xs mt-1.5 block font-semibold animate-pulse">
                {errors.identifier}
              </span>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-[#8B6B72] uppercase tracking-wider select-none">
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-bold text-[#D02B52] hover:underline select-none"
              >
                Quên mật khẩu?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-5 py-3.5 bg-[#FFF5F6] border ${
                errors.password ? 'border-red-500' : 'border-[#FCE7EB]'
              } focus:border-[#D02B52] focus:outline-none rounded-xl text-base placeholder-gray-400 transition-all`}
            />
            {errors.password && (
              <span className="text-red-500 text-xs mt-1.5 block font-semibold animate-pulse">
                {errors.password}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <Link
              to="/register"
              className="text-sm font-bold text-[#D02B52] hover:underline select-none"
            >
              Chưa có tài khoản
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#D02B52] hover:bg-[#B01E3E] active:scale-95 disabled:opacity-50 text-white text-sm font-bold rounded-full shadow-[0_4px_12px_rgba(208,43,82,0.3)] hover:shadow-[0_6px_16px_rgba(208,43,82,0.4)] transition-all duration-200"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;