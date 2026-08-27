import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import './Auth.css';

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p>Enter your email address to get reset instructions</p>
        </div>

        {submitted ? (
          <div className="text-center" style={{textAlign: 'center', marginBottom: '24px'}}>
            <div style={{color: 'var(--success)', marginBottom: '16px'}}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{margin: '0 auto'}}>
                <path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 style={{marginBottom: '8px'}}>Check your email</h3>
            <p style={{color: 'var(--text-secondary)'}}>We have sent a password reset link to your email address.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <div className="input-with-icon">
                <Mail className="input-icon" size={20} />
                <input 
                  type="email" 
                  id="email" 
                  placeholder=" "
                  required 
                />
                <label htmlFor="email">Email Address</label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit">Send Reset Link</button>
          </form>
        )}

        <div className="auth-footer" style={{marginTop: '32px'}}>
          <Link to="/auth/login" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
