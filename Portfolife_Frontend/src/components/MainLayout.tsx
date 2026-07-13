import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store';
import {
  FiUser,
  FiFolder,
  FiBookOpen,
  FiUsers,
  FiUserPlus,
  FiBell,
  FiBookmark,
  FiSettings,
  FiLogOut,
  FiSearch,
  FiHome,
  FiTrendingUp,
  FiList
} from 'react-icons/fi';

interface MainLayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
  showRightSidebar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onSearch, showRightSidebar = true }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      navigate(`/home?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  // Suggested friends mock data (Ảnh 4)
  const suggestedFriends = [
    {
      id: 101,
      name: 'Vũ Minh T...',
      role: 'Full-Stack ...',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 102,
      name: 'Bùi Thị Lan',
      role: 'Data Scient...',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 103,
      name: 'Hoàng N...',
      role: 'Product De...',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    },
  ];

  // Trending projects mock data (Ảnh 3)
  const trendingProjects = [
    {
      id: 201,
      title: 'AI Study Planner',
      author: 'Minh Khoa',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 202,
      title: 'EcoTrack App',
      author: 'Thu Hà',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 203,
      title: 'VN Job Board',
      author: 'Đức Anh',
      image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=120&auto=format&fit=crop&q=80',
    },
  ];

  // Fashion grid mock images (Ảnh 3, 4)
  const fashionImages = [
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=200&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="min-h-screen bg-[#FFF5F6] flex flex-col font-sans">
      {/* Header (Sticky) */}
      <header className="h-20 bg-white border-b border-[#FCE7EB] px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm shrink-0">
        {/* Logo */}
        <Link to="/home" className="flex items-center space-x-2">
          <span className="text-3xl font-extrabold text-[#D02B52] font-serif tracking-tight select-none">
            PortfoLife
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-8 relative">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-5 pr-11 py-2.5 bg-[#FFF5F6] border border-[#FCE7EB] focus:border-[#D02B52] focus:outline-none rounded-full text-sm transition-all placeholder-gray-400 text-gray-700"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D02B52]">
            <FiSearch className="w-4 h-4" />
          </button>
        </form>

        {/* Action icons */}
        <div className="flex items-center space-x-5">
          {/* Notification Icon */}
          <Link to="/notifications" className="relative p-2.5 bg-[#FFF5F6] hover:bg-[#FCE7EB] rounded-full transition-colors text-gray-600 hover:text-[#D02B52]">
            <FiBell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#D02B52] rounded-full border border-white" />
          </Link>

          {/* User Avatar */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/profile')}>
            <div className="w-9 h-9 rounded-full bg-[#D02B52] text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              {user?.username?.substring(0, 2) || 'US'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container - 3 independent columns, each scrolls on its own */}
      <div className="flex flex-1 w-full mx-auto px-6 py-6 gap-6 items-start">
        {/* Sidebar bên trái - cuộn độc lập */}
        <aside className="w-64 shrink-0 sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto">
          <nav className="bg-white rounded-3xl p-6 border border-[#FCE7EB] shadow-sm space-y-6">
            {/* Section 1: Không gian trải nghiệm */}
            <div>
              <h4 className="px-3 text-xs font-bold text-[#8B6B72] uppercase tracking-wider mb-2.5 select-none">
                KHÔNG GIAN TRẢI NGHIỆM
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    to="/home"
                    className={`flex items-center px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                      isActive('/home')
                        ? 'bg-[#D02B52] text-white shadow-sm'
                        : 'text-[#4A3E40] hover:bg-[#FFF5F6]'
                    }`}
                  >
                    <FiHome className="mr-3 text-base shrink-0" />
                    Bảng tin
                  </Link>
                </li>
                <li>
                  <Link
                    to="/study"
                    className={`flex items-center px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                      isActive('/study')
                        ? 'bg-[#D02B52] text-white shadow-sm'
                        : 'text-[#4A3E40] hover:bg-[#FFF5F6]'
                    }`}
                  >
                    <FiBookOpen className="mr-3 text-base shrink-0" />
                    Học tập / Dự án
                  </Link>
                </li>
              </ul>
            </div>

            {/* Section 2: Tiện ích cá nhân */}
            <div>
              <h4 className="px-3 text-xs font-bold text-[#8B6B72] uppercase tracking-wider mb-2.5 select-none">
                TIỆN ÍCH CÁ NHÂN
              </h4>
              <ul className="space-y-1.5">
                {[
                  { label: 'My Profile', path: '/profile', icon: <FiUser /> },
                  { label: 'My Portfolio', path: '/portfolio', icon: <FiFolder /> },
                  { label: 'My Course', path: '/course', icon: <FiBookOpen /> },
                  { label: 'My Group', path: '/group', icon: <FiUsers /> },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                        isActive(item.path)
                          ? 'bg-[#FFF0F3] text-[#8A1E37]'
                          : 'text-[#4A3E40] hover:bg-[#FFF5F6]'
                      }`}
                    >
                      <span className="mr-3 text-base shrink-0">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 3: Bạn bè */}
            <div>
              <h4 className="px-3 text-xs font-bold text-[#8B6B72] uppercase tracking-wider mb-2.5 select-none">
                BẠN BÈ
              </h4>
              <ul className="space-y-1.5">
                {[
                  { label: 'Lời mời kết bạn', path: '/friends/requests', icon: <FiUserPlus /> },
                  { label: 'Gợi ý', path: '/friends/suggestions', icon: <FiTrendingUp /> },
                  { label: 'Danh sách bạn bè', path: '/friends', icon: <FiList /> },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                        isActive(item.path)
                          ? 'bg-[#FFF0F3] text-[#8A1E37]'
                          : 'text-[#4A3E40] hover:bg-[#FFF5F6]'
                      }`}
                    >
                      <span className="mr-3 text-base shrink-0">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 4: Hệ thống & Tương tác */}
            <div>
              <h4 className="px-3 text-xs font-bold text-[#8B6B72] uppercase tracking-wider mb-2.5 select-none">
                HỆ THỐNG & TƯƠNG TÁC
              </h4>
              <ul className="space-y-1.5">
                {[
                  { label: 'Notification', path: '/notifications', icon: <FiBell /> },
                  { label: 'Saved', path: '/saved', icon: <FiBookmark /> },
                  { label: 'Setting', path: '/settings', icon: <FiSettings /> },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150 ${
                        isActive(item.path)
                          ? 'bg-[#FFF0F3] text-[#8A1E37]'
                          : 'text-[#4A3E40] hover:bg-[#FFF5F6]'
                      }`}
                    >
                      <span className="mr-3 text-base shrink-0">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Đăng xuất */}
            <div className="pt-4 border-t border-[#FCE7EB]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2.5 rounded-2xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all duration-150 text-left"
              >
                <FiLogOut className="mr-3 text-base shrink-0" />
                Đăng xuất
              </button>
            </div>
          </nav>
        </aside>

        {/* Khu vực nội dung chính - cuộn theo trang (không ảnh hưởng 2 sidebar) */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

        {/* Sidebar bên phải - cùng độ rộng với sidebar trái, cuộn độc lập */}
        {showRightSidebar && (
          <aside className="w-64 shrink-0 sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto space-y-6">
            {/* Widget 1: Trending */}
            <div className="bg-white rounded-3xl p-6 border border-[#FCE7EB] shadow-sm space-y-5">
              <div className="flex items-center text-[#D02B52] space-x-2">
                <FiTrendingUp className="text-xl" />
                <h3 className="font-extrabold text-base text-[#3C131E]">Trending</h3>
              </div>

              {/* Hashtags */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#8B6B72] tracking-wider uppercase">HASHTAG</h4>
                <div className="space-y-2.5">
                  {[
                    { tag: '#MachineLearning', count: '2.4k bài' },
                    { tag: '#UIDesign', count: '1.8k bài' },
                    { tag: '#LậpTrình', count: '3.1k bài' },
                    { tag: '#HọcTập', count: '5.6k bài' },
                  ].map((h) => (
                    <div key={h.tag} className="flex justify-between items-center text-sm">
                      <span className="font-bold text-[#D02B52] hover:underline cursor-pointer">{h.tag}</span>
                      <span className="text-gray-400 font-medium text-xs">{h.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-[#8B6B72] tracking-wider uppercase">PROJECT</h4>
                <div className="space-y-3">
                  {trendingProjects.map((p) => (
                    <div key={p.id} className="flex items-center space-x-3 hover:bg-[#FFF5F6] p-1.5 rounded-xl cursor-pointer transition-colors">
                      <img src={p.image} alt={p.title} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <h5 className="text-sm font-bold text-[#3C131E]">{p.title}</h5>
                        <p className="text-xs text-gray-400 font-medium">by {p.author}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fashion Grid */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-[#8B6B72] tracking-wider uppercase">FASHION</h4>
                <div className="grid grid-cols-3 gap-2">
                  {fashionImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`fashion ${i}`}
                      className="w-full aspect-square object-cover rounded-xl border border-gray-50 hover:scale-105 transition-transform duration-200"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Widget 2: Gợi ý kết bạn */}
            <div className="bg-white rounded-3xl p-6 border border-[#FCE7EB] shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-[#8B6B72] tracking-wider uppercase mb-1">GỢI Ý KẾT BẠN</h3>
              <div className="space-y-4">
                {suggestedFriends.map((f) => (
                  <div key={f.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={f.avatar} alt={f.name} className="w-10 h-10 rounded-full object-cover border" />
                      <div>
                        <h4 className="text-sm font-bold text-[#3C131E]">{f.name}</h4>
                        <p className="text-xs text-gray-400 font-medium">{f.role}</p>
                      </div>
                    </div>
                    <button className="px-4 py-1.5 border border-[#D02B52] hover:bg-[#D02B52] hover:text-white text-[#D02B52] font-bold text-xs rounded-full transition-all duration-200">
                      + Kết bạn
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default MainLayout;