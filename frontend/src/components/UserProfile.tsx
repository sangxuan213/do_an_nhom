import React, { useEffect, useState } from 'react';
import { User as UserIcon, Mail, Phone, Award, Star, Calendar, Shield } from 'lucide-react';
import { User } from '../types';
import api from '../api';

interface UserProfileProps {
  currentUser: User | null;
}

export default function UserProfile({ currentUser }: UserProfileProps) {
  const [profile, setProfile] = useState<User | null>(currentUser);
  const [loading, setLoading] = useState<boolean>(!currentUser);

  useEffect(() => {
    // Luôn fetch thông tin mới nhất từ /api/account/profile
    api.get('/account/profile')
      .then(res => {
        setProfile(res.data.data);
      })
      .catch(err => {
        console.error('Failed to fetch profile', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-12 text-slate-500">
        Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.
      </div>
    );
  }

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'SILVER': return 'from-slate-300 to-slate-400 text-slate-700';
      case 'GOLD': return 'from-yellow-300 to-yellow-500 text-yellow-900';
      case 'PLATINUM': return 'from-cyan-300 to-cyan-500 text-cyan-900';
      default: return 'from-amber-600 to-amber-700 text-amber-50'; // BRONZE
    }
  };

  const formattedDate = profile.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('vi-VN') 
    : 'Chưa cập nhật';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in-up">
      <div className="text-center space-y-2 mb-8">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600">Tổng quan tài khoản</span>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Hồ Sơ Của Tôi</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Avatar & Tier */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xl shadow-sky-50 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-sky-400 to-indigo-500 opacity-20"></div>
            
            <div className="relative w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white z-10 mt-4">
              <div className="w-full h-full bg-gradient-to-br from-sky-100 to-indigo-50 rounded-full flex items-center justify-center">
                <span className="text-4xl font-black text-sky-600">
                  {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-800">{profile.fullName}</h3>
            <p className="text-sm text-slate-500">{profile.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Khách hàng thành viên'}</p>

            <div className={`mt-6 w-full rounded-2xl p-4 bg-gradient-to-r ${getTierColor(profile.loyaltyTier)} shadow-md`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">Hạng Thành Viên</span>
                <Star className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black">{profile.loyaltyTier || 'BRONZE'}</div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xl shadow-sky-50">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <UserIcon className="w-4 h-4" /> Thông tin cá nhân
              </h4>
              <button 
                onClick={() => alert('Chức năng chỉnh sửa đang được phát triển')}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Chỉnh sửa
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Họ và tên</label>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <UserIcon className="w-4 h-4 text-sky-500" />
                  {profile.fullName}
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Email</label>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Mail className="w-4 h-4 text-sky-500" />
                  {profile.email}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Số điện thoại</label>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Phone className="w-4 h-4 text-sky-500" />
                  {profile.phone || 'Chưa cập nhật'}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Ngày tham gia</label>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Calendar className="w-4 h-4 text-sky-500" />
                  {formattedDate}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
              <Award className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10" />
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-200 mb-2">Điểm Tích Luỹ</h4>
              <div className="text-4xl font-black">{profile.loyaltyPoints || 0} <span className="text-lg font-medium opacity-80">pts</span></div>
              <p className="text-xs text-indigo-100 mt-2">Dùng điểm để đổi các dịch vụ cao cấp miễn phí.</p>
            </div>

            <div className="bg-gradient-to-br from-sky-500 to-sky-700 rounded-3xl p-6 text-white shadow-xl shadow-sky-200 relative overflow-hidden">
              <Shield className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10" />
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-sky-200 mb-2">Bảo mật tài khoản</h4>
              <div className="text-lg font-bold flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Đang bảo vệ tốt
              </div>
              <p className="text-xs text-sky-100 mt-2">Tài khoản của bạn đã được mã hoá và bảo vệ an toàn.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
