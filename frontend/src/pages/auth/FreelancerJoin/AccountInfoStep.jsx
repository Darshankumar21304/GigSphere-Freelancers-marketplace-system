import React, { useState } from 'react';
import { User, Mail, Lock, Globe2, Eye, EyeOff } from 'lucide-react';

export default function AccountInfoStep({ formData, updateFormData, nextStep }) {
  const [showPassword, setShowPassword] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    // In a real app, you'd add deeper validation here
    nextStep();
  };

  const getPasswordStrength = () => {
    const pass = formData.password || '';
    if (pass.length === 0) return 0;
    if (pass.length < 6) return 1;
    if (pass.length < 10) return 2;
    return 3;
  };

  const strength = getPasswordStrength();

  return (
    <div className="step-content animate-fade-in">
      <h2 className="step-title">Create your account</h2>
      <p className="step-description">First things first, let's set up your login credentials.</p>

      <form onSubmit={handleNext} className="join-form">
        <div className="form-row">
          <div className="form-group">
            <div className="input-with-icon join-input">
              <User className="input-icon" size={20} />
              <input 
                type="text" 
                id="fullName" 
                name="fullName"
                placeholder=" "
                value={formData.fullName || ''}
                onChange={handleChange}
                required 
              />
              <label htmlFor="fullName">Full Name</label>
            </div>
          </div>
          <div className="form-group">
            <div className="input-with-icon join-input">
              <User className="input-icon" size={20} />
              <input 
                type="text" 
                id="username" 
                name="username"
                placeholder=" "
                value={formData.username || ''}
                onChange={handleChange}
                required 
              />
              <label htmlFor="username">Username</label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="input-with-icon join-input">
            <Mail className="input-icon" size={20} />
            <input 
              type="email" 
              id="email" 
              name="email"
              placeholder=" "
              value={formData.email || ''}
              onChange={handleChange}
              required 
            />
            <label htmlFor="email">Email Address</label>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <div className="input-with-icon join-input">
              <Globe2 className="input-icon" size={20} />
              <input 
                type="text" 
                id="country" 
                name="country"
                placeholder=" "
                value={formData.country || ''}
                onChange={handleChange}
                required 
              />
              <label htmlFor="country">Country</label>
            </div>
          </div>
          <div className="form-group">
            <div className="input-with-icon join-input">
              <Globe2 className="input-icon" size={20} />
              <input 
                type="text" 
                id="location" 
                name="location"
                placeholder=" "
                value={formData.location || ''}
                onChange={handleChange}
                required 
              />
              <label htmlFor="location">City / Location</label>
            </div>
          </div>
        </div>

        <div className="form-group">
          <div className="input-with-icon join-input">
            <Lock className="input-icon" size={20} />
            <input 
              type={showPassword ? "text" : "password"} 
              id="password" 
              name="password"
              placeholder=" "
              value={formData.password || ''}
              onChange={handleChange}
              required 
            />
            <label htmlFor="password">Password</label>
            <button 
              type="button" 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <div className="password-strength-container">
            <div className={`strength-bar ${strength >= 1 ? 'weak' : ''}`}></div>
            <div className={`strength-bar ${strength >= 2 ? 'medium' : ''}`}></div>
            <div className={`strength-bar ${strength >= 3 ? 'strong' : ''}`}></div>
          </div>
          <p className="strength-text">
            {strength === 0 && "Enter a password"}
            {strength === 1 && "Weak - add more characters"}
            {strength === 2 && "Good - add symbols or numbers"}
            {strength === 3 && "Strong password!"}
          </p>
        </div>

        <div className="step-actions">
          <button type="submit" className="btn btn-primary next-button">
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
