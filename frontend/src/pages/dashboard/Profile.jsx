import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Briefcase, MapPin, Edit2, Save, Camera, Shield, CheckCircle, 
  Settings, Building, Phone, AlertCircle, TrendingUp, Users, FileText, ChevronRight,
  RefreshCw, UploadCloud, X, ArrowRight
} from 'lucide-react';
import { getUserRole, getUserProfile, saveUserProfile } from '../../utils/authUtils';
import { formatINR } from '../../utils/currency';
import { apiFetch } from '../../utils/api';
import { uploadFileToCloudinary } from '../../utils/fileUpload';
import './ClientProfile.css';

export default function Profile() {
  const role = getUserRole();
  const savedProfile = getUserProfile();
  const avatarInputRef = useRef(null);
  const kycDocInputRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Profile updated successfully.');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // KYC Modal State
  const [kycStatus, setKycStatus] = useState(savedProfile?.verificationStatus || savedProfile?.kycStatus || 'Pending');
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [kycDocType, setKycDocType] = useState('Aadhaar Card');
  const [kycFile, setKycFile] = useState(null);
  const [isUploadingKyc, setIsUploadingKyc] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');

  // Wallet & project counts
  const [walletStats, setWalletStats] = useState({
    walletBalance: 0,
    escrowBalance: 0,
    totalProjects: 0,
    activeProjects: 0,
    hiredCount: 0
  });

  // Parse name
  let initialFirstName = role === 'client' ? 'Client' : 'Freelancer';
  let initialLastName = '';
  
  if (savedProfile && (savedProfile.name || savedProfile.fullName)) {
    const fullName = savedProfile.name || savedProfile.fullName;
    const parts = fullName.trim().split(' ');
    initialFirstName = parts[0] || '';
    initialLastName = parts.slice(1).join(' ') || '';
  }

  const [profileData, setProfileData] = useState({
    firstName: savedProfile?.firstName || initialFirstName,
    lastName: savedProfile?.lastName || initialLastName,
    email: savedProfile?.email || 'user@gigsphere.com',
    phone: savedProfile?.phone || '',
    title: savedProfile?.title || savedProfile?.profile?.title || '',
    location: savedProfile?.location || savedProfile?.city || 'India',
    state: savedProfile?.state || '',
    country: savedProfile?.country || 'India',
    companyName: savedProfile?.companyName || savedProfile?.name || 'Company',
    industry: savedProfile?.industry || 'Technology',
    companySize: savedProfile?.companySize || '1-10 employees',
    website: savedProfile?.website || '',
    companyDesc: savedProfile?.companyDesc || '',
    gstin: savedProfile?.gstin || '',
    bio: savedProfile?.bio || savedProfile?.profile?.bio || '',
    avatar: savedProfile?.avatar || savedProfile?.profilePhoto || ''
  });

  useEffect(() => {
    fetchLiveStats();
  }, []);

  const fetchLiveStats = async () => {
    try {
      const walletData = await apiFetch('/wallet').catch(() => ({ walletBalance: 0, escrowBalance: 0 }));
      const projects = await apiFetch('/projects').catch(() => []);
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'Open' || p.status === 'In Progress').length;
      const contracts = await apiFetch('/contracts/active').catch(() => []);
      const hiredCount = contracts.length;

      setWalletStats({
        walletBalance: walletData.walletBalance || 0,
        escrowBalance: walletData.escrowBalance || 0,
        totalProjects,
        activeProjects,
        hiredCount
      });

      // Fetch user profile and company settings
      const settingsData = await apiFetch('/users/settings').catch(() => null);
      if (settingsData && settingsData.user) {
        const u = settingsData.user;
        const nameParts = (u.name || '').trim().split(' ');
        const fName = nameParts[0] || '';
        const lName = nameParts.slice(1).join(' ') || '';

        setProfileData({
          firstName: fName || u.name || '',
          lastName: lName || '',
          email: u.email || '',
          phone: u.phone || '',
          location: u.location || '',
          state: u.state || '',
          country: u.country || 'India',
          companyName: u.companyName || u.name || '',
          industry: u.industry || 'Technology',
          companySize: u.companySize || '1-10 employees',
          website: u.website || '',
          companyDesc: u.companyDesc || '',
          gstin: u.gstin || '',
          title: u.title || (settingsData.profile?.title) || '',
          bio: u.bio || (settingsData.profile?.bio) || '',
          avatar: u.avatar || u.profilePhoto || ''
        });
      }
    } catch (err) {
      console.error('Failed to load live profile stats:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  // Functional Cloudinary Avatar Photo Upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const res = await uploadFileToCloudinary(file, '/api/upload/avatar');
      const newAvatarUrl = res.avatarUrl;

      setProfileData(prev => ({ ...prev, avatar: newAvatarUrl }));
      
      const updated = { 
        ...savedProfile, 
        ...profileData, 
        avatar: newAvatarUrl,
        profilePhoto: newAvatarUrl,
        name: `${profileData.firstName} ${profileData.lastName}` 
      };
      saveUserProfile(updated);

      setToastMessage('Profile photo updated & saved on Cloudinary!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to upload photo to Cloudinary');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // KYC Verification Upload Handler via Cloudinary
  const handleKycSubmit = async (e) => {
    e.preventDefault();
    if (!kycFile) {
      alert('Please select an ID document to upload.');
      return;
    }

    setIsUploadingKyc(true);
    try {
      const res = await uploadFileToCloudinary(kycFile, '/api/upload/single');
      
      setKycStatus('Verified');
      const updated = {
        ...savedProfile,
        verificationStatus: 'Verified',
        kycStatus: 'Verified',
        kycDocUrl: res.url
      };
      saveUserProfile(updated);

      setIsKycModalOpen(false);
      setToastMessage('Identity Verified successfully via Cloudinary KYC!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } catch (err) {
      alert(err.message || 'KYC verification upload failed');
    } finally {
      setIsUploadingKyc(false);
    }
  };

  const handleSave = async () => {
    if (!profileData.firstName || !profileData.email) return;
    try {
      const payload = {
        name: `${profileData.firstName} ${profileData.lastName}`,
        phone: profileData.phone,
        location: profileData.location,
        state: profileData.state,
        country: profileData.country,
        companyName: profileData.companyName,
        industry: profileData.industry,
        companySize: profileData.companySize,
        website: profileData.website,
        companyDesc: profileData.companyDesc,
        gstin: profileData.gstin,
        avatar: profileData.avatar,
        profilePhoto: profileData.avatar
      };

      const response = await apiFetch('/users/settings', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (response && response.user) {
        saveUserProfile(response.user);
      }

      setIsEditing(false);
      setHasChanges(false);
      setToastMessage('Profile and Company details saved successfully.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      alert(error.message || 'Failed to save profile changes');
    }
  };

  const handlePasswordSave = async () => {
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
    
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new
        })
      });

      setIsChangingPassword(false);
      setPasswords({ current: '', new: '', confirm: '' });
      setPasswordError('');
      setToastMessage('Password updated successfully.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setHasChanges(false);
  };

  const tabs = ['Overview', 'Personal Information', ...(role === 'client' ? ['Company Details'] : []), 'Security'];

  return (
    <div className="gigsphere-client-profile">
      {/* Hidden File Input for Avatar */}
      <input 
        type="file" 
        ref={avatarInputRef}
        onChange={handleAvatarUpload}
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
      />

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
          <p className="gcp-page-description">Manage your personal information, profile picture, and company details.</p>
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
              <div className="gcp-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Profile Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>{role === 'client' ? (profileData.companyName || profileData.firstName || 'C')?.charAt(0) : profileData.firstName?.charAt(0)}</span>
                )}
              </div>
              <button 
                type="button" 
                className="gcp-avatar-button" 
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? <RefreshCw size={18} className="spin" /> : <Camera size={20} />}
                <span>{isUploadingAvatar ? 'Uploading...' : 'Change'}</span>
              </button>
            </div>
            <div className="gcp-profile-info">
              <div className="gcp-profile-name-row">
                <h2 className="gcp-profile-name">{profileData.firstName} {profileData.lastName}</h2>
                <CheckCircle size={16} className="gcp-verified-badge" />
              </div>
              <div className="gcp-profile-meta">
                <span>{profileData.companyName || profileData.title || 'GigSphere Member'}</span>
                <span>•</span>
                <span>{profileData.location || 'India'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="gcp-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`gcp-tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="gcp-content-grid">
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
                    <div className="gcp-stat-value">{walletStats.totalProjects}</div>
                    <div className="gcp-stat-label">Total Projects</div>
                  </div>
                </div>
                <div className="gcp-stat-card">
                  <div className="gcp-stat-icon text-blue">
                    <TrendingUp size={20} />
                  </div>
                  <div className="gcp-stat-content">
                    <div className="gcp-stat-value">{walletStats.activeProjects}</div>
                    <div className="gcp-stat-label">Active Projects</div>
                  </div>
                </div>
                <div className="gcp-stat-card">
                  <div className="gcp-stat-icon text-purple">
                    <Users size={20} />
                  </div>
                  <div className="gcp-stat-content">
                    <div className="gcp-stat-value">{walletStats.hiredCount}</div>
                    <div className="gcp-stat-label">{role === 'client' ? 'Freelancers Hired' : 'Happy Clients'}</div>
                  </div>
                </div>
                <div className="gcp-stat-card">
                  <div className="gcp-stat-icon text-green">
                    <span style={{fontSize: '18px', fontWeight: 'bold'}}>₹</span>
                  </div>
                  <div className="gcp-stat-content">
                    <div className="gcp-stat-value">{formatINR(walletStats.walletBalance)}</div>
                    <div className="gcp-stat-label">Available Balance</div>
                  </div>
                </div>
              </div>

              {/* About Section */}
              {role === 'client' ? (
                <div className="gcp-about-card">
                  <h3 className="gcp-card-header">About Company</h3>
                  <p className="gcp-company-description">{profileData.companyDesc || 'No company description added yet. Click Edit Profile to add company overview.'}</p>
                  <div className="gcp-company-details">
                    <div>
                      <span className="gcp-detail-label">Industry</span>
                      <span className="gcp-detail-value">{profileData.industry || 'Technology'}</span>
                    </div>
                    <div>
                      <span className="gcp-detail-label">Company Size</span>
                      <span className="gcp-detail-value">{profileData.companySize || '1-10 employees'}</span>
                    </div>
                    <div>
                      <span className="gcp-detail-label">Website</span>
                      {profileData.website ? (
                        <a href={profileData.website} target="_blank" rel="noreferrer" className="gcp-detail-value gcp-link">{profileData.website.replace('https://', '')}</a>
                      ) : (
                        <span className="gcp-detail-value" style={{ color: '#94a3b8' }}>Not provided</span>
                      )}
                    </div>
                    <div>
                      <span className="gcp-detail-label">Location</span>
                      <span className="gcp-detail-value">{profileData.location}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="gcp-about-card">
                  <h3 className="gcp-card-header">About Me</h3>
                  <p className="gcp-company-description">{profileData.bio || 'No bio added yet. Click Edit Profile to add your professional bio.'}</p>
                  <div className="gcp-company-details">
                    <div>
                      <span className="gcp-detail-label">Location</span>
                      <span className="gcp-detail-value">{profileData.location}</span>
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
                  <input type="text" name="phone" value={profileData.phone} placeholder="Enter phone number" onChange={handleChange} disabled={!isEditing} className="gcp-input" />
                </div>
                <div className="gcp-form-group">
                  <label className="gcp-form-label">Job Title</label>
                  <input type="text" name="title" value={profileData.title} placeholder="e.g. Founder, Product Manager" onChange={handleChange} disabled={!isEditing} className="gcp-input" />
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
                    <option value="Information Technology">Information Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="E-commerce">E-commerce</option>
                  </select>
                </div>
                <div className="gcp-form-group">
                  <label className="gcp-form-label">Company Size</label>
                  <select name="companySize" value={profileData.companySize} onChange={handleChange} disabled={!isEditing} className="gcp-input">
                    <option value="1-10 employees">1-10 employees</option>
                    <option value="11-50 employees">11-50 employees</option>
                    <option value="50-200 employees">50-200 employees</option>
                    <option value="201-500 employees">201-500 employees</option>
                  </select>
                </div>
                <div className="gcp-form-group">
                  <label className="gcp-form-label">GSTIN</label>
                  <input type="text" name="gstin" value={profileData.gstin} placeholder="Optional GSTIN" onChange={handleChange} disabled={!isEditing} className="gcp-input uppercase" />
                </div>
                <div className="gcp-form-group gcp-col-span-full">
                  <label className="gcp-form-label">Company Description</label>
                  <textarea name="companyDesc" value={profileData.companyDesc} placeholder="Describe your company and core products/services" onChange={handleChange} disabled={!isEditing} rows={4} className="gcp-input resize-none" />
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
                    <option value="India">India</option>
                    <option value="United States">United States</option>
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
                      <p className="gcp-row-desc">Keep your login credentials secure</p>
                    </div>
                    <button onClick={() => setIsChangingPassword(true)} className="gcp-btn-secondary">Update</button>
                  </div>
                )}
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
              <div 
                className="gcp-status-row-small" 
                style={{ cursor: 'pointer' }}
                onClick={() => setIsKycModalOpen(true)}
                title="Click to Verify Identity via Cloudinary KYC Upload"
              >
                <span className="gcp-status-label">Identity Verification</span>
                <span className={`gcp-status-badge ${kycStatus === 'Verified' ? 'badge-green' : 'badge-orange'}`}>
                  {kycStatus === 'Verified' ? <CheckCircle size={12}/> : <AlertCircle size={12}/>} {kycStatus === 'Verified' ? 'Verified' : 'Verify Now'}
                </span>
              </div>
              <div className="gcp-status-row-small gcp-border-none">
                <span className="gcp-status-label">Payment Method</span>
                <span className="gcp-status-badge badge-green"><CheckCircle size={12}/> Razorpay Added</span>
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

      {/* KYC Identity Verification Modal Popup */}
      {isKycModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justify: 'center', zIndex: 99999, padding: '1rem' }} onClick={() => setIsKycModalOpen(false)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '460px', width: '100%', padding: '1.75rem', color: '#0f172a', margin: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e8f0fe', display: 'flex', alignItems: 'center', justify: 'center' }}>
                  <Shield size={20} color="#1a73e8" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Identity Verification (KYC)</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cloudinary Secured Upload</span>
                </div>
              </div>
              <button onClick={() => setIsKycModalOpen(false)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justify: 'center', color: '#64748b', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleKycSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem', textAlign: 'left' }}>Document Type</label>
                <select 
                  value={kycDocType}
                  onChange={(e) => setKycDocType(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', outline: 'none', background: '#ffffff' }}
                >
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem', textAlign: 'left' }}>Upload Document Image/PDF (Max 15MB)</label>
                <input 
                  type="file" 
                  ref={kycDocInputRef}
                  onChange={(e) => setKycFile(e.target.files[0])}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  style={{ display: 'none' }}
                />
                <div 
                  onClick={() => kycDocInputRef.current?.click()}
                  style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', background: '#f8fafc', cursor: 'pointer' }}
                >
                  <UploadCloud size={28} color="#1a73e8" style={{ marginBottom: '6px' }} />
                  <p style={{ margin: '0 0 4px', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                    {kycFile ? kycFile.name : `Click to upload your ${kycDocType}`}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>JPG, PNG, WEBP or PDF up to 15 MB</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsKycModalOpen(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: '40px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isUploadingKyc} style={{ padding: '0.65rem 1.5rem', borderRadius: '40px', background: '#1a73e8', border: '1px solid #1a73e8', color: '#ffffff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {isUploadingKyc ? <RefreshCw size={14} className="spin" /> : <Shield size={14} />}
                  {isUploadingKyc ? 'Uploading to Cloudinary...' : 'Verify Identity Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
