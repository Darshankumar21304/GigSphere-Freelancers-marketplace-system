import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, ClipboardList, MessageSquare, 
  Settings, LogOut, Wallet, Briefcase, FileText, Users, 
  CreditCard, Star, Bell, Search, Folder, Menu, X, AlertTriangle
} from 'lucide-react';
import { getUserRole, logoutUser } from '../utils/authUtils';
import '../pages/dashboard/Dashboard.css';

export default function DashboardLayout() {
  const role = getUserRole() || 'client'; // Fallback to client if not set
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logoutUser();
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const clientNavItems = [
    { name: 'Dashboard', path: '/client/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Profile', path: '/client/dashboard/profile', icon: Users },
    { name: 'Create Project', path: '/client/dashboard/create-project', icon: PlusCircle },
    { name: 'My Projects', path: '/client/dashboard/my-projects', icon: Briefcase },
    { name: 'Received Proposals', path: '/client/dashboard/proposals', icon: FileText },
    { name: 'Hired Freelancers', path: '/client/dashboard/hired', icon: Users },
    { name: 'Payments', path: '/client/dashboard/wallet', icon: CreditCard },
    { name: 'Disputes', path: '/client/dashboard/disputes', icon: AlertTriangle },
    { name: 'Reviews', path: '/client/dashboard/reviews', icon: Star },
  ];

  const freelancerNavItems = [
    { name: 'Dashboard', path: '/freelancer/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Profile', path: '/freelancer/dashboard/profile', icon: Users },
    { name: 'Browse Projects', path: '/explore', icon: Search },
    { name: 'My Proposals', path: '/freelancer/dashboard/my-proposals', icon: FileText },
    { name: 'Active Projects', path: '/freelancer/dashboard/active-projects', icon: Briefcase },
    { name: 'Portfolio', path: '/freelancer/dashboard/portfolio', icon: Folder },
    { name: 'Earnings', path: '/freelancer/dashboard/wallet', icon: Wallet },
    { name: 'Disputes', path: '/freelancer/dashboard/disputes', icon: AlertTriangle },
    { name: 'Reviews', path: '/freelancer/dashboard/reviews', icon: Star },
  ];

  const activeNavItems = role === 'client' ? clientNavItems : freelancerNavItems;

  return (
    <div className="dashboard-layout">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="sidebar-title">GigSphere Panel</h2>
              <p className="sidebar-subtitle">
                {role === 'client' ? 'Client Workspace' : 'Freelancer Workspace'}
              </p>
            </div>
            <button className="mobile-close-sidebar" onClick={closeSidebar}>
              <X size={24} />
            </button>
          </div>
        </div>
        <nav className="sidebar-nav">
          {activeNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              onClick={closeSidebar}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon className="nav-item-icon" size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <NavLink 
            to={role === 'client' ? '/client/dashboard/settings' : '/freelancer/dashboard/settings'}
            onClick={closeSidebar}
            className={({ isActive }) => `sidebar-footer-btn ${isActive ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
          >
            <Settings className="nav-item-icon" size={20} />
            Settings
          </NavLink>
          <button className="sidebar-footer-btn logout" onClick={handleLogout}>
            <LogOut className="nav-item-icon" size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Mobile Header Toggle */}
        <div className="dashboard-mobile-header">
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <span className="mobile-dashboard-title">Dashboard</span>
        </div>
        <Outlet />
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'var(--bg-surface, #fff)', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, color: 'var(--text-main, #111)', fontSize: '20px', fontWeight: 600 }}>Confirm Logout</h3>
            <p style={{ color: 'var(--text-muted, #666)', marginBottom: '24px', fontSize: '15px' }}>Are you sure you want to log out of your account?</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-color, #ccc)', background: 'transparent', cursor: 'pointer', fontWeight: 500, color: 'var(--text-main, #111)' }}
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
