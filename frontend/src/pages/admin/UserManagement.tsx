import React, { useEffect, useState } from 'react';
import { Search, RefreshCcw, Award, X } from 'lucide-react';
import { getAllUsers, getAllCustomers, updateUserPoints } from '../../adminApi';
import type { AdminUser } from '../../types';
import { LoyaltyTier, Role } from '../../types';

const tierConfig: Record<string, { bg: string; text: string; label: string; border: string }> = {
  BRONZE: { bg: '#fef3c7', text: '#b45309', label: '🥉 Bronze', border: '#fcd34d' },
  SILVER: { bg: '#f1f5f9', text: '#475569', label: '🥈 Silver', border: '#cbd5e1' },
  GOLD: { bg: '#fefce8', text: '#a16207', label: '🥇 Gold', border: '#fde047' },
};

const cardStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 16,
  border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  overflow: 'hidden',
};

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'customers'>('customers');
  const [searchQuery, setSearchQuery] = useState('');

  // Points modal
  const [pointsModal, setPointsModal] = useState<AdminUser | null>(null);
  const [pointsValue, setPointsValue] = useState('');
  const [updatingPoints, setUpdatingPoints] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    const fetcher = tab === 'customers' ? getAllCustomers : getAllUsers;
    fetcher()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [tab]);

  const handleUpdatePoints = async () => {
    if (!pointsModal || !pointsValue) return;
    setUpdatingPoints(true);
    try {
      await updateUserPoints(pointsModal.id, parseInt(pointsValue));
      fetchUsers();
      setPointsModal(null);
      setPointsValue('');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi cập nhật điểm!');
    }
    setUpdatingPoints(false);
  };

  const filtered = users.filter(u => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (u.fullName || '').toLowerCase().includes(q)
      || (u.email || '').toLowerCase().includes(q)
      || (u.phone || '').toLowerCase().includes(q)
      || String(u.id).includes(q);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>Quản Lý Khách Hàng</h2>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 }}>
            Danh sách người dùng và quản lý điểm tích lũy Loyalty.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 10,
            fontSize: 12, fontWeight: 700, color: '#0ea5e9',
            background: '#f0f9ff', border: '1px solid #bae6fd', cursor: 'pointer',
          }}
        >
          <RefreshCcw style={{ width: 14, height: 14 }} /> Tải lại
        </button>
      </div>

      {/* Tabs + Search */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {([
            { key: 'customers', label: 'Khách hàng' },
            { key: 'all', label: 'Tất cả' },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '9px 18px', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                background: tab === t.key ? '#0ea5e9' : '#fff',
                color: tab === t.key ? '#fff' : '#64748b',
                transition: 'all 0.15s',
              }}
            >{t.label}</button>
          ))}
        </div>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 340 }}>
          <Search style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            width: 16, height: 16, color: '#94a3b8',
          }} />
          <input
            placeholder="Tìm theo tên, email, SĐT..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10,
              border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 500, outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <div style={{
            width: 40, height: 40,
            border: '3px solid #e2e8f0', borderTopColor: '#0ea5e9',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={cardStyle}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['ID', 'Họ tên', 'Email', 'SĐT', 'Vai trò', 'Điểm Loyalty', 'Hạng', 'Ngày tạo', 'Thao tác'].map(h => (
                    <th key={h} style={{
                      padding: '12px 14px', textAlign: 'left', fontWeight: 700,
                      color: '#64748b', fontSize: 10, textTransform: 'uppercase',
                      letterSpacing: '0.06em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const tc = tierConfig[u.loyaltyTier] || tierConfig.BRONZE;
                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px', fontWeight: 700, color: '#6366f1' }}>#{u.id}</td>
                      <td style={{ padding: '14px', fontWeight: 600, color: '#334155' }}>{u.fullName}</td>
                      <td style={{ padding: '14px', color: '#64748b', fontWeight: 500 }}>{u.email}</td>
                      <td style={{ padding: '14px', color: '#64748b', fontWeight: 500 }}>{u.phone || '—'}</td>
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                          background: u.role === Role.ROLE_ADMIN ? '#eef2ff' : '#f0fdf4',
                          color: u.role === Role.ROLE_ADMIN ? '#4338ca' : '#15803d',
                        }}>
                          {u.role === Role.ROLE_ADMIN ? 'Admin' : 'Khách hàng'}
                        </span>
                      </td>
                      <td style={{ padding: '14px', fontWeight: 700, color: '#0f172a' }}>
                        {(u.loyaltyPoints || 0).toLocaleString()} pts
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700,
                          background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`,
                        }}>{tc.label}</span>
                      </td>
                      <td style={{ padding: '14px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <button
                          onClick={() => { setPointsModal(u); setPointsValue(''); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '6px 12px', borderRadius: 8,
                            fontSize: 11, fontWeight: 700, color: '#f59e0b',
                            background: '#fffbeb', border: '1px solid #fde68a',
                            cursor: 'pointer',
                          }}
                        >
                          <Award style={{ width: 13, height: 13 }} /> Điểm
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                      Không tìm thấy người dùng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{
            padding: '12px 20px', background: '#f8fafc',
            borderTop: '1px solid #e2e8f0', fontSize: 11, color: '#64748b', fontWeight: 600,
          }}>
            Hiển thị {filtered.length} / {users.length} người dùng
          </div>
        </div>
      )}

      {/* Points Modal */}
      {pointsModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 100, padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, maxWidth: 420, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden',
          }}>
            {/* Modal header */}
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              padding: '20px 24px', color: '#fff', position: 'relative',
            }}>
              <button
                onClick={() => setPointsModal(null)}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  background: 'rgba(255,255,255,0.2)', border: 'none',
                  borderRadius: 8, width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff',
                }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
              <Award style={{ width: 28, height: 28, marginBottom: 8 }} />
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>Cập Nhật Điểm Loyalty</h3>
              <p style={{ fontSize: 12, marginTop: 4, opacity: 0.9 }}>
                Khách hàng: <strong>{pointsModal.fullName}</strong>
              </p>
            </div>

            {/* Modal body */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12,
                padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#92400e',
              }}>
                Điểm hiện tại: <strong style={{ fontSize: 16 }}>{(pointsModal.loyaltyPoints || 0).toLocaleString()}</strong> pts
                <span style={{ marginLeft: 8 }}>
                  ({tierConfig[pointsModal.loyaltyTier]?.label || 'Bronze'})
                </span>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Số điểm cộng/trừ
                </label>
                <input
                  type="number"
                  placeholder="Ví dụ: 100 hoặc -50"
                  value={pointsValue}
                  onChange={e => setPointsValue(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 10,
                    border: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600,
                    outline: 'none', marginTop: 6,
                  }}
                />
                <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                  Nhập số dương để cộng, số âm để trừ điểm.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setPointsModal(null)}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 10,
                    fontSize: 12, fontWeight: 700, color: '#64748b',
                    background: '#f1f5f9', border: '1px solid #e2e8f0', cursor: 'pointer',
                  }}
                >Hủy</button>
                <button
                  onClick={handleUpdatePoints}
                  disabled={!pointsValue || updatingPoints}
                  style={{
                    flex: 1, padding: '11px 0', borderRadius: 10,
                    fontSize: 12, fontWeight: 700, color: '#fff',
                    background: updatingPoints ? '#94a3b8' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                    border: 'none', cursor: updatingPoints ? 'wait' : 'pointer',
                    boxShadow: '0 2px 8px rgba(245,158,11,0.25)',
                  }}
                >
                  {updatingPoints ? 'Đang cập nhật...' : 'Xác nhận cập nhật'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
