import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Briefcase, Monitor, ArrowLeft } from 'lucide-react';
import { loginUser } from '../../utils/authUtils';
import './Auth.css';

export default function Register() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRoleContinue = () => {
    if (!selectedRole) return;
    
    if (selectedRole === 'freelancer') {
      navigate('/auth/freelancer-join');
    } else if (selectedRole === 'client') {
      navigate('/auth/client-join');
    }
  };

  const handleClientRegister = (e) => {
    e.preventDefault();
    // Simulate successful registration and login for client
    loginUser('client');
    navigate('/client/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="role-selection-wrapper">
        <div className="role-selection-header">
            <h1>Join as a client or freelancer</h1>
            <p>Select your role to get started with GigSphere</p>
          </div>

          <div className="role-cards-container">
            {/* Client Card */}
            <div 
              className={`role-card-large ${selectedRole === 'client' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('client')}
            >
              <div className="role-icon-wrapper client">
                <Monitor size={40} />
              </div>
              <h2>Join as a Client</h2>
              <p>Post projects, hire skilled freelancers, and manage work.</p>
              <div className="role-radio">
                <div className="radio-inner" />
              </div>
            </div>

            {/* Freelancer Card */}
            <div 
              className={`role-card-large ${selectedRole === 'freelancer' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('freelancer')}
            >
              <div className="role-icon-wrapper freelancer">
                <Briefcase size={40} />
              </div>
              <h2>Join as a Freelancer</h2>
              <p>Offer your skills, find projects, and earn money.</p>
              <div className="role-radio">
                <div className="radio-inner" />
              </div>
            </div>
          </div>

          <div className="role-selection-footer">
            <button 
              className="btn btn-primary role-continue-btn"
              onClick={handleRoleContinue}
              disabled={!selectedRole}
            >
              {selectedRole === 'client' ? 'Continue as Client' : selectedRole === 'freelancer' ? 'Continue as Freelancer' : 'Create Account'}
            </button>
            <p>
              Already have an account? <Link to="/auth/login">Log In</Link>
            </p>
          </div>
        </div>
      </div>
    );
}
