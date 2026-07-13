import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  const handleStart = () => {
    if (isAuthenticated) {
      if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#FFF5F6] p-4 relative overflow-hidden">
      {/* Soft background shape - smaller and centered behind logo */}
      <div className="absolute w-[180px] h-[180px] rounded-full bg-[#FCE7EB] opacity-60 z-0 -translate-y-4 select-none pointer-events-none" />

      <div className="z-10 text-center flex flex-col items-center animate-fade-in-up">
        <h1 className="text-8xl md:text-[9.5rem] font-serif font-extrabold text-[#D02B52] tracking-tight drop-shadow-sm select-none leading-none">
          PortfoLife
        </h1>
        <p className="mt-5 text-[10px] md:text-xs font-medium text-[#8B6B72] tracking-[0.3em] uppercase select-none">
          hành trình · kết nối · cộng đồng
        </p>

        <button
          onClick={handleStart}
          className="mt-14 px-12 py-4 bg-[#111111] hover:bg-[#252525] active:scale-95 text-white font-bold rounded-full shadow-[0_12px_24px_-4px_rgba(17,17,17,0.3),0_8px_16px_-4px_rgba(17,17,17,0.2)] hover:shadow-[0_20px_32px_-4px_rgba(17,17,17,0.4),0_12px_20px_-4px_rgba(17,17,17,0.3)] transition-all duration-300 transform"
        >
          Bắt đầu!
        </button>
      </div>
    </div>
  );
};

export default LandingPage;