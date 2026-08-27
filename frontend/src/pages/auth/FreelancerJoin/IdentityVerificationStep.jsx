import React from 'react';
import { Shield, CheckCircle, UploadCloud } from 'lucide-react';

export default function IdentityVerificationStep({ formData, updateFormData, nextStep, prevStep }) {

  const handleNext = (e) => {
    e.preventDefault();
    nextStep();
  };

  const handleCheckbox = (e) => {
    updateFormData({ termsAccepted: e.target.checked });
  };

  return (
    <div className="step-content animate-fade-in">
      <div className="security-badge">
        <Shield size={32} className="text-success" />
      </div>
      <h2 className="step-title">Verify your identity</h2>
      <p className="step-description">We need to verify your identity to keep our platform secure.</p>

      <form onSubmit={handleNext} className="join-form max-w-md mx-auto">
        
        <div className="upload-box dashed-border">
          <UploadCloud size={32} className="upload-icon" />
          <h4>Upload Government ID (Optional)</h4>
          <p>Passport, Driver's License, or National ID</p>
          <input type="file" className="hidden-input" id="id-upload" />
          <label htmlFor="id-upload" className="btn btn-outline btn-sm mt-2">Browse Files</label>
        </div>

        <div className="trust-indicators">
          <div className="trust-item">
            <CheckCircle size={16} className="text-success" />
            <span>Information is encrypted</span>
          </div>
          <div className="trust-item">
            <CheckCircle size={16} className="text-success" />
            <span>Never shared publicly</span>
          </div>
        </div>

        <div className="terms-checkbox">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              required
              checked={formData.termsAccepted || false}
              onChange={handleCheckbox}
            />
            <span className="checkbox-text">
              I understand and agree to the <a href="#">Terms of Service</a>, including the User Agreement and Privacy Policy.
            </span>
          </label>
        </div>

        <div className="step-actions split">
          <button type="button" className="btn btn-outline back-button" onClick={prevStep}>
            Back
          </button>
          <button type="submit" className="btn btn-primary next-button" disabled={!formData.termsAccepted}>
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
