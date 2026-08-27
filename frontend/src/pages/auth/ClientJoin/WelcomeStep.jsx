import React from 'react';
import { Monitor, ArrowRight } from 'lucide-react';

export default function WelcomeStep({ nextStep }) {
  return (
    <div className="step-container text-center">
      <div className="step-icon-large client">
        <Monitor size={64} />
      </div>
      
      <h2 className="step-title">Welcome to GigSphere!</h2>
      <p className="step-subtitle">Let's set up your client account so you can start hiring top talent.</p>
      
      <div className="benefits-list text-left mt-4" style={{ maxWidth: '400px', margin: '2rem auto' }}>
        <div className="benefit-item">
          <div className="benefit-icon">✨</div>
          <div>
            <h4>Post projects quickly</h4>
            <p>Get your project in front of thousands of freelancers.</p>
          </div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">🤝</div>
          <div>
            <h4>Hire the best</h4>
            <p>Review proposals and select the perfect match for your needs.</p>
          </div>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">🛡️</div>
          <div>
            <h4>Secure payments</h4>
            <p>Pay safely through our protected escrow system.</p>
          </div>
        </div>
      </div>

      <button onClick={nextStep} className="btn btn-primary btn-large mt-4">
        Get Started <ArrowRight size={20} />
      </button>
    </div>
  );
}
