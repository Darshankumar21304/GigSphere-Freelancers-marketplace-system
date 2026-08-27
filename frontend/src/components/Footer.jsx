import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  if (!isLandingPage) {
    return (
      <footer className="footer-simple">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} GigSphere. All rights reserved.</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>GigSphere</h3>
            <p>An Indian freelance marketplace connecting clients with skilled professionals.</p>
          </div>
          
          <div className="footer-links">
            <h4>For Clients</h4>
            <ul>
              <li><Link to="/explore">Explore Projects</Link></li>
              <li><Link to="/auth/client-join">Post a Project</Link></li>
              <li><a href="#how-it-works">How It Works</a></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h4>For Freelancers</h4>
            <ul>
              <li><Link to="/explore">Browse Projects</Link></li>
              <li><Link to="/auth/freelancer-join">Create Profile</Link></li>
              <li><Link to="/freelancers">Find Opportunities</Link></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About GigSphere</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Privacy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} GigSphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
