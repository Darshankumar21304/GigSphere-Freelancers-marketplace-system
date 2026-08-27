import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { loginUser } from '../../utils/authUtils';
import './Auth.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Login should happen by the already joined user (freelancers, clients) only
      if (data.user.role !== 'freelancer' && data.user.role !== 'client') {
        throw new Error('Only freelancers and clients can login.');
      }

      loginUser(data.user.role, data.token, data.user);
      
      // Redirect based on role
      if (data.user.role === 'freelancer') {
        navigate('/freelancer/dashboard');
      } else if (data.user.role === 'client') {
        navigate('/client/dashboard');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <div className="auth-header">
          <h2>Welcome back</h2>
          <p>Sign in to your account to continue</p>
        </div>

        {error && <div className="auth-error" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <div className="input-with-icon">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                id="email" 
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <label htmlFor="email">Email Address</label>
            </div>
          </div>

          <div className="form-group">
            <div className="input-with-icon">
              <Lock className="input-icon" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <div className="auth-actions">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/auth/forgot-password" className="forgot-password-link">Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/auth/register">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}
