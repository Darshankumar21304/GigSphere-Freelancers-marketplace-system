import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Layers, 
  AlertTriangle, 
  Building2,
  ShieldCheck, 
  LogOut
} from 'lucide-react';
import { logoutUser } from '../utils/authUtils';
import './AdminLayout.css';

export default function AdminLayout() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const confirmLogout = () => {
    logoutUser();
    navigate('/auth/login');
  };

  return (
    <div className="admin-wrapper">
      {/* Minimalist Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link to="/" style={{ textDecoration: 'none', color: '#0f172a', fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.03em' }}>
            GigSphere
          </Link>
          <span className="admin-brand-tag">ADMIN</span>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" end className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <BarChart3 size={18} />
            <span>Overview</span>
          </NavLink>

          <NavLink to="/admin/dashboard/users" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Users size={18} />
            <span>Users</span>
          </NavLink>

          <NavLink to="/admin/dashboard/listings" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Layers size={18} />
            <span>Listings</span>
          </NavLink>

          <NavLink to="/admin/dashboard/disputes" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <AlertTriangle size={18} />
            <span>Disputes</span>
          </NavLink>

          <NavLink to="/admin/dashboard/payouts" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Building2 size={18} />
            <span>Payouts</span>
          </NavLink>

          <NavLink to="/admin/dashboard/ai-security" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <ShieldCheck size={18} />
            <span>AI & Security</span>
          </NavLink>
        </nav>

        <div className="admin-user-footer">
          <button onClick={() => setShowLogoutConfirm(true)} className="min-btn min-btn-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', width: '100%' }}>
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Admin Page Content */}
      <main className="admin-content">
        <Outlet />
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, color: '#0f172a', fontSize: '20px', fontWeight: 600 }}>Confirm Admin Logout</h3>
            <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '15px' }}>Are you sure you want to log out of the Admin portal?</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'transparent', cursor: 'pointer', fontWeight: 500, color: '#0f172a' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 500 }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
