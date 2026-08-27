import React, { useState } from 'react';
import { Camera, IndianRupee, Clock, FileText } from 'lucide-react';

export default function ProfileSetupStep({ formData, updateFormData, nextStep, prevStep }) {
  const [previewImage, setPreviewImage] = useState(formData.profileImage || null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a fake object URL for preview purposes
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      updateFormData({ profileImage: imageUrl });
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="step-content animate-fade-in split-layout">
      <div className="layout-left">
        <h2 className="step-title">Set up your profile</h2>
        <p className="step-description">Clients care about who they're hiring. Make a great impression.</p>

        <form onSubmit={handleNext} className="join-form">
          
          <div className="photo-upload-section">
            <div className="photo-preview">
              {previewImage ? (
                <img src={previewImage} alt="Profile Preview" />
              ) : (
                <div className="photo-placeholder">
                  <Camera size={32} />
                </div>
              )}
            </div>
            <div className="photo-upload-actions">
              <label htmlFor="photo-upload" className="btn btn-outline upload-btn">
                Upload Photo
              </label>
              <input 
                id="photo-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="hidden-input"
              />
              <p className="upload-hint">Max size 2MB. Use a professional headshot.</p>
            </div>
          </div>

          <div className="form-group">
            <label className="standard-label">Professional Bio</label>
            <div className="textarea-wrapper">
              <FileText className="input-icon top-icon" size={20} />
              <textarea 
                name="bio"
                placeholder="Hi, I'm a professional..."
                value={formData.bio || ''}
                onChange={handleChange}
                rows="4"
                required
              ></textarea>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="standard-label">Availability</label>
              <div className="input-with-icon join-input no-float select-wrapper">
                <Clock className="input-icon" size={20} />
                <select 
                  name="availability" 
                  value={formData.availability || ''} 
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select availability</option>
                  <option value="full-time">Full-time (30+ hrs/wk)</option>
                  <option value="part-time">Part-time (10-30 hrs/wk)</option>
                  <option value="as-needed">As needed (Open to offers)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="standard-label">Fixed Rate (₹)</label>
              <div className="input-with-icon join-input no-float">
                <IndianRupee className="input-icon" size={20} />
                <input 
                  type="number" 
                  name="hourlyRate"
                  placeholder="e.g. 25"
                  value={formData.hourlyRate || ''}
                  onChange={handleChange}
                  min="5"
                  required 
                />
              </div>
            </div>
          </div>

          <div className="step-actions split">
            <button type="button" className="btn btn-outline back-button" onClick={prevStep}>
              Back
            </button>
            <button type="submit" className="btn btn-primary next-button">
              Continue
            </button>
          </div>
        </form>
      </div>

      <div className="layout-right">
        {/* Live Profile Preview Card */}
        <div className="profile-preview-card glass">
          <div className="preview-header">
            <div className="preview-avatar">
              {previewImage ? <img src={previewImage} alt="Profile" /> : <Camera size={24} />}
            </div>
            <div className="preview-info">
              <h3>{formData.fullName || 'Your Name'}</h3>
              <p className="preview-title">{formData.title || 'Professional Title'}</p>
              <span className="preview-location">{formData.country || 'Country'}</span>
            </div>
          </div>
          <div className="preview-body">
            <h4>About Me</h4>
            <p className="preview-bio">{formData.bio || 'Your bio will appear here...'}</p>
            
            <div className="preview-stats">
              <div className="stat">
                <span className="stat-label">Rate</span>
                <span className="stat-value">₹{formData.hourlyRate || '0'}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Availability</span>
                <span className="stat-value">{formData.availability ? formData.availability.replace('-', ' ') : 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
