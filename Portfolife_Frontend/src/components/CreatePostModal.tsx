import React, { useRef } from 'react';
import Swal from 'sweetalert2';
import { FiX, FiImage, FiSmile, FiMapPin, FiSend } from 'react-icons/fi';

export type PostType = 'NORMAL' | 'STUDY';
export type PostVisibility = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;

  currentUserName: string;
  currentUserAvatar: string;

  content: string;
  onContentChange: (value: string) => void;

  postType: PostType;
  onPostTypeChange: (value: PostType) => void;

  visibility: PostVisibility;
  onVisibilityChange: (value: PostVisibility) => void;

  tagInput: string;
  onTagInputChange: (value: string) => void;

  selectedImages: File[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  selectedDoc: File | null;
  onDocChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUserName,
  currentUserAvatar,
  content,
  onContentChange,
  postType,
  onPostTypeChange,
  visibility,
  onVisibilityChange,
  tagInput,
  onTagInputChange,
  selectedImages,
  onImageChange,
  selectedDoc,
  onDocChange,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handlePickMood = () => {
    Swal.fire({
      title: 'Chọn cảm xúc',
      input: 'select',
      inputOptions: {
        HAPPY: 'Vui vẻ 😊',
        EXCITED: 'Hào hứng 🤩',
        TIRED: 'Mệt mỏi 😴',
        SAD: 'Buồn bã 😢',
      },
      confirmButtonColor: '#D02B52',
    }).then((res) => {
      if (res.value) {
        onContentChange(
          content +
            ' ' +
            (res.value === 'HAPPY' ? '😊' : res.value === 'EXCITED' ? '🤩' : res.value === 'TIRED' ? '😴' : '😢')
        );
      }
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-[560px] shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#FCE7EB]">
          <h2 className="text-xl font-extrabold text-[#1F1315]">Tạo bài viết</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="p-6">
            {/* User info + dropdown pills */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={currentUserAvatar}
                alt={currentUserName}
                className="w-12 h-12 rounded-full object-cover shrink-0"
              />
              <div>
                <p className="font-bold text-[#1F1315]">{currentUserName}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="relative">
                    <select
                      value={visibility}
                      onChange={(e) => onVisibilityChange(e.target.value as PostVisibility)}
                      className="appearance-none rounded-full bg-[#FFF0F3] text-[#D02B52] text-xs font-bold pl-3 pr-7 py-1.5 cursor-pointer focus:outline-none"
                    >
                      <option value="PUBLIC">Công khai</option>
                      <option value="FRIENDS">Bạn bè</option>
                      <option value="PRIVATE">Chỉ mình tôi</option>
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#D02B52] text-[10px]">
                      ▾
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      value={postType}
                      onChange={(e) => onPostTypeChange(e.target.value as PostType)}
                      className="appearance-none rounded-full bg-[#FFF0F3] text-[#D02B52] text-xs font-bold pl-3 pr-7 py-1.5 cursor-pointer focus:outline-none"
                    >
                      <option value="NORMAL">Cuộc sống</option>
                      <option value="STUDY">Học tập</option>
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#D02B52] text-[10px]">
                      ▾
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content textarea */}
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              rows={4}
              autoFocus
              placeholder="Bạn đang nghĩ gì? Chia sẻ hành trình học tập, dự án của bạn..."
              className="w-full resize-none outline-none text-base text-gray-700 placeholder-gray-400 mb-2"
            />

            {/* Tags - chỉ hiện khi Loại bài là Học tập */}
            {postType === 'STUDY' && (
              <div className="mb-4 space-y-2">
                <input
                  type="text"
                  placeholder="Nhãn dán (tags), phân tách bằng dấu phẩy: MachineLearning, AI..."
                  value={tagInput}
                  onChange={(e) => onTagInputChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FFF5F6] border border-[#FCE7EB] focus:border-[#D02B52] focus:outline-none rounded-xl text-sm placeholder-gray-400 text-gray-700 transition-all"
                />
                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="text-xs font-bold text-[#D02B52] hover:underline"
                >
                  + Đính kèm tài liệu học tập
                </button>
                {selectedDoc && (
                  <span className="ml-2 text-xs bg-[#FFF5F6] px-2 py-0.5 rounded border border-[#FCE7EB]">
                    {selectedDoc.name}
                  </span>
                )}
              </div>
            )}

            {/* Attachment preview */}
            {selectedImages.length > 0 && (
              <div className="bg-[#FFF5F6] p-3 rounded-xl space-y-1.5 border border-[#FCE7EB] text-xs text-gray-500 mb-4">
                <span className="font-bold">Ảnh đã chọn:</span>{' '}
                {selectedImages.map((f, i) => (
                  <span key={i} className="inline-block bg-white px-2 py-0.5 rounded border mr-1.5">
                    {f.name}
                  </span>
                ))}
              </div>
            )}

            {/* Thêm vào bài viết */}
            <div className="border border-[#FCE7EB] rounded-2xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">Thêm vào bài viết</span>
              <div className="flex items-center gap-4 text-[#D02B52]">
                <button type="button" className="font-bold text-base leading-none">
                  T
                </button>
                <button type="button" onClick={() => imageInputRef.current?.click()}>
                  <FiImage className="text-lg" />
                </button>
                <button type="button" onClick={handlePickMood}>
                  <FiSmile className="text-lg" />
                </button>
                <button type="button">
                  <FiMapPin className="text-lg" />
                </button>
              </div>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={imageInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
            />
            <input
              ref={docInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
              onChange={onDocChange}
              className="hidden"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-[#FCE7EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-[#FFF0F3] hover:bg-[#FCE7EB] text-[#D02B52] font-bold text-sm rounded-full transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#D02B52] hover:bg-[#B01E3E] active:scale-95 text-white font-bold text-sm rounded-full flex items-center gap-2 shadow-[0_4px_12px_rgba(208,43,82,0.25)] transition-all"
            >
              <FiSend className="text-sm" /> Đăng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;