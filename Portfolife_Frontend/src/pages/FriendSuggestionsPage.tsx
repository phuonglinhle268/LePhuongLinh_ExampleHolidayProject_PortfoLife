import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';

interface SuggestionItem {
  id: number;
  name: string;
  role: string;
  mutualCount: number;
  avatar: string;
}

// Dữ liệu mẫu (fix cứng) để dựng giao diện - thay bằng API thật sau
const SUGGESTIONS: SuggestionItem[] = [
  {
    id: 1,
    name: 'Trần Quốc Bảo',
    role: 'AI Engineer',
    mutualCount: 12,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    name: 'Phạm Thu Trang',
    role: 'Content Creator',
    mutualCount: 8,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    name: 'Lê Thanh Sơn',
    role: 'Cloud Architect',
    mutualCount: 5,
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    name: 'Vũ Hoàng Anh',
    role: 'Mobile Dev',
    mutualCount: 15,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    name: 'Ngô Bảo Châu',
    role: 'Data Analyst',
    mutualCount: 3,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 6,
    name: 'Đinh Minh Quân',
    role: 'DevOps Eng.',
    mutualCount: 7,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 7,
    name: 'Cao Thị Lan Anh',
    role: 'UX Researcher',
    mutualCount: 9,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 8,
    name: 'Hoàng Văn Khải',
    role: 'Backend Dev',
    mutualCount: 4,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  },
];

const FriendSuggestionsPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(SUGGESTIONS);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const handleAddFriend = (id: number) => {
    setAddedIds((prev) => new Set(prev).add(id));
  };

  const handleRemove = (id: number) => {
    setSuggestions((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <MainLayout>
      <h1 className="text-2xl font-extrabold text-[#1F1315] mb-6">Những người bạn có thể biết</h1>

      {suggestions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#FCE7EB] text-gray-400 font-semibold select-none shadow-sm">
          Không còn gợi ý nào.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className="bg-[#FFF5F6] rounded-3xl p-6 flex flex-col items-center text-center"
            >
              <img
                src={item.avatar}
                alt={item.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm"
              />
              <h4 className="text-base font-bold text-[#1F1315] mt-3">{item.name}</h4>
              <p className="text-sm text-[#8B6B72] font-medium">{item.role}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{item.mutualCount} bạn chung</p>

              <div className="w-full mt-4 space-y-2">
                <button
                  onClick={() => handleAddFriend(item.id)}
                  disabled={addedIds.has(item.id)}
                  className="w-full px-4 py-2.5 bg-[#D02B52] hover:bg-[#B01E3E] active:scale-95 disabled:opacity-50 text-white text-sm font-bold rounded-full transition-all"
                >
                  {addedIds.has(item.id) ? 'Đã gửi' : 'Thêm bạn'}
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="w-full px-4 py-2.5 bg-white border border-[#FCE7EB] hover:bg-[#FFF0F3] text-gray-600 text-sm font-bold rounded-full transition-all"
                >
                  Gỡ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
};

export default FriendSuggestionsPage;