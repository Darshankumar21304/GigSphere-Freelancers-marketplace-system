import React from 'react';
import { Check, Star, MapPin, Globe, Clock, MessageSquare, Award } from 'lucide-react';
import './Profile.css';

export default function FreelancerProfile() {
  return (
    <div className="profile-page">
      <div className="container profile-layout">
        
        {/* Left Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-avatar-container">
              <img src="https://i.pravatar.cc/300?img=47" alt="Alex Morgan" className="profile-avatar" />
              <div className="verified-badge" title="Verified Identity">
                <Check size={16} strokeWidth={3} />
              </div>
            </div>
            
            <h1 className="profile-name">Alex Morgan</h1>
            <p className="profile-title">Senior Full-Stack Developer</p>
            
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value"><Star size={16} color="var(--warning)" fill="var(--warning)" /> 4.9</span>
                <span className="stat-label">124 Reviews</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">98%</span>
                <span className="stat-label">AI Match</span>
              </div>
            </div>
            
            <div className="profile-actions">
              <button className="btn btn-primary btn-hire">Hire Me</button>
              <button className="btn btn-outline" style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                <MessageSquare size={18} />
                Message
              </button>
            </div>
          </div>
          
          <div className="profile-info-section">
            <h3 className="info-title">About Info</h3>
            <div className="info-list">
              <div className="info-item">
                <MapPin size={18} />
                <span>San Francisco, CA</span>
              </div>
              <div className="info-item">
                <Globe size={18} />
                <span>English, Spanish (Fluent)</span>
              </div>
              <div className="info-item">
                <Clock size={18} />
                <span>Usually responds in 1 hour</span>
              </div>
              <div className="info-item">
                <Award size={18} />
                <span>Top Rated Plus</span>
              </div>
            </div>
          </div>

          <div className="profile-info-section">
            <h3 className="info-title">Rates</h3>
            <div style={{fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)'}}>$85.00 <span style={{fontSize: '1rem', fontWeight: '400', color: 'var(--text-secondary)'}}>/ hr</span></div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="profile-main">
          <div className="content-card">
            <h2 className="content-title">Biography</h2>
            <div className="content-text">
              <p style={{marginBottom: '16px'}}>
                I am a passionate Full-Stack Developer with over 8 years of experience building scalable web applications. My expertise lies in React ecosystem, Node.js, and cloud architecture. I have successfully delivered over 50 projects ranging from SaaS platforms to complex fintech dashboards.
              </p>
              <p>
                I focus on clean code, responsive design, and optimal user experiences. I communicate clearly and always ensure my clients are satisfied with the final product. Let's build something amazing together!
              </p>
            </div>
          </div>

          <div className="content-card">
            <h2 className="content-title">Skills</h2>
            <div className="skills-wrapper">
              {['React', 'Node.js', 'TypeScript', 'Next.js', 'TailwindCSS', 'GraphQL', 'PostgreSQL', 'AWS'].map(skill => (
                <span key={skill} className="skill-pill">{skill}</span>
              ))}
            </div>
          </div>

          <div className="content-card">
            <h2 className="content-title">Recent Reviews</h2>
            
            <div className="review-item">
              <div className="review-header">
                <img src="https://logo.clearbit.com/stripe.com" alt="Client" className="reviewer-avatar" />
                <div className="reviewer-info">
                  <span className="reviewer-name">Stripe Inc.</span>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <div style={{display: 'flex', color: 'var(--warning)'}}>
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                    </div>
                    <span className="review-date">Oct 12, 2023</span>
                  </div>
                </div>
              </div>
              <p className="review-text">
                "Alex is an exceptional developer. Delivered the dashboard component ahead of schedule and the code quality was superb. Highly recommended for any React heavy project."
              </p>
            </div>

            <div className="review-item">
              <div className="review-header">
                <img src="https://logo.clearbit.com/airbnb.com" alt="Client" className="reviewer-avatar" />
                <div className="reviewer-info">
                  <span className="reviewer-name">Airbnb</span>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <div style={{display: 'flex', color: 'var(--warning)'}}>
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                    </div>
                    <span className="review-date">Aug 05, 2023</span>
                  </div>
                </div>
              </div>
              <p className="review-text">
                "Great communication and problem solving skills. Helped us refactor a legacy monolithic application into microservices seamlessly."
              </p>
            </div>
          </div>
        </main>
        
      </div>
    </div>
  );
}
