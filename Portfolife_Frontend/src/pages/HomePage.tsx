import React, { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
import CreatePostModal from '../components/CreatePostModal';
import type { PostType, PostVisibility } from '../components/CreatePostModal';
import axiosClient from '../api/axiosClient';
import Swal from 'sweetalert2';
import {
  FiHeart,
  FiMessageCircle,
  FiShare2,
  FiBookmark,
  FiMoreHorizontal,
  FiFileText,
  FiImage,
  FiFolder,
  FiX,
  FiUserCheck,
  FiEyeOff,
  FiFlag,
  FiSend
} from 'react-icons/fi';

interface DocumentInfo {
  id: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  downloadCount: number;
}

interface PostResponse {
  id: number;
  userId: number;
  username: string;
  userFullName: string;
  userAvatarUrl?: string;
  content: string;
  postType: 'NORMAL' | 'STUDY' | 'DOCUMENT' | 'QUESTION';
  categoryId?: number;
  categoryName?: string;
  visibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  imageUrls: string[];
  documents: DocumentInfo[];
}

interface HomePageProps {
  defaultTab?: 'LIFE' | 'STUDY';
}

const CURRENT_USER_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';
const CURRENT_USER_NAME = 'Phạm Anh Thư';

const HomePage: React.FC<HomePageProps> = ({ defaultTab = 'LIFE' }) => {
  const [feedTab, setFeedTab] = useState<'LIFE' | 'STUDY'>(defaultTab);

  useEffect(() => {
    setFeedTab(defaultTab);
  }, [defaultTab]);

  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Post form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('NORMAL');
  const [visibility, setVisibility] = useState<PostVisibility>('PUBLIC');
  const [tagInput, setTagInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<File | null>(null);

  // Options dropdown state per post
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Load feed
  const fetchFeed = async () => {
    setLoading(true);
    try {
      const response: any = await axiosClient.get('/api/v1/posts/feed');
      const postList: PostResponse[] = response.data || [];
      
      // Filter based on tab: LIFE represents NORMAL, STUDY represents STUDY
      const filtered = postList.filter(p => {
        if (feedTab === 'LIFE') {
          return p.postType === 'NORMAL';
        } else {
          return p.postType === 'STUDY';
        }
      });

      setPosts(filtered);
    } catch (err: any) {
      console.error('Không thể tải bảng tin:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [feedTab]);

  const resetForm = () => {
    setContent('');
    setPostType('NORMAL');
    setVisibility('PUBLIC');
    setTagInput('');
    setSelectedImages([]);
    setSelectedDoc(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...filesArray]);
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedDoc(e.target.files[0]);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      Swal.fire({
        icon: 'warning',
        text: 'Nội dung bài đăng không được để trống!',
        confirmButtonColor: '#D02B52',
      });
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    formData.append('postType', postType);
    formData.append('visibility', visibility);

    // Tags (Chỉ gửi tags nếu loại bài đăng là STUDY)
    if (postType === 'STUDY' && tagInput.trim()) {
      const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
      tags.forEach(t => formData.append('tags', t));
    }

    // Images
    selectedImages.forEach(img => {
      formData.append('images', img);
    });

    // Document
    if (selectedDoc) {
      formData.append('documentFile', selectedDoc);
    }

    try {
      Swal.showLoading();
      await axiosClient.post('/api/v1/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Swal.fire({
        icon: 'success',
        title: 'Thành công',
        text: 'Đã đăng tải bài viết thành công!',
        showConfirmButton: false,
        timer: 1500,
      });

      // Reset form + đóng modal
      resetForm();
      setIsCreateModalOpen(false);

      // Reload feed
      fetchFeed();
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: err.message || 'Không thể tạo bài đăng',
        confirmButtonColor: '#D02B52',
      });
    }
  };

  const handleReaction = async (postId: number, reactionType: string) => {
    try {
      await axiosClient.post(`/api/v1/posts/${postId}/reactions`, { reactionType });
      // Reload or update reaction locally
      fetchFeed();
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handleSavePost = async (postId: number) => {
    try {
      const response: any = await axiosClient.post(`/api/v1/posts/${postId}/save`);
      Swal.fire({
        icon: 'success',
        text: response.message || 'Hành động thành công!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      });
      setActiveMenuId(null);
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        text: err.message,
        confirmButtonColor: '#D02B52',
      });
    }
  };

  const handleReportPost = async (postId: number) => {
    setActiveMenuId(null);
    const { value: reason } = await Swal.fire({
      title: 'Báo cáo vi phạm',
      input: 'textarea',
      inputLabel: 'Lý do báo cáo bài viết này:',
      inputPlaceholder: 'Nội dung phản cảm, spam, xúc phạm người khác...',
      confirmButtonText: 'Gửi báo cáo',
      confirmButtonColor: '#D02B52',
      cancelButtonText: 'Hủy',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Bạn phải nhập lý do báo cáo!';
        }
      }
    });

    if (reason) {
      try {
        await axiosClient.post('/api/v1/reports', {
          targetType: 'POST',
          targetId: postId,
          reason,
        });

        Swal.fire({
          icon: 'success',
          text: 'Gửi báo cáo thành công. Hệ thống đã ẩn nội dung này khỏi bảng tin của bạn.',
          confirmButtonColor: '#D02B52',
        });

        // Lọc bỏ bài viết vừa báo cáo ra khỏi state
        setPosts(prev => prev.filter(p => p.id !== postId));
      } catch (err: any) {
        Swal.fire({
          icon: 'error',
          text: err.message,
          confirmButtonColor: '#D02B52',
        });
      }
    }
  };

  const formatTime = (timeStr: string) => {
    const d = new Date(timeStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHrs < 1) return 'Vừa xong';
    if (diffHrs < 24) return `${diffHrs} giờ trước`;
    return d.toLocaleDateString('vi-VN');
  };

  return (
    <MainLayout>
      {/* Create Post Trigger Bar - bấm vào sẽ mở CreatePostModal */}
      <div className="bg-white rounded-3xl p-6 border border-[#FCE7EB] mb-6 shadow-sm">
        <div className="flex items-center space-x-3">
          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full bg-[#D02B52] text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm overflow-hidden shrink-0">
            <img src={CURRENT_USER_AVATAR} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          {/* Fake input - mở modal khi bấm vào */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 text-left bg-[#FFF5F6] border border-[#FCE7EB] hover:border-[#D02B52] rounded-full px-5 py-3 text-sm text-gray-400 transition-all"
          >
            Bạn đang nghĩ gì? Chia sẻ hành trình học tập...
          </button>
        </div>

        {/* Bottom Actions Row */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex items-center space-x-6 text-sm font-bold text-[#D02B52]">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <FiImage className="text-base shrink-0" />
              <span>Ảnh/Video</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <FiFolder className="text-base shrink-0" />
              <span>Dự án</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-base shrink-0">😊</span>
              <span>Cảm xúc</span>
            </button>
          </div>

          {/* Post button - bấm vào cũng mở modal */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-[#D02B52] hover:bg-[#B01E3E] active:scale-95 text-white text-sm font-bold rounded-full shadow-[0_4px_12px_rgba(208,43,82,0.25)] flex items-center transition-all"
          >
            <FiSend className="w-4 h-4 mr-2" />
            Đăng
          </button>
        </div>
      </div>

      {/* Modal Tạo bài viết (component dùng chung) */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
        currentUserName={CURRENT_USER_NAME}
        currentUserAvatar={CURRENT_USER_AVATAR}
        content={content}
        onContentChange={setContent}
        postType={postType}
        onPostTypeChange={setPostType}
        visibility={visibility}
        onVisibilityChange={setVisibility}
        tagInput={tagInput}
        onTagInputChange={setTagInput}
        selectedImages={selectedImages}
        onImageChange={handleImageChange}
        selectedDoc={selectedDoc}
        onDocChange={handleDocChange}
      />

      {/* Feed Posts */}
      <div className="space-y-6">
        {posts.length === 0 && !loading && (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#FCE7EB] text-gray-400 font-semibold select-none shadow-sm">
            Chưa có bài đăng nào trong mục này.
          </div>
        )}

        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-3xl p-6 border border-[#FCE7EB] shadow-sm relative">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {/* Author Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#FFF0F2] border border-[#FCE7EB] flex items-center justify-center font-bold text-[#D02B52] uppercase overflow-hidden select-none shrink-0">
                  <img
                    src={`https://images.unsplash.com/photo-${1500000000000 + post.userId * 10000}?w=100&auto=format&fit=crop&q=80`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {post.username.substring(0, 2)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#3C131E]">{post.userFullName}</h4>
                  <p className="text-xs text-gray-400 font-medium">@{post.username} • {formatTime(post.createdAt)}</p>
                </div>
              </div>

              {/* Options menu */}
              <div className="relative">
                <button
                  onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)}
                  className="p-1 hover:bg-[#FFF5F6] rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiMoreHorizontal className="text-xl" />
                </button>

                {/* Dropdown Menu */}
                {activeMenuId === post.id && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-[#FCE7EB] rounded-2xl shadow-lg z-20 py-2">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 pb-2 mb-1 border-b border-[#FFF2F4]">
                      <span className="text-xs font-bold text-[#8B6B72] uppercase tracking-wider">
                        Tùy chọn
                      </span>
                      <button
                        onClick={() => setActiveMenuId(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <FiX className="text-base" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleSavePost(post.id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#FFF5F6] text-sm font-semibold text-[#4A3E40] flex items-center"
                    >
                      <FiBookmark className="mr-2.5 text-base" /> Lưu bài viết
                    </button>
                    <button
                      onClick={() => setActiveMenuId(null)}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#FFF5F6] text-sm font-semibold text-[#4A3E40] flex items-center"
                    >
                      <FiUserCheck className="mr-2.5 text-base" /> Quan tâm
                    </button>
                    <button
                      onClick={() => setActiveMenuId(null)}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#FFF5F6] text-sm font-semibold text-[#4A3E40] flex items-center"
                    >
                      <FiEyeOff className="mr-2.5 text-base" /> Không quan tâm
                    </button>
                    <button
                      onClick={() => handleReportPost(post.id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#FFF5F6] text-sm font-semibold text-red-500 flex items-center"
                    >
                      <FiFlag className="mr-2.5 text-base" /> Báo cáo
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Post Content */}
            <div className="text-sm text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap font-medium">
              {post.content}
            </div>

            {/* Tags (Chỉ hiển thị tag cho bài viết thuộc phần học tập STUDY) */}
            {post.postType === 'STUDY' && post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#FFF0F2] text-[#D02B52] hover:bg-[#D02B52] hover:text-white rounded-full text-xs font-bold cursor-pointer transition-all"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Post Images (Bo góc rộng, hiển thị đầy đủ) */}
            {post.imageUrls && post.imageUrls.length > 0 && (
              <div className="mb-4 rounded-2xl overflow-hidden border border-[#FCE7EB]">
                {post.imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Post image ${i + 1}`}
                    className="w-full max-h-[380px] object-cover"
                  />
                ))}
              </div>
            )}

            {/* Attached study documents */}
            {post.documents && post.documents.length > 0 && (
              <div className="bg-[#FFF5F6] p-4 rounded-2xl mb-4 border border-[#FCE7EB] space-y-2">
                <h5 className="text-sm font-bold text-[#8B6B72] uppercase tracking-wider flex items-center">
                  <FiFileText className="mr-1.5" /> Tài liệu học tập đính kèm
                </h5>
                {post.documents.map((doc) => (
                  <div key={doc.id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-[#FCE7EB] text-sm">
                    <span className="font-semibold text-gray-700 truncate max-w-xs">{doc.fileName}</span>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-[#D02B52] hover:bg-[#B01E3E] text-white font-bold rounded-lg transition-colors"
                    >
                      Tải về
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Interaction Bar */}
            <div className="flex items-center justify-between border-t border-[#FCE7EB] pt-4 text-sm text-[#8B6B72] font-bold">
              <div className="flex items-center space-x-6">
                {/* Like Button */}
                <button
                  onClick={() => handleReaction(post.id, 'LIKE')}
                  className="flex items-center space-x-1.5 hover:text-[#D02B52] transition-colors"
                >
                  <FiHeart className="text-lg" />
                  <span>142</span>
                </button>

                {/* Comment Button */}
                <button className="flex items-center space-x-1.5 hover:text-[#D02B52] transition-colors">
                  <FiMessageCircle className="text-lg" />
                  <span>28</span>
                </button>

                {/* Share Button */}
                <button className="flex items-center space-x-1.5 hover:text-[#D02B52] transition-colors">
                  <FiShare2 className="text-lg" />
                  <span>11</span>
                </button>
              </div>

              {/* Save/View More Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleSavePost(post.id)}
                  className="flex items-center space-x-1.5 hover:text-[#D02B52] transition-colors"
                >
                  <FiBookmark className="text-lg" />
                  <span>Lưu</span>
                </button>
                
                <span className="text-[#D02B52] hover:underline cursor-pointer select-none">
                  Xem thêm
                </span>
              </div>
            </div>
          </div>
        ))}



        {loading && (
          <div className="text-center py-4 text-[#D02B52] font-semibold select-none">
            Đang tải thêm bài đăng...
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default HomePage;