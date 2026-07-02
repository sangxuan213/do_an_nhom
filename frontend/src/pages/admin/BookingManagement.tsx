import React, { useEffect, useState } from 'react';
import { Search, Filter, RefreshCcw } from 'lucide-react';
import { getAdminBookings, updateBookingStatus } from '../../adminApi';
import type { AdminBooking } from '../../types';
import { AdminBookingStatus } from '../../types';

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: '#fef3c7', text: '#d97706', label: 'Chờ xử lý' },
  CONFIRMED: { bg: '#dbeafe', text: '#2563eb', label: 'Đã xác nhận' },
  COMPLETED: { bg: '#dcfce7', text: '#16a34a', label: 'Hoàn thành' },
  CANCELLED: { bg: '#fee2e2', text: '#dc2626', label: 'Đã hủy' },
};

const allStatuses = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  overflow: 'hidden',
};

export default function BookingManagement() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    getAdminBookings()
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      const updated = await updateBookingStatus(id, newStatus);
      setBookings(prev => prev.map(b => b.id === id ? updated : b));
    } catch (err) {
      console.error(err);
      alert('Lỗi khi cập nhật trạng thái!');
    }
    setUpdatingId(null);
  };

  const filtered = bookings.filter(b => {
    const matchStatus = !filterStatus || b.status === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchSearch = !query
      || (b.user?.fullName || '').toLowerCase().includes(query)
      || (b.licensePlate || '').toLowerCase().includes(query)
      || String(b.id).includes(query);
    return matchStatus && matchSearch;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid #e2e8f0', borderTopColor: '#0ea5e9',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>Quản Lý Đơn Đặt Lịch</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>
            Tổng cộng {bookings.length} đơn hàng trong hệ thống.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 10,
            fontSize: 12, fontWeight: 700, color: '#0ea5e9',
            background: '#f0f9ff', border: '1px solid #bae6fd',
            cursor: 'pointer',
          }}
        >
          <RefreshCcw style={{ width: 14, height: 14 }} /> Tải lại
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
          <Search style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 16, height: 16, color: '#94a3b8',
          }} />
          <input
            placeholder="Tìm theo tên KH, biển số, mã đơn..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 500,
              outline: 'none', background: '#fff',
            }}
          />
        </div>

        {/* Status filter */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter style={{ width: 14, height: 14, color: '#94a3b8' }} />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600,
              outline: 'none', background: '#fff', cursor: 'pointer', color: '#334155',
            }}
          >
            {allStatuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['ID', 'Khách hàng', 'SĐT', 'BKS', 'Dịch vụ', 'Ngày hẹn', 'Khung giờ', 'Trạng thái', 'Tổng tiền'].map(h => (
                  <th key={h} style={{
                    padding: '12px 14px', textAlign: 'left', fontWeight: 700,
                    color: '#64748b', fontSize: 10, textTransform: 'uppercase',
                    letterSpacing: '0.06em', borderBottom: '1px solid #e2e8f0',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const sc = statusConfig[b.status] || statusConfig.PENDING;
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px', fontWeight: 700, color: '#6366f1' }}>#{b.id}</td>
                    <td style={{ padding: '14px', fontWeight: 600, color: '#334155' }}>{b.user?.fullName || '—'}</td>
                    <td style={{ padding: '14px', color: '#64748b', fontWeight: 500 }}>{b.user?.phone || '—'}</td>
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        fontFamily: 'monospace', fontWeight: 700, fontSize: 11,
                        background: '#f0f9ff', color: '#0c4a6e', padding: '3px 8px',
                        borderRadius: 6, border: '1px solid #bae6fd',
                      }}>{b.licensePlate}</span>
                    </td>
                    <td style={{ padding: '14px', color: '#475569', fontWeight: 500 }}>{b.servicePackage?.name || '—'}</td>
                    <td style={{ padding: '14px', color: '#334155', fontWeight: 500 }}>
                      {b.bookingDate ? b.bookingDate.split('-').reverse().join('/') : '—'}
                    </td>
                    <td style={{ padding: '14px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {b.timeSlot || '—'}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <select
                        value={b.status}
                        disabled={updatingId === b.id}
                        onChange={e => handleStatusChange(b.id, e.target.value)}
                        style={{
                          padding: '5px 10px', borderRadius: 8,
                          fontSize: 11, fontWeight: 700,
                          background: sc.bg, color: sc.text,
                          border: `1px solid ${sc.text}30`,
                          cursor: updatingId === b.id ? 'wait' : 'pointer',
                          outline: 'none',
                          opacity: updatingId === b.id ? 0.6 : 1,
                        }}
                      >
                        {Object.entries(statusConfig).map(([val, cfg]) => (
                          <option key={val} value={val}>{cfg.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '14px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                      {new Intl.NumberFormat('vi-VN').format(b.totalCost || 0)}đ
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    Không tìm thấy đơn hàng nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        <div style={{
          padding: '12px 20px', background: '#f8fafc',
          borderTop: '1px solid #e2e8f0', fontSize: 11, color: '#64748b', fontWeight: 600,
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>Hiển thị {filtered.length} / {bookings.length} đơn hàng</span>
          <span>
            Tổng doanh thu (Hoàn thành):{' '}
            <strong style={{ color: '#10b981' }}>
              {new Intl.NumberFormat('vi-VN').format(
                bookings.filter(b => b.status === AdminBookingStatus.COMPLETED).reduce((s, b) => s + (b.totalCost || 0), 0)
              )}đ
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
