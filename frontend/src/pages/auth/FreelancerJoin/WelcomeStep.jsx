import React from 'react';
import { Briefcase, TrendingUp, Globe, ShieldCheck } from 'lucide-react';

export default function WelcomeStep({ nextStep }) {
  return (
    <div className="step-content welcome-step animate-fade-in">
      <div className="welcome-illustration glass">
        <div className="illustration-icon">
          <Briefcase size={48} color="var(--primary)" />
        </div>
        <div className="floating-badge badge-1">
          <TrendingUp size={16} /> Pro
        </div>
        <div className="floating-badge badge-2">
          <Globe size={16} /> Global
        </div>
      </div>

      <h2 className="step-title">Ready to start your journey?</h2>
      <p className="step-description">
        Join our marketplace as a freelancer and connect with clients worldwide. Build your reputation, showcase your skills, and grow your independent business.
      </p>

      <div className="benefits-list">
        <div className="benefit-item">
          <div className="benefit-icon">
            <Globe size={24} />
          </div>
          <div className="benefit-text">
            <h4>Global Opportunities</h4>
            <p>Work with clients from all over the world.</p>
          </div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">
            <TrendingUp size={24} />
          </div>
          <div className="benefit-text">
            <h4>Grow Your Income</h4>
            <p>Set your own rates and keep more of what you earn.</p>
          </div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">
            <ShieldCheck size={24} />
          </div>
          <div className="benefit-text">
            <h4>Secure Payments</h4>
            <p>Get paid on time, every time with our protected escrow system.</p>
          </div>
        </div>
      </div>

      <button className="btn btn-primary next-button" onClick={nextStep}>
        Join as Freelancer
      </button>
    </div>
  );
}
