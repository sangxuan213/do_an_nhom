import React, { useEffect, useState } from 'react';
import { 
  User as UserIcon, Mail, Phone, Award, Star, Calendar, 
  Shield, Edit2, Save, X, Loader2, Car, Sparkles, Check, Info 
} from 'lucide-react';
import { User, LoyaltyInfo } from '../types';
import api from '../api';

interface UserProfileProps {
  currentUser: any;
  onProfileUpdated?: (updatedCustomer: any) => void;
}

export default function UserProfile({ currentUser, onProfileUpdated }: UserProfileProps) {
  const [profile, setProfile] = useState<any | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltyInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Form states
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editLicensePlate, setEditLicensePlate] = useState<string>('');

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch customer profile & loyalty simultaneously
      const [profileRes, loyaltyRes] = await Promise.all([
        api.get('/customer/profile'),
        api.get('/customer/loyalty')
      ]);

      const profileData = profileRes.data.data;
      const loyaltyData = loyaltyRes.data.data;

      setProfile(profileData);
      setLoyalty(loyaltyData);

      // Initialize form values
      setEditName(profileData.name || '');
      setEditPhone(profileData.phone || '');
      setEditLicensePlate(profileData.licensePlate || '');
    } catch (err: any) {
      console.error('Failed to fetch profile or loyalty details', err);
      setError('Không thể tải thông tin hồ sơ thành công. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setError('Họ và tên không được để trống.');
      return;
    }
    if (!editPhone.trim()) {
      setError('Số điện thoại không được để trống.');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const res = await api.put('/customer/profile', {
        name: editName.trim(),
        phone: editPhone.trim(),
        licensePlate: editLicensePlate.trim() ? editLicensePlate.trim().toUpperCase() : null
      });

      setProfile(res.data.data);
      setSuccess('Cập nhật thông tin hồ sơ thành công!');
      setIsEditing(false);

      if (onProfileUpdated) {
        onProfileUpdated(res.data.data);
      }

      // Refresh loyalty details to ensure name / phone sync up
      const loyaltyRes = await api.get('/customer/loyalty');
      setLoyalty(loyaltyRes.data.data);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      console.error('Failed to update profile', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditName(profile.name || '');
      setEditPhone(profile.phone || '');
      setEditLicensePlate(profile.licensePlate || '');
    }
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-12 text-slate-500 space-y-4">
        <p>Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.</p>
        <button 
          onClick={fetchData} 
          className="px-4 py-2 bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-sky-600 transition-all"
        >
          Thử tải lại
        </button>
      </div>
    );
  }

  const getTierColor = (tier?: string) => {
    switch (tier?.toUpperCase()) {
      case 'SILVER': return 'from-slate-300 to-slate-400 text-slate-700';
      case 'GOLD': return 'from-yellow-300 to-yellow-500 text-yellow-900';
      case 'PLATINUM': return 'from-cyan-300 to-cyan-500 text-cyan-900';
      default: return 'from-amber-600 to-amber-700 text-amber-50'; // BRONZE
    }
  };

  const formattedDate = profile.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('vi-VN') 
    : currentUser?.createdAt 
      ? new Date(currentUser.createdAt).toLocaleDateString('vi-VN')
      : 'Chưa cập nhật';

  // Calculate loyalty progress percentage
  const calculateProgress = () => {
    if (!loyalty) return 0;
    const currentPoints = loyalty.totalPoints || 0;
    const needed = loyalty.pointsToNextTier || 0;
    if (needed === 0) return 100; // Max tier
    const nextTierTotal = currentPoints + needed;
    return Math.min(100, Math.round((currentPoints / nextTierTotal) * 100));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in-up">
      <div className="text-center space-y-2 mb-8">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600">Tổng quan tài khoản</span>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Hồ Sơ Của Tôi</h2>
      </div>

      {/* Alert Notifications */}
      {error && (
        <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-2xl text-xs font-bold flex items-start gap-2 animate-pulse">
          <Info className="w-4.5 h-4.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-4 rounded-2xl text-xs font-bold flex items-start gap-2 animate-bounce">
          <Check className="w-4.5 h-4.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Avatar & Tier Card */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xl shadow-sky-50 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-sky-400 to-indigo-500 opacity-20"></div>
            
            <div className="relative w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white z-10 mt-4">
              <div className="w-full h-full bg-gradient-to-br from-sky-100 to-indigo-50 rounded-full flex items-center justify-center">
                <span className="text-4xl font-black text-sky-600">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-800">{profile.name}</h3>
            <p className="text-sm text-slate-500">{currentUser?.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Khách hàng thành viên'}</p>

            <div className={`mt-6 w-full rounded-2xl p-4 bg-gradient-to-r ${getTierColor(loyalty?.currentTier)} shadow-md`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider opacity-90">Hạng Thành Viên</span>
                <Star className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black">{loyalty?.currentTier || 'BRONZE'}</div>
            </div>
          </div>
        </div>

        {/* Right Column - Profile Details & Form */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xl shadow-sky-50 relative">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <UserIcon className="w-4 h-4" /> Thông tin cá nhân
              </h4>
              
              {!isEditing && (
                <button
                  type="button"
                  id="btn-edit-profile-toggle"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-xl transition-all cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Chỉnh sửa
                </button>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Họ và tên</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        id="profile-edit-name"
                        type="text"
                        required
                        disabled={isSaving}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        id="profile-edit-phone"
                        type="tel"
                        required
                        disabled={isSaving}
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="0987654321"
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Biển số xe mặc định</label>
                    <div className="relative">
                      <Car className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <input
                        id="profile-edit-license-plate"
                        type="text"
                        disabled={isSaving}
                        value={editLicensePlate}
                        onChange={(e) => setEditLicensePlate(e.target.value.toUpperCase())}
                        placeholder="Ví dụ: 30A-123.45 hoặc 29K1-999.99"
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none rounded-xl text-xs font-medium font-mono uppercase tracking-wider"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">Biển số xe này sẽ tự động điền vào đơn đặt lịch rửa xe của bạn.</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={isSaving}
                    id="btn-profile-edit-cancel"
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-250 rounded-xl transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Hủy
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    id="btn-profile-edit-save"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-md shadow-sky-50 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Họ và tên</label>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <UserIcon className="w-4 h-4 text-sky-500" />
                    {profile.name}
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
                    {profile.phone || <span className="text-slate-400 font-medium italic">Chưa cập nhật</span>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Biển số xe mặc định</label>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Car className="w-4 h-4 text-sky-500" />
                    {profile.licensePlate ? (
                      <span className="font-mono bg-sky-50 border border-sky-100 text-sky-800 px-2 py-0.5 rounded text-xs uppercase tracking-wider font-extrabold">
                        {profile.licensePlate}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium italic">Chưa cập nhật</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-slate-400">Ngày tham gia</label>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <Calendar className="w-4 h-4 text-sky-500" />
                    {formattedDate}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Loyalty & Wash History Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
              <Award className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-200 mb-2">Điểm Tích Luỹ</h4>
                <div className="text-4xl font-black">{loyalty?.totalPoints || 0} <span className="text-lg font-medium opacity-80">pts</span></div>
              </div>
              <p className="text-[10px] text-indigo-150 mt-4 leading-relaxed font-medium">Dùng điểm để quy đổi voucher hoặc nhận các đặc quyền dịch vụ miễn phí.</p>
            </div>

            <div className="bg-gradient-to-br from-sky-500 to-sky-700 rounded-3xl p-6 text-white shadow-xl shadow-sky-200 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
              <Sparkles className="absolute -right-4 -bottom-4 w-24 h-24 text-white opacity-10" />
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-sky-200 mb-2">Số lần rửa xe</h4>
                <div className="text-4xl font-black">{loyalty?.totalWashes || 0} <span className="text-lg font-medium opacity-80">lần</span></div>
              </div>
              <p className="text-[10px] text-sky-150 mt-4 leading-relaxed font-medium">Rửa xe càng nhiều, cơ hội nâng hạng thành viên nhanh hơn.</p>
            </div>
          </div>

          {/* Loyalty Progress Bar Integration */}
          {loyalty && (
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xl shadow-sky-50 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    Lộ trình nâng hạng
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">Theo dõi chặng đường thăng tiến của bạn</p>
                </div>
                {loyalty.nextTier ? (
                  <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-xl">
                    Tiếp theo: {loyalty.nextTier}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
                    Hạng tối đa đạt được
                  </span>
                )}
              </div>

              {loyalty.nextTier ? (
                <div className="space-y-2">
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                    <div 
                      className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${calculateProgress()}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Hạng {loyalty.currentTier} ({loyalty.totalPoints} pts)</span>
                    <span>{calculateProgress()}%</span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 pt-1 leading-relaxed">
                    💡 Bạn chỉ cần tích lũy thêm <span className="font-extrabold text-sky-600">{loyalty.pointsToNextTier} điểm</span> nữa để được nâng lên hạng thành viên <span className="font-extrabold text-indigo-600">{loyalty.nextTier}</span> và hưởng các đặc quyền chiết khấu lớn hơn.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs font-medium space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Sparkles className="w-4.5 h-4.5 text-emerald-600" />
                    Chúc mừng bạn!
                  </div>
                  <p className="leading-relaxed">Bạn đã đạt hạng thành viên cao nhất **PLATINUM**. AutoClean trân quý mọi sự đồng hành của bạn với dịch vụ chăm sóc xe tốt nhất của chúng tôi!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
