import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Shield, Bell } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import api from '../../api';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<{ fullName: string; email: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('autoclean_token');
    if (!token) {
      navigate('/');
      return;
    }
    api.get('/auth/me')
      .then(res => {
        const user = res.data.data;
        if (user.role !== 'ROLE_ADMIN') {
          navigate('/');
          return;
        }
        setAdminUser(user);
        setLoading(false);
      })
      .catch(() => {
        navigate('/');
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('autoclean_token');
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: '4px solid #e2e8f0',
          borderTopColor: '#0ea5e9',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>Đang xác thực quyền Admin...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      <AdminSidebar />

      {/* Main content area */}
      <div style={{ flex: 1, marginLeft: 260, display: 'flex', flexDirection: 'column' }}>
        {/* Top Header Bar */}
        <header style={{
          height: 64,
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield style={{ width: 16, height: 16, color: '#6366f1' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
              Bảng Điều Khiển Quản Trị
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Notification bell placeholder */}
            <button
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: '1px solid #e2e8f0',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
                transition: 'all 0.2s',
              }}
              title="Thông báo"
            >
              <Bell style={{ width: 16, height: 16 }} />
            </button>

            {/* Admin info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                  {adminUser?.fullName || 'Admin'}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>
                  {adminUser?.email || ''}
                </div>
              </div>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: 14,
                boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
              }}>
                {adminUser?.fullName?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <button
                onClick={handleLogout}
                title="Đăng xuất"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: '1px solid #fee2e2',
                  background: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#ef4444',
                  transition: 'all 0.2s',
                }}
              >
                <LogOut style={{ width: 15, height: 15 }} />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
