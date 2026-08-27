import React, { useState } from 'react';
import { 
  User, Mail, Briefcase, MapPin, Edit2, Save, Camera, Shield, CheckCircle, 
  Settings, Building, Phone, AlertCircle, TrendingUp, Users, FileText, ChevronRight
} from 'lucide-react';
import { getUserRole, getUserProfile, saveUserProfile } from '../../utils/authUtils';
import { formatINR } from '../../utils/currency';
import './ClientProfile.css';

export default function Profile() {
  const role = getUserRole();
  const savedProfile = getUserProfile();
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Profile updated successfully.');

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');

  // Parse fullName if available
  let initialFirstName = role === 'client' ? 'Jane' : 'Alex';
  let initialLastName = role === 'client' ? 'Doe' : 'Smith';
  
  if (savedProfile && (savedProfile.name || savedProfile.fullName)) {
    const fullName = savedProfile.name || savedProfile.fullName;
    const parts = fullName.trim().split(' ');
    initialFirstName = parts[0] || '';
    initialLastName = parts.slice(1).join(' ') || '';
  }

  const [profileData, setProfileData] = useState({
    firstName: savedProfile?.firstName || initialFirstName,
    lastName: savedProfile?.lastName || initialLastName,
    email: savedProfile?.email || (role === 'client' ? 'jane@company.com' : 'alex@freelance.com'),
    phone: savedProfile?.phone || '+91 98765 43210',
    title: savedProfile?.title || (role === 'client' ? 'Product Manager' : 'Senior UI/UX Designer'),
    location: savedProfile?.location || 'Mumbai',
    state: savedProfile?.state || 'Maharashtra',
    country: savedProfile?.country || 'India',
    companyName: savedProfile?.companyName || 'TechNova Solutions',
    industry: savedProfile?.industry || 'Information Technology',
    companySize: savedProfile?.companySize || '50-200 employees',
    website: savedProfile?.website || 'https://technova.in',
    companyDesc: savedProfile?.companyDesc || 'TechNova is a leading provider of innovative digital solutions, specializing in e-commerce platforms and mobile applications.',
    gstin: savedProfile?.gstin || '27AADCB2230M1Z2',
    bio: savedProfile?.bio || (role === 'client' 
      ? 'Looking for talented designers and developers to build amazing products.' 
      : 'Passionate designer with 5+ years of experience creating user-centric digital products.'),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Basic validation
    if (!profileData.firstName || !profileData.email) return;
    setIsEditing(false);
    setHasChanges(false);
    saveUserProfile({ ...savedProfile, ...profileData });
    setToastMessage('Profile updated successfully.');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handlePasswordSave = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPasswordError('All fields are required.');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwords.new.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    
    // Simulate successful password change
    setIsChangingPassword(false);
    setPasswords({ current: '', new: '', confirm: '' });
    setPasswordError('');
    setToastMessage('Password updated successfully.');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setHasChanges(false);
    // Ideally restore original state here
  };

  const tabs = ['Overview', 'Personal Information', ...(role === 'client' ? ['Company Details'] : []), 'Security', 'Preferences'];

  return (
    <div className="gigsphere-client-profile">
      {/* Breadcrumbs */}
      <div className="gcp-breadcrumbs">
        <span>Dashboard</span>
        <ChevronRight size={14} className="gcp-breadcrumb-icon" />
        <span className="gcp-breadcrumb-active">Profile</span>
      </div>

      {/* Header */}
      <div className="gcp-page-header">
        <div className="gcp-page-header-content">
          <h1 className="gcp-page-title">My Profile</h1>
          <p className="gcp-page-description">Manage your personal information, company details, and preferences.</p>
        </div>
        <button 
          onClick={() => { setActiveTab('Personal Information'); setIsEditing(true); }}
          className="gcp-primary-button"
        >
          <Edit2 size={16} /> Edit Profile
        </button>
      </div>

      {/* Hero Section */}
      <div className="gcp-profile-hero">
        <div className="gcp-profile-cover"></div>
        <div className="gcp-profile-main">
          <div className="gcp-profile-identity">
            <div className="gcp-avatar-wrapper group">
              <div className="gcp-avatar">
                {role === 'client' ? profileData.companyName?.charAt(0) : profileData.firstName?.charAt(0)}
              </div>
              <button className="gcp-avatar-button">
                <Camera size={20} />
                <span>Change</span>
              </button>
            </div>
            <div className="gcp-profile-info">
              <div className="gcp-profile-name-row">
                <h2 className="gcp-profile-name">{profileData.firstName} {profileData.lastName}</h2>
                <CheckCircle size={16} className="gcp-verified-badge" />
              </div>
              <div className="gcp-profile-meta">
                {role === 'client' && <span className="gcp-company-line"><Building size={14} /> {profileData.companyName}</span>}
                <span className="gcp-location-line"><MapPin size={14} /> {profileData.location}, {profileData.country || 'India'}</span>
              </div>
            </div>
          </div>
          
          {/* Profile Completeness Card */}
          <div className="gcp-strength-panel">
            <div className="gcp-strength-header">
              <span className="gcp-strength-title">Profile Strength</span>
              <span className="gcp-strength-value">85%</span>
            </div>
            <div className="gcp-strength-progress">
              <div className="gcp-strength-progress-fill" style={{ width: '85%' }}></div>
            </div>
            <p className="gcp-strength-suggestions">Complete your profile to build trust.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="gcp-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setIsEditing(false); }}
            className={`gcp-tab ${activeTab === tab ? 'gcp-tab-active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="gcp-content-grid">
        {/* Main Content Area */}
        <div className="gcp-content-left">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'Overview' && (
            <>
              {/* KPI Summary Cards */}
              <div className="gcp-stats-grid">
                <div className="gcp-stat-card">
                  <div className="gcp-stat-icon text-brand">
                    <FileText size={20} />
                  </div>
                  <div className="gcp-stat-content">
                    <div className="gcp-stat-value">12</div>
                    <div className="gcp-stat-label">Total Projects</div>
                  </div>
                </div>
                <div className="gcp-stat-card">
                  <div className="gcp-stat-icon text-blue">
                    <TrendingUp size={20} />
                  </div>
                  <div className="gcp-stat-content">
                    <div className="gcp-stat-value">3</div>
                    <div className="gcp-stat-label">Active Projects</div>
                  </div>
                </div>
                <div className="gcp-stat-card">
                  <div className="gcp-stat-icon text-purple">
                    <Users size={20} />
                  </div>
                  <div className="gcp-stat-content">
                    <div className="gcp-stat-value">8</div>
                    <div className="gcp-stat-label">{role === 'client' ? 'Freelancers Hired' : 'Happy Clients'}</div>
                  </div>
                </div>
                <div className="gcp-stat-card">
                  <div className="gcp-stat-icon text-green">
                    <span style={{fontSize: '18px', fontWeight: 'bold'}}>₹</span>
                  </div>
                  <div className="gcp-stat-content">
                    <div className="gcp-stat-value">{formatINR(125000)}</div>
                    <div className="gcp-stat-label">{role === 'client' ? 'Total Spent' : 'Total Earned'}</div>
                  </div>
                </div>
              </div>

              {/* About Section */}
              {role === 'client' ? (
                <div className="gcp-about-card">
                  <h3 className="gcp-card-header">About Company</h3>
                  <p className="gcp-company-description">{profileData.companyDesc}</p>
                  <div className="gcp-company-details">
                    <div>
                      <span className="gcp-detail-label">Industry</span>
                      <span className="gcp-detail-value">{profileData.industry}</span>
                    </div>
                    <div>
                      <span className="gcp-detail-label">Company Size</span>
                      <span className="gcp-detail-value">{profileData.companySize}</span>
                    </div>
                    <div>
                      <span className="gcp-detail-label">Website</span>
                      <a href={profileData.website} className="gcp-detail-value gcp-link">{profileData.website.replace('https://', '')}</a>
                    </div>
                    <div>
                      <span className="gcp-detail-label">Location</span>
                      <span className="gcp-detail-value">{profileData.location}, {profileData.state}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="gcp-about-card">
                  <h3 className="gcp-card-header">About Me</h3>
                  <p className="gcp-company-description">{profileData.bio}</p>
                  <div className="gcp-company-details">
                    <div>
                      <span className="gcp-detail-label">Location</span>
                      <span className="gcp-detail-value">{profileData.location}, {profileData.state}</span>
                    </div>
                    <div>
                      <span className="gcp-detail-label">Country</span>
                      <span className="gcp-detail-value">{profileData.country}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* PERSONAL INFO TAB */}
          {activeTab === 'Personal Information' && (
            <div className="gcp-about-card">
              <div className="gcp-card-header-row">
                <h3 className="gcp-card-header">Personal Information</h3>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="gcp-edit-link">Edit</button>
                )}
              </div>

              <div className="gcp-form-grid">
                <div className="gcp-form-group">
                  <label className="gcp-form-label">First Name <span className="gcp-required">*</span></label>
                  <input type="text" name="firstName" value={profileData.firstName} onChange={handleChange} disabled={!isEditing} className="gcp-input" />
                </div>
                <div className="gcp-form-group">
                  <label className="gcp-form-label">Last Name <span className="gcp-required">*</span></label>
                  <input type="text" name="lastName" value={profileData.lastName} onChange={handleChange} disabled={!isEditing} className="gcp-input" />
                </div>
                <div className="gcp-form-group">
                  <label className="gcp-form-label">Email Address <span className="gcp-required">*</span></label>
                  <input type="email" name="email" value={profileData.email} onChange={handleChange} disabled={!isEditing} className="gcp-input" />
                </div>
                <div className="gcp-form-group">
                  <label className="gcp-form-label">Phone Number</label>
                  <input type="text" name="phone" value={profileData.phone} onChange={handleChange} disabled={!isEditing} className="gcp-input" />
                </div>
                <div className="gcp-form-group">
                  <label className="gcp-form-label">Job Title</label>
                  <input type="text" name="title" value={profileData.title} onChange={handleChange} disabled={!isEditing} className="gcp-input" />
                </div>
              </div>

              {isEditing && (
                <div className="gcp-form-actions">
                  <button onClick={cancelEdit} className="gcp-btn-secondary">Cancel</button>
                  <button onClick={handleSave} className="gcp-btn-primary"><Save size={16} /> Save Changes</button>
                </div>
              )}
            </div>
          )}

          {/* COMPANY DETAILS TAB */}
          {activeTab === 'Company Details' && (
            <div className="gcp-about-card">
              <div className="gcp-card-header-row">
                <h3 className="gcp-card-header">Company Information</h3>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="gcp-edit-link">Edit</button>
                )}
              </div>

              <div className="gcp-form-grid gcp-mb-24">
                <div className="gcp-form-group">
                  <label className="gcp-form-label">Company Name <span className="gcp-required">*</span></label>
                  <input type="text" name="companyName" value={profileData.companyName} onChange={handleChange} disabled={!isEditing} className="gcp-input" />
                </div>
                <div className="gcp-form-group">
                  <label className="gcp-form-label">Industry</label>
                  <select name="industry" value={profileData.industry} onChange={handleChange} disabled={!isEditing} className="gcp-input">
                    <option>Information Technology</option>
                    <option>Finance</option>
                    <option>Healthcare</option>
                    <option>Education</option>
                  </select>
                </div>
                <div className="gcp-form-group">
                  <label className="gcp-form-label">Company Size</label>
                  <select name="companySize" value={profileData.companySize} onChange={handleChange} disabled={!isEditing} className="gcp-input">
                    <option>1-10 employees</option>
                    <option>11-50 employees</option>
                    <option>50-200 employees</option>
                    <option>201-500 employees</option>
                  </select>
                </div>
                <div className="gcp-form-group">
                  <label className="gcp-form-label">GSTIN</label>
                  <input type="text" name="gstin" value={profileData.gstin} onChange={handleChange} disabled={!isEditing} className="gcp-input uppercase" />
                </div>
                <div className="gcp-form-group gcp-col-span-full">
                  <label className="gcp-form-label">Company Description</label>
                  <textarea name="companyDesc" value={profileData.companyDesc} onChange={handleChange} disabled={!isEditing} rows={4} className="gcp-input resize-none" />
                  {isEditing && <div className="gcp-char-count">{profileData.companyDesc.length} / 500</div>}
                </div>
              </div>

              <h4 className="gcp-card-subheader">Company Location</h4>
              <div className="gcp-form-grid-3">
                 <div className="gcp-form-group">
                  <label className="gcp-form-label">City</label>
                  <input type="text" name="location" value={profileData.location} onChange={handleChange} disabled={!isEditing} className="gcp-input" />
                </div>
                <div className="gcp-form-group">
                  <label className="gcp-form-label">State</label>
                  <input type="text" name="state" value={profileData.state} onChange={handleChange} disabled={!isEditing} className="gcp-input" />
                </div>
                <div className="gcp-form-group">
                  <label className="gcp-form-label">Country</label>
                  <select name="country" value={profileData.country} onChange={handleChange} disabled={!isEditing} className="gcp-input">
                    <option>India</option>
                    <option>United States</option>
                  </select>
                </div>
              </div>

              {isEditing && (
                <div className="gcp-form-actions">
                  <button onClick={cancelEdit} className="gcp-btn-secondary">Cancel</button>
                  <button onClick={handleSave} className="gcp-btn-primary"><Save size={16} /> Save Changes</button>
                </div>
              )}
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'Security' && (
            <div className="gcp-security-stack">
              <div className="gcp-about-card">
                <h3 className="gcp-card-header gcp-mb-16">Password</h3>
                
                {isChangingPassword ? (
                  <div className="gcp-form-grid" style={{ marginTop: '16px' }}>
                    <div className="gcp-form-group">
                      <label className="gcp-form-label">Current Password</label>
                      <input type="password" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} className="gcp-input" />
                    </div>
                    <div className="gcp-form-group">
                      <label className="gcp-form-label">New Password</label>
                      <input type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} className="gcp-input" />
                    </div>
                    <div className="gcp-form-group">
                      <label className="gcp-form-label">Confirm New Password</label>
                      <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} className="gcp-input" />
                    </div>
                    {passwordError && <p className="gcp-error-message" style={{color: 'var(--danger)', fontSize: '14px', gridColumn: '1/-1', margin: 0}}>{passwordError}</p>}
                    <div className="gcp-form-actions" style={{ gridColumn: '1/-1', marginTop: '8px' }}>
                      <button onClick={() => {setIsChangingPassword(false); setPasswordError(''); setPasswords({ current: '', new: '', confirm: '' });}} className="gcp-btn-secondary">Cancel</button>
                      <button onClick={handlePasswordSave} className="gcp-btn-primary">Save Password</button>
                    </div>
                  </div>
                ) : (
                  <div className="gcp-status-row">
                    <div>
                      <p className="gcp-row-title">Change Password</p>
                      <p className="gcp-row-desc">Last changed 3 months ago</p>
                    </div>
                    <button onClick={() => setIsChangingPassword(true)} className="gcp-btn-secondary">Update</button>
                  </div>
                )}
              </div>

              <div className="gcp-about-card">
                <h3 className="gcp-card-header gcp-mb-16">Two-Factor Authentication</h3>
                <div className="gcp-status-row">
                  <div className="gcp-status-content-left">
                    <Shield size={20} className="gcp-icon-brand" />
                    <div>
                      <p className="gcp-row-title">Protect your account with 2FA</p>
                      <p className="gcp-row-desc">Add an extra layer of security to your account by requiring a code upon login.</p>
                    </div>
                  </div>
                  <button className="gcp-btn-brand-light">Enable 2FA</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Preferences' && (
            <div className="gcp-about-card">
               <div className="gcp-empty-state">
                  <Settings size={48} className="gcp-empty-icon" />
                  <h3 className="gcp-empty-title">Notification Preferences</h3>
                  <p className="gcp-empty-desc">Configure how you receive alerts and emails.</p>
                  <button className="gcp-btn-secondary gcp-mt-16">Manage Settings</button>
               </div>
            </div>
          )}

        </div>

        {/* Right Sidebar */}
        <div className="gcp-content-right">
          <div className="gcp-account-card">
            <h3 className="gcp-card-header-small">Account Status</h3>
            <div className="gcp-status-list">
              <div className="gcp-status-row-small">
                <span className="gcp-status-label">Email Verification</span>
                <span className="gcp-status-badge badge-green"><CheckCircle size={12}/> Verified</span>
              </div>
              <div className="gcp-status-row-small">
                <span className="gcp-status-label">Identity Verification</span>
                <span className="gcp-status-badge badge-orange"><AlertCircle size={12}/> Pending</span>
              </div>
              <div className="gcp-status-row-small gcp-border-none">
                <span className="gcp-status-label">Payment Method</span>
                <span className="gcp-status-badge badge-green"><CheckCircle size={12}/> Added</span>
              </div>
            </div>
          </div>
          
           {hasChanges && (
            <div className="gcp-alert-card">
              <AlertCircle size={18} className="gcp-alert-icon" />
              <div>
                <p className="gcp-alert-title">Unsaved Changes</p>
                <p className="gcp-alert-desc">You have unsaved changes in your profile. Make sure to save them before leaving.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="gcp-toast">
          <CheckCircle size={18} className="gcp-toast-icon" />
          <span className="gcp-toast-text">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
