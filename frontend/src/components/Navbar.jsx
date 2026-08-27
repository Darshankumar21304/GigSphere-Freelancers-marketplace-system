import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Search, User, Bell, LogOut, Menu, X } from 'lucide-react';
import { getUserRole, isAuthenticated, logoutUser } from '../utils/authUtils';
import './Navbar.css';

const Navbar = () => {
  const isAuth = isAuthenticated();
  const role = getUserRole();
  const dashboardPath = isAuth && role ? `/${role}/dashboard` : '/auth/login';
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logoutUser();
    setIsMobileMenuOpen(false);
    setShowLogoutConfirm(false);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (isLandingPage) {
    return (
      <nav className="navbar glass landing-navbar">
        <div className="navbar-container">
          <div className="navbar-left">
            <Link to="/" className="navbar-brand large-logo" onClick={closeMobileMenu}>GigSphere</Link>
          </div>
          
          <div className="navbar-center landing-nav-center">
            <Link to="/explore" className="nav-link">Explore</Link>
            <Link to="/freelancers" className="nav-link">Freelancers</Link>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#categories" className="nav-link">Categories</a>
          </div>

          <div className="navbar-right">
            <div className="navbar-auth hidden-mobile">
              <Link to="/auth/login" className="btn btn-outline">Log In</Link>
              <Link to="/auth/register" className="btn btn-primary">Join GigSphere</Link>
            </div>
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu animate-fade-in-up">
            <div className="mobile-nav-links">
              <Link to="/explore" className="nav-link" onClick={closeMobileMenu}>Explore</Link>
              <Link to="/freelancers" className="nav-link" onClick={closeMobileMenu}>Freelancers</Link>
              <a href="#how-it-works" className="nav-link" onClick={closeMobileMenu}>How It Works</a>
              <a href="#categories" className="nav-link" onClick={closeMobileMenu}>Categories</a>
              <div className="mobile-auth-buttons">
                <Link to="/auth/login" className="btn btn-outline" onClick={closeMobileMenu}>Log In</Link>
                <Link to="/auth/register" className="btn btn-primary" onClick={closeMobileMenu}>Join GigSphere</Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    );
  }

  return (
    <nav className="navbar glass">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>GigSphere</Link>
          <div className="navbar-links">
            <Link to="/explore" className="nav-link">Explore</Link>
            <Link to="/freelancers" className="nav-link">Freelancers</Link>
            <Link to={dashboardPath} className="nav-link">Dashboard</Link>
          </div>
        </div>
        
        <div className="navbar-search hidden-mobile">
          <Search className="search-icon" size={18} />
          <input type="text" placeholder="Search projects or freelancers..." className="search-input" />
        </div>

        <div className="navbar-right">
          {isAuth && (
            <div className="hidden-mobile" style={{ display: 'flex', gap: '16px' }}>
              <Link to={`${dashboardPath}/notifications`} className="nav-icon-link">
                <Bell size={22} />
                <span className="badge badge-warning">3</span>
              </Link>
              <Link to={`${dashboardPath}/chat`} className="nav-icon-link">
                <MessageSquare size={22} />
                <span className="badge badge-danger">1</span>
              </Link>
            </div>
          )}
          
          <div className="navbar-auth hidden-mobile">
            {!isAuth ? (
              <>
                <Link to="/auth/login" className="btn btn-outline">Log in</Link>
                <Link to="/auth/register" className="btn btn-primary">Join</Link>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LogOut size={16} /> Log out
                </button>
                <Link to={dashboardPath} className="user-profile-dropdown" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white' }}>
                  <User size={24} />
                </Link>
              </div>
            )}
          </div>
          
          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu animate-fade-in-up">
          <div className="mobile-search" style={{ position: 'relative', width: '100%', marginBottom: '16px' }}>
             <Search className="search-icon" size={18} />
             <input type="text" placeholder="Search..." className="search-input" />
          </div>
          <div className="mobile-nav-links">
            <Link to="/explore" className="nav-link" onClick={closeMobileMenu}>Explore</Link>
            <Link to="/freelancers" className="nav-link" onClick={closeMobileMenu}>Freelancers</Link>
            <Link to={dashboardPath} className="nav-link" onClick={closeMobileMenu}>Dashboard</Link>
            
            {isAuth && (
              <div className="mobile-icons" style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '16px 0' }}>
                <Link to={`${dashboardPath}/notifications`} className="nav-icon-link" onClick={closeMobileMenu} style={{ justifyContent: 'flex-start' }}>
                  <Bell size={24} style={{ marginRight: '12px' }} /> Notifications
                </Link>
                <Link to={`${dashboardPath}/chat`} className="nav-icon-link" onClick={closeMobileMenu} style={{ justifyContent: 'flex-start' }}>
                  <MessageSquare size={24} style={{ marginRight: '12px' }} /> Messages
                </Link>
              </div>
            )}
            
            <div className="mobile-auth-buttons">
              {!isAuth ? (
                <>
                  <Link to="/auth/login" className="btn btn-outline" onClick={closeMobileMenu}>Log in</Link>
                  <Link to="/auth/register" className="btn btn-primary" onClick={closeMobileMenu}>Join</Link>
                </>
              ) : (
                <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}>
                  <LogOut size={16} /> Log out
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
    </nav>
  );
};

export default Navbar;
