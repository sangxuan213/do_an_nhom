/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Award, ShieldCheck, Heart, Coffee, Check, 
  ChevronRight, Calendar, AlertCircle, RefreshCcw, 
  CheckCircle2, Flame, HelpCircle, Droplets, ArrowRight,
  User, Lock, Mail, Phone, LogOut
} from 'lucide-react';

import Header from './components/Header';
import BookingForm from './components/BookingForm';
import BookingTracker from './components/BookingTracker';
import ReviewList from './components/ReviewList';

import { Booking, BookingStatus, Review } from './types';
import { INITIAL_REVIEWS } from './data';
import api from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('booking');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newlyCreatedBooking, setNewlyCreatedBooking] = useState<Booking | null>(null);

  // User state
  const [currentUser, setCurrentUser] = useState<{ fullName: string; email: string; phone?: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  // Auth Form details
  const [authName, setAuthName] = useState<string>('');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPhone, setAuthPhone] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Initialize data from LocalStorage
  useEffect(() => {
    // Fetch user profile from API if token exists
    const token = localStorage.getItem('autoclean_token');
    if (token) {
      api.get('/auth/me')
        .then(res => setCurrentUser(res.data.data))
        .catch(err => {
          console.error('Failed to fetch user', err);
          handleLogout();
        });
      
      api.get('/bookings')
        .then(res => setBookings(res.data.data))
        .catch(err => console.error('Failed to fetch bookings', err));
    } else {
      // Not logged in
      setCurrentUser(null);
      setBookings([]);
    }

    // Reviews initialization
    const storedReviews = localStorage.getItem('autoclean_reviews');
    if (storedReviews) {
      try {
        setReviews(JSON.parse(storedReviews));
      } catch (err) {
        console.error('Lỗi phân tích cú pháp reviews', err);
      }
    } else {
      setReviews(INITIAL_REVIEWS);
      localStorage.setItem('autoclean_reviews', JSON.stringify(INITIAL_REVIEWS));
    }
  }, []);

  // Sync reviews to LocalStorage on updates (keep as is since we didn't add Review API)
  const saveReviews = (updated: Review[]) => {
    setReviews(updated);
    localStorage.setItem('autoclean_reviews', JSON.stringify(updated));
  };

  // Handle new booking submission
  const handleBookingSubmitted = async (booking: Booking) => {
    if (!currentUser) {
      setAuthError('Vui lòng đăng nhập để đặt lịch!');
      setAuthMode('signin');
      setShowAuthModal(true);
      return;
    }

    try {
      const res = await api.post('/bookings', {
        servicePackageId: parseInt(booking.serviceId),
        bookingDate: booking.date,
        timeSlot: booking.timeSlot,
        licensePlate: booking.licensePlate,
        vehicleType: booking.vehicleType,
        notes: booking.notes,
        totalCost: booking.totalCost,
        addOnIds: booking.addOnIds,
        redeemPoints: 0
      });

      const savedBooking = res.data.data;
      const updated = [savedBooking, ...bookings];
      setBookings(updated);
      setNewlyCreatedBooking(savedBooking);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi khi đặt lịch!');
    }
  };

  // Handle live status changes via simulated tracker controls
  const handleUpdateStatus = async (id: string, newStatus: BookingStatus) => {
    try {
      // In a real app we'd call the API here: await api.patch(`/bookings/${id}/status`, { status: newStatus });
      // For now we just mock the status change since the backend endpoint might not exist
      const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
      setBookings(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle booking deletion
  const handleDeleteBooking = async (id: string) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      const updated = bookings.filter(b => b.id !== id);
      setBookings(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle review creation
  const handleAddReview = (review: Review) => {
    const updated = [review, ...reviews];
    saveReviews(updated);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setBookings([]);
    localStorage.removeItem('autoclean_token');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Vui lòng điền đầy đủ email và mật khẩu');
      return;
    }

    if (authMode === 'signup' && !authName.trim()) {
      setAuthError('Vui lòng nhập Họ tên để đăng ký');
      return;
    }

    try {
      let res;
      if (authMode === 'signup') {
        res = await api.post('/auth/register', {
          fullName: authName.trim(),
          email: authEmail.trim(),
          password: authPassword,
          phone: authPhone.trim() || undefined
        });
      } else {
        res = await api.post('/auth/login', {
          email: authEmail.trim(),
          password: authPassword
        });
      }

      const { token, user } = res.data.data;
      localStorage.setItem('autoclean_token', token);
      setCurrentUser(user);
      setShowAuthModal(false);

      // Fetch user bookings after login
      api.get('/bookings')
        .then(resBook => setBookings(resBook.data.data))
        .catch(err => console.error('Failed to fetch bookings', err));

      // Reset fields
      setAuthName('');
      setAuthEmail('');
      setAuthPhone('');
      setAuthPassword('');
    } catch (err: any) {
      setAuthError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleCloseTicket = () => {
    setNewlyCreatedBooking(null);
    setActiveTab('tracker'); // Jump to tracker so user can see it in action
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthMode('signin');
          setAuthError('');
          setShowAuthModal(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main hero slide banner only displayed on the booking home */}
      {activeTab === 'booking' && (
        <section className="relative bg-gradient-to-br from-indigo-900 via-sky-900 to-sky-700 py-16 sm:py-24 px-4 overflow-hidden mb-12 border-b border-sky-100 select-none">
          <div className="absolute inset-0 z-0 opacity-40">
            <img 
              src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=1600" 
              alt="Sparkling wash car" 
              className="w-full h-full object-cover filter brightness-[0.7] contrast-125"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50 to-transparent z-0" />

          {/* Sparkles visuals */}
          <div className="absolute top-1/4 left-1/5 text-yellow-400 opacity-75 animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="absolute bottom-1/3 right-1/4 text-sky-300 opacity-60 animate-bounce">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="max-w-7xl mx-auto text-center relative z-10 px-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-500/10 backdrop-blur-md rounded-full border border-sky-400/20 text-sky-200 text-xs font-extrabold uppercase tracking-widest"
            >
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              Công nghệ làm sạch sinh học cao cấp 2026
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.12]"
            >
              Đặt Lịch Rửa Xe Đúng Giờ,<br />
              <span className="bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
                Xế Cưng Sạch Bóng Kính Nhẫn
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-xl mx-auto text-slate-200 text-sm sm:text-md font-medium leading-relaxed"
            >
              Chỉ mất 1 phút đặt dọn trực tuyến. Không còn cảnh xếp hàng mỏi mệt ngày cuối tuần. Chúng tôi quy chuẩn rửa 3 bước bọt tuyết siêu mịn chăm sóc toàn diện.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex justify-center gap-3 pt-4 flex-wrap"
            >
              <a
                href="#booking-section"
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-500/20 hover:-translate-y-0.5 transition-all text-center"
              >
                Đặt dịch vụ ngay
              </a>
              <button
                onClick={() => setActiveTab('services')}
                className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-xl text-xs font-bold backdrop-blur-md transition-all text-center"
              >
                Xem bảng giá chi tiết
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Main Container body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex-1 w-full pb-20">
        
        {/* TAB NAVIGATION PANEL */}
        <div className="space-y-12">
          
          {/* TAB 1: BOOKING & VALUE SECTION */}
          {activeTab === 'booking' && (
            <div id="booking-section" className="space-y-16">
              <BookingForm 
                onBookingSubmitted={handleBookingSubmitted} 
                setActiveTab={setActiveTab} 
              />

              {/* Value propositions: why choose us */}
              <div className="space-y-8 select-none">
                <div className="text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600">Đẳng cấp khác biệt</span>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">Tại Sao Chọn Garage AutoClean?</h3>
                  <p className="text-slate-500 text-sm max-w-lg mx-auto mt-2 leading-relaxed">
                    Chúng tôi định nghĩa lại trải nghiệm dọn dẹp vệ sinh xe với dịch vụ khách hàng 5 sao cao cấp cùng trang thiết bị tối tân hàng đầu.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      icon: ShieldCheck,
                      title: 'Quy trình Tiêu Chuẩn',
                      desc: 'Tuyệt đối cam kết không xước răm thân vỏ bằng khăn vi sợi Microfiber cao cấp chuyên dụng.',
                      color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
                    },
                    {
                      icon: Award,
                      title: 'Hoá chất Sinh Học',
                      desc: 'Dung dịch rửa xe bọt tuyết pH trung tính ngoại nhập, bảo vệ màng bóng sơn và không bị rỉ sét gầm.',
                      color: 'text-sky-600 bg-sky-50 border-sky-100'
                    },
                    {
                      icon: Coffee,
                      title: 'Phòng chờ Chu Đáo',
                      desc: 'Phòng chờ máy lạnh điều hòa, trà & cà phê nguyên chất hạt tự pha miễn phí, ngắm trực diện xe đang dọn.',
                      color: 'text-amber-600 bg-amber-50 border-amber-100'
                    },
                    {
                      icon: Flame,
                      title: 'Đặt lịch Hẹn Giờ',
                      desc: 'Tuyệt đối đúng giờ, rửa xong đúng deal, được sắp sẵn chỗ cầu nâng rửa gầm không cần xếp hàng chờ.',
                      color: 'text-cyan-600 bg-cyan-50 border-cyan-100'
                    }
                  ].map((benefit, bIdx) => {
                    const ExtIcon = benefit.icon;
                    return (
                      <div 
                        key={bIdx} 
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4 flex flex-col justify-start"
                      >
                        <div className={`p-3 rounded-xl w-12 h-12 flex items-center justify-center border ${benefit.color}`}>
                          <ExtIcon className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm">{benefit.title}</h4>
                        <p className="text-slate-500 text-xs leading-relaxed">{benefit.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer reviews section now appended directly here */}
              <div id="reviews-section" className="pt-12 border-t border-slate-100">
                <ReviewList 
                  reviews={reviews} 
                  onAddReview={handleAddReview} 
                />
              </div>
            </div>
          )}

          {/* TAB 2: TRACKER PANEL */}
          {activeTab === 'tracker' && (
            <BookingTracker 
              bookings={bookings} 
              onUpdateStatus={handleUpdateStatus} 
              onDeleteBooking={handleDeleteBooking} 
            />
          )}

          {/* TAB 3: PRICE PRICING SECTION */}
          {activeTab === 'services' && (
            <div className="space-y-12 select-none">
              <div className="text-center space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600">Bảng giá minh bạch</span>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Chi Tiết Bảng Giá Chăm Sóc Xe</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  Báo giá niêm yết rõ ràng theo từng phân khúc xe đầu ra. Cam kết không phát sinh bất kỳ chi phí phụ nào.
                </p>
              </div>

              {/* Price comparison matrix */}
              <div className="bg-white rounded-3xl border border-sky-100 shadow-xl overflow-hidden">
                <div className="p-6 overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-sky-100 text-slate-400 text-xs font-bold uppercase tracking-wider bg-sky-50/50">
                        <th className="py-4 px-6 rounded-l-2xl">Danh mục dịch vụ</th>
                        <th className="py-4 px-6">Xe máy, Mô tô</th>
                        <th className="py-4 px-6">Ô tô 4-5 chỗ (Sedan)</th>
                        <th className="py-4 px-6">SUV/MPV 7 chỗ</th>
                        <th className="py-4 px-6 rounded-r-2xl">Bán tải, Xe Tải nhỏ</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-slate-100">
                      <tr>
                        <td className="py-4 px-6 font-bold text-slate-800">
                          Gói Tiêu Chuẩn Rửa tuyết
                          <span className="block text-[10px] font-medium text-slate-400 mt-0.5">3 bước rửa, dọn thảm, hút bụi</span>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-700">50.000 đ</td>
                        <td className="py-4 px-6 font-bold text-sky-600">100.000 đ</td>
                        <td className="py-4 px-6 font-bold text-slate-700">125.000 đ</td>
                        <td className="py-4 px-6 font-bold text-slate-700">140.000 đ</td>
                      </tr>
                      <tr className="bg-sky-50/20">
                        <td className="py-4 px-6 font-bold text-slate-800">
                          Gói Chăm Sóc Nâng Cao 🔥
                          <span className="block text-[10px] font-medium text-slate-400 mt-0.5">Xịt gầm, Ố lazăng, tinh dầu nội thất</span>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-700">100.000 đ</td>
                        <td className="py-4 px-6 font-bold text-sky-600">200.000 đ</td>
                        <td className="py-4 px-6 font-bold text-slate-700">250.000 đ</td>
                        <td className="py-4 px-6 font-bold text-slate-700">280.000 đ</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-6 font-bold text-slate-800">
                          Gói Spa Chuyên Sâu
                          <span className="block text-[10px] font-medium text-slate-400 mt-0.5">Khoang máy hơi nước, vệ sinh nội thất da</span>
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-700">225.000 đ</td>
                        <td className="py-4 px-6 font-bold text-sky-600">450.000 đ</td>
                        <td className="py-4 px-6 font-bold text-slate-700">562.500 đ</td>
                        <td className="py-4 px-6 font-bold text-slate-700">630.000 đ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50 p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <AlertCircle className="w-4.5 h-4.5 text-sky-500 flex-shrink-0" />
                    Báo giá trên hệ thống là báo giá trọn gói niêm yết, không đòi thêm tiền boa hay nâng khống.
                  </div>
                  <button 
                    onClick={() => setActiveTab('booking')}
                    className="flex items-center gap-1.5 px-4.5 py-2 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 shadow-md shadow-sky-50 text-xs transition-all"
                  >
                    Mở trình đặt lịch rửa xe
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800 mt-auto select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-sky-500 rounded-xl text-white">
                <Droplets className="w-5 h-5" />
              </div>
              <span className="font-extrabold tracking-tight text-white text-md">AUTOCLEAN</span>
            </div>
            <p className="leading-relaxed font-medium">
              Chuỗi trung tâm dịch vụ rửa và chăm sóc xe hơi, mô tô chuyên sâu hàng đầu Việt Nam. Công nghệ làm sạch thân thiện với môi trường.
            </p>
          </div>

          {/* Quick links map */}
          <div className="space-y-4">
            <h4 className="text-white font-extrabold uppercase tracking-widest text-[9px]">Xem các danh mục</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button onClick={() => setActiveTab('booking')} className="hover:text-white transition-colors text-left font-medium">Đặt lịch hẹn</button>
              <button onClick={() => setActiveTab('tracker')} className="hover:text-white transition-colors text-left font-medium">Theo dõi xe</button>
              <button onClick={() => setActiveTab('services')} className="hover:text-white transition-colors text-left font-medium">Bảng giá dịch vụ</button>
              <button 
                onClick={() => {
                  setActiveTab('booking');
                  setTimeout(() => {
                    document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }} 
                className="hover:text-white transition-colors text-left font-medium"
              >
                Lời chứng thực/Đánh giá
              </button>
            </div>
          </div>

          {/* Operational Details */}
          <div className="space-y-3">
            <h4 className="text-white font-extrabold uppercase tracking-widest text-[9px]">Liên hệ garage</h4>
            <p className="leading-relaxed font-medium">
              📍 Trực tiếp: 120 Trần Não, Quận 2, Thủ Đức, TP. Hồ Chí Minh
            </p>
            <p className="leading-relaxed font-medium">
              📞 Đặt lịch tư vấn gấp: <span className="text-sky-400 font-bold">1900.8899</span>
            </p>
            <p className="leading-relaxed font-medium">
              📧 Thắc mắc phản ánh: feedback@autocleanpremium.vn
            </p>
          </div>

        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center border-t border-slate-800/80 mt-8 pt-6 text-[10px] text-slate-500">
          © 2026 AutoClean Premium Care Co., Ltd. Tất cả quyền được bảo hộ pháp lý. Built with pure love for car enthusiasts.
        </div>
      </footer>

      {/* SUCCESS TICKET POPUP BOARD MODAL */}
      <AnimatePresence>
        {newlyCreatedBooking && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-sky-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-sky-500 to-indigo-600 p-6 text-center text-white relative">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <CheckCircle2 className="w-7 h-7 text-white stroke-[3]" />
                </div>
                <h3 className="text-xl font-black tracking-tight">Đặt Lịch Thành Công!</h3>
                <p className="text-sky-100 text-xs mt-1">Cảm ơn xế yêu của bạn đã tìm đến AutoClean</p>

                {/* Ticket code sash */}
                <div className="bg-white text-indigo-900 font-mono font-black text-sm px-4 py-1.5 rounded-lg shadow-sm inline-block mt-4 border border-indigo-100/50">
                  CODE: {newlyCreatedBooking.id}
                </div>
              </div>

              {/* Visual simulated boarding pass ticket style */}
              <div className="p-6 space-y-6">
                <div className="text-center bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
                  {/* Simulated QR Code block using stylish divs and lucide */}
                  <div className="w-24 h-24 bg-white p-2 border-2 border-slate-150 rounded-xl relative flex items-center justify-center mb-2 shadow-xs">
                    <div className="grid grid-cols-4 gap-2 w-full h-full opacity-70">
                      {[1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 1].map((val, idx) => (
                        <div 
                          key={idx} 
                          className={`rounded-xs ${val === 1 ? 'bg-slate-800' : 'bg-transparent'}`} 
                        />
                      ))}
                    </div>
                    <div className="absolute inset-0 m-auto w-6 h-6 bg-white rounded-md flex items-center justify-center shadow-md">
                      <Droplets className="w-4.5 h-4.5 text-sky-500" />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest select-none">Mã QR Check-in Quầy soát</span>
                </div>

                <div className="text-xs space-y-2">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 font-medium">Khách hàng:</span>
                    <span className="font-bold text-slate-800">{newlyCreatedBooking.user?.fullName || newlyCreatedBooking.customerName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 font-medium">Số điện thoại:</span>
                    <span className="font-bold text-slate-800">
                      {(newlyCreatedBooking.user?.phone || newlyCreatedBooking.phone || '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 font-medium">BKS Đăng ký:</span>
                    <span className="font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                      {newlyCreatedBooking.licensePlate}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-slate-400 font-medium">Lịch hẹn rửa:</span>
                    <span className="font-bold text-slate-800">
                      {(newlyCreatedBooking.bookingDate || newlyCreatedBooking.date || '').split('-').reverse().join('/')} ({newlyCreatedBooking.timeSlot.split(' - ')[0]})
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-sm">
                    <span className="text-slate-700">Tổng phí (Dự kiến):</span>
                    <span className="text-sky-600 font-black">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(newlyCreatedBooking.totalCost)}
                    </span>
                  </div>
                </div>

                <div className="bg-sky-55 text-sky-800 p-3.5 border border-sky-100 rounded-xl text-[10px] leading-relaxed select-none">
                  💡 Bạn có thể lưu lại ảnh chụp màn hình vé này hoặc nhớ Số điện thoại để dùng tính năng "Theo dõi đơn hàng" kiểm tra tình trạng hàng chờ tại tiệm.
                </div>

                <button
                  id="btn-close-and-track-ticket"
                  onClick={handleCloseTicket}
                  className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-sky-100 hover:from-sky-600 hover:to-indigo-700 hover:-translate-y-0.5 transition-all text-center select-none"
                >
                  Xác Nhận & Theo Dõi Tiến Độ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AUTHENTICATION MODAL (SIGN IN / SIGN UP) */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto w-full h-full">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-sky-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-sky-500 to-indigo-600 p-6 text-center text-white relative">
                <button
                  type="button"
                  id="btn-close-auth-modal"
                  onClick={() => setShowAuthModal(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1 w-6 h-6 rounded-full transition-all text-xs flex items-center justify-center font-bold"
                >
                  ✕
                </button>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <User className="w-6 h-6 text-white stroke-[2]" />
                </div>
                <h3 className="text-xl font-black tracking-tight">
                  {authMode === 'signin' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Thành Viên'}
                </h3>
                <p className="text-sky-100 text-xs mt-1">
                  {authMode === 'signin' ? 'Đăng nhập để xem và quản lý đơn đặt lịch dịch vụ rửa xe' : 'Trở thành thành viên AutoClean để nhận nhiều ưu đãi'}
                </p>
              </div>

              {/* Form body */}
              <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
                {authError && (
                  <div className="bg-red-50 text-red-600 border border-red-100 p-3 rounded-xl text-xs font-bold flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Họ & Tên</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        id="auth-name-input"
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-bold">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      id="auth-email-input"
                      type="email"
                      required
                      placeholder="email@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        id="auth-phone-input"
                        type="tel"
                        placeholder="0987654321"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-bold">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      id="auth-password-input"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-200 outline-none rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-submit-auth"
                  className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-sky-100 hover:from-sky-600 hover:to-indigo-700 hover:-translate-y-0.5 transition-all text-center select-none mt-2"
                >
                  {authMode === 'signin' ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}
                </button>

                <div className="text-center pt-2">
                  {authMode === 'signin' ? (
                    <p className="text-xs text-slate-500">
                      Chưa có tài khoản?{' '}
                      <button
                        type="button"
                        id="btn-switch-to-signup"
                        onClick={() => {
                          setAuthMode('signup');
                          setAuthError('');
                        }}
                        className="text-sky-600 hover:text-sky-700 font-bold underline focus:outline-none"
                      >
                        Đăng ký ngay
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Đã có tài khoản?{' '}
                      <button
                        type="button"
                        id="btn-switch-to-signin"
                        onClick={() => {
                          setAuthMode('signin');
                          setAuthError('');
                        }}
                        className="text-sky-600 hover:text-sky-700 font-bold underline focus:outline-none"
                      >
                        Đăng nhập tại đây
                      </button>
                    </p>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
