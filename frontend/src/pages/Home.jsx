import React, { useState } from 'react';
import { 
  Search, Code, Palette, PenTool, Video, Music, TrendingUp, Star, 
  CheckCircle2, ShieldCheck, Briefcase, Zap, Globe, MessageSquare, 
  ChevronRight, ArrowRight, Sparkles, Lock, CreditCard, Award, 
  ShieldAlert, RefreshCw, Cpu, Layers, DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatINR } from '../utils/currency';
import AntigravityCanvas from '../components/AntigravityCanvas';
import AuthModal from '../components/AuthModal';
import './Home.css';

const categories = [
  { name: 'Web & Full Stack', icon: Code, color: '#1a73e8', bg: '#e8f0fe' },
  { name: 'Mobile Apps (iOS & Android)', icon: Code, color: '#a142f4', bg: '#f3e8fd' },
  { name: 'UI/UX & Product Design', icon: Palette, color: '#e52592', bg: '#fce8e6' },
  { name: 'AI & Data Engineering', icon: Cpu, color: '#00e5ff', bg: '#e0f7fa' },
  { name: 'Growth & Performance Marketing', icon: TrendingUp, color: '#34a853', bg: '#e6f4ea' },
  { name: 'Content & Technical Writing', icon: PenTool, color: '#f9ab00', bg: '#fef7e0' },
  { name: 'Video Editing & 3D Animation', icon: Video, color: '#a142f4', bg: '#f3e8fd' },
  { name: 'Blockchain & Smart Contracts', icon: Layers, color: '#1a73e8', bg: '#e8f0fe' }
];

const featuredFreelancers = [
  {
    id: 1,
    name: 'Priya Sharma',
    title: 'Lead UI/UX & Product Designer',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 4.9,
    reviews: 142,
    skills: ['Figma', 'Product Design', 'User Research'],
    location: 'Bangalore, India',
    price: 1800,
    riskScore: 5
  },
  {
    id: 2,
    name: 'Arjun Mehta',
    title: 'Senior Full Stack & Cloud Engineer',
    avatar: 'https://i.pravatar.cc/150?img=11',
    rating: 5.0,
    reviews: 98,
    skills: ['React', 'Node.js', 'MongoDB', 'AWS'],
    location: 'Pune, India',
    price: 2400,
    riskScore: 8
  },
  {
    id: 3,
    name: 'Rohan Kumar',
    title: 'AI Systems & LLM Integrator',
    avatar: 'https://i.pravatar.cc/150?img=14',
    rating: 4.9,
    reviews: 76,
    skills: ['Python', 'OpenAI', 'LangChain', 'FastAPI'],
    location: 'Mumbai, India',
    price: 2200,
    riskScore: 10
  },
  {
    id: 4,
    name: 'Neha Verma',
    title: 'Growth Specialist & Copywriter',
    avatar: 'https://i.pravatar.cc/150?img=9',
    rating: 4.9,
    reviews: 110,
    skills: ['Copywriting', 'SEO', 'Funnel Optimization'],
    location: 'Delhi, India',
    price: 1200,
    riskScore: 6
  }
];

const featuredProjects = [
  {
    id: 1,
    title: 'Fintech SaaS Dashboard & Mobile App',
    description: 'Looking for an experienced React & React Native developer to build a modern crypto/banking wallet app.',
    category: 'Web & Full Stack',
    skills: ['React Native', 'Tailwind', 'Node.js'],
    budget: 75000,
    type: 'Fixed Price',
    posted: '2 hours ago'
  },
  {
    id: 2,
    title: 'AI Customer Support Bot & Workflow Engine',
    description: 'Build a custom AI chatbot integrated with MongoDB and Puter/OpenAI APIs for automated ticket resolution.',
    category: 'AI & Data Engineering',
    skills: ['Python', 'LLMs', 'Node.js', 'FastAPI'],
    budget: 45000,
    type: 'Fixed Price',
    posted: '4 hours ago'
  },
  {
    id: 3,
    title: 'Minimalist Brand Identity & UI Kit',
    description: 'Require a senior product designer to craft clean Google-style branding, vector icons, and a Figma design system.',
    category: 'UI/UX & Product Design',
    skills: ['Figma', 'Branding', 'Design Systems'],
    budget: 30000,
    type: 'Fixed Price',
    posted: '1 day ago'
  }
];

export default function Home() {
  // Interactive Landing Page Demos State
  const [demoRiskVal, setDemoRiskVal] = useState(12);

  // Auth Popup Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('register');
  const [authRole, setAuthRole] = useState('client');

  const openAuthModal = (tab = 'register', role = 'client') => {
    setAuthTab(tab);
    setAuthRole(role);
    setShowAuthModal(true);
  };

  return (
    <div className="gigsphere-landing-page">
      
      {/* 1. GOOGLE ANTIGRAVITY HERO SECTION */}
      <section className="hero-section">
        <AntigravityCanvas />

        <div className="container hero-container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-content text-center" style={{ maxWidth: '860px', margin: '0 auto' }}>
            
            {/* Top GigSphere Brand Badge Emblem */}
            <div className="hero-brand-badge">
              <div className="hero-logo-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="6" fill="url(#hero_gigsphere_grad)" />
                  <ellipse cx="12" cy="12" rx="10" ry="4" stroke="url(#hero_gigsphere_grad_ring)" strokeWidth="2.2" strokeLinecap="round" transform="rotate(-30 12 12)" />
                  <defs>
                    <linearGradient id="hero_gigsphere_grad" x1="6" y1="6" x2="18" y2="18" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#1A73E8" />
                      <stop offset="0.5" stopColor="#A142F4" />
                      <stop offset="1" stopColor="#00E5FF" />
                    </linearGradient>
                    <linearGradient id="hero_gigsphere_grad_ring" x1="2" y1="8" x2="22" y2="16" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00E5FF" />
                      <stop offset="0.5" stopColor="#1A73E8" />
                      <stop offset="1" stopColor="#A142F4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="hero-brand-name">GigSphere</span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-title">
              The next-generation <br />
              <span className="gradient-text">freelance marketplace platform</span>
            </h1>
            
            <p className="hero-subtitle">
              GigSphere connects visionary clients with top Indian freelancers powered by automated AI risk auditing, instant Razorpay deposits, and 100% escrow vault protection.
            </p>
            
            {/* Dual Pill CTA Buttons */}
            <div className="hero-pill-ctas">
              <Link to="/auth/client-join" className="pill-btn pill-dark shadow-glow">
                <Briefcase size={18} /> Join as Client
              </Link>
              <Link to="/auth/freelancer-join" className="pill-btn pill-light">
                <Award size={18} /> Join as Freelancer
              </Link>
              <Link to="/explore" className="pill-btn pill-outline">
                Explore Marketplace <ArrowRight size={16} />
              </Link>
            </div>
            
            {/* Telemetry Metrics Bar */}
            <div className="hero-metrics-bar">
              <div className="metric-item">
                <div className="metric-val">₹1.2 Cr+</div>
                <div className="metric-lbl">Escrow Funds Protected</div>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <div className="metric-val">15,000+</div>
                <div className="metric-lbl">Verified Freelancers</div>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <div className="metric-val">99.8%</div>
                <div className="metric-lbl">Dispute Resolution Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURE MATRIX (COMPACT ANTIGRAVITY CAPSULES) */}
      <section className="feature-matrix-section">
        <div className="container">
          <div className="section-header text-center" style={{ marginBottom: '2rem' }}>
            <h2 className="section-title">Engineered for Transparency, Security & Speed</h2>
          </div>

          <div className="antigravity-capsules-row">
            
            {/* Capsule 1: AI Security */}
            <div className="antigravity-chip blue-glow">
              <div className="chip-icon blue"><Cpu size={20} /></div>
              <div className="chip-body">
                <span className="chip-title">Automated Risk Auditing</span>
                <span className="chip-subtitle">AI Security Engine</span>
              </div>
              <Sparkles size={16} className="chip-sparkle" color="#1a73e8" />
            </div>

            {/* Capsule 2: Secure Payment */}
            <div className="antigravity-chip green-glow">
              <div className="chip-icon green"><Lock size={20} /></div>
              <div className="chip-body">
                <span className="chip-title">Razorpay Payment & Escrow</span>
                <span className="chip-subtitle">Secure Payment Vault</span>
              </div>
              <CreditCard size={16} className="chip-sparkle" color="#10b981" />
            </div>

            {/* Capsule 3: Dispute Resolution */}
            <div className="antigravity-chip purple-glow">
              <div className="chip-icon purple"><MessageSquare size={20} /></div>
              <div className="chip-body">
                <span className="chip-title">Evidence Defense & Verdicts</span>
                <span className="chip-subtitle">Dispute Resolution</span>
              </div>
              <ShieldCheck size={16} className="chip-sparkle" color="#a142f4" />
            </div>

          </div>
        </div>
      </section>

      {/* 3. DUAL INVITING AUDIENCE PORTALS ("FOR CLIENTS" vs "FOR FREELANCERS") */}
      <section className="audience-portals-section">
        <div className="container">
          <div className="portals-grid">
            
            {/* For Clients Portal */}
            <div className="portal-card client-portal hover-lift">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '0.5rem' }}>
                <span className="portal-badge">FOR CLIENTS & BUSINESSES</span>
                <Sparkles size={16} color="#1a73e8" />
              </div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', lineHeight: '1.3' }}>Hire vetted top 1% Indian freelancers</h2>
              <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Post project requirements, receive AI-screened proposals in minutes, and collaborate securely with zero upfront risk.</p>
              
              <ul className="portal-features" style={{ marginBottom: '1.25rem', gap: '0.4rem' }}>
                <li style={{ fontSize: '0.8rem' }}><CheckCircle2 size={14} color="#1a73e8" /> 100% Escrow Protection on every milestone</li>
                <li style={{ fontSize: '0.8rem' }}><CheckCircle2 size={14} color="#1a73e8" /> Automated AI skill matching & quality scoring</li>
                <li style={{ fontSize: '0.8rem' }}><CheckCircle2 size={14} color="#1a73e8" /> Pay via Razorpay UPI, NetBanking, or Cards</li>
              </ul>

              <Link to="/auth/client-join" className="pill-btn pill-dark" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                Hire Talent Now <ArrowRight size={15} />
              </Link>
            </div>

            {/* For Freelancers Portal */}
            <div className="portal-card freelancer-portal hover-lift">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '0.5rem' }}>
                <span className="portal-badge alt">FOR FREELANCERS</span>
                <Sparkles size={16} color="#10b981" />
              </div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', lineHeight: '1.3' }}>Keep 90% of earnings with instant payouts</h2>
              <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Build your portfolio, pitch to verified clients, and withdraw earnings directly to your UPI ID or Bank account.</p>
              
              <ul className="portal-features" style={{ marginBottom: '1.25rem', gap: '0.4rem' }}>
                <li style={{ fontSize: '0.8rem' }}><CheckCircle2 size={14} color="#10b981" /> Instant Razorpay withdrawal payouts within 24h</li>
                <li style={{ fontSize: '0.8rem' }}><CheckCircle2 size={14} color="#10b981" /> Verified clients with funded escrow vaults</li>
                <li style={{ fontSize: '0.8rem' }}><CheckCircle2 size={14} color="#10b981" /> AI profile audit badge to win high-paying bids</li>
              </ul>

              <Link to="/auth/freelancer-join" className="pill-btn pill-green" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                Join as Freelancer <ArrowRight size={15} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 4. EXPLORE CATEGORIES */}
      <section id="categories" className="categories-section">
        <div className="container">
          <div className="section-header flex justify-between items-center">
            <div>
              <h2 className="section-title">Explore High-Demand Categories</h2>
              <p className="section-subtitle">Find specialized talent across cutting-edge technology & creative domains.</p>
            </div>
            <Link to="/explore" className="pill-btn pill-outline hidden-mobile">
              Browse All Categories <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="category-grid">
            {categories.map((cat, idx) => (
              <Link to={`/explore?category=${encodeURIComponent(cat.name)}`} key={idx} className="category-card hover-lift">
                <div className="category-icon-wrapper" style={{ backgroundColor: cat.bg, color: cat.color }}>
                  <cat.icon size={24} />
                </div>
                <div className="category-info">
                  <h3 className="category-name">{cat.name}</h3>
                  <span className="category-arrow"><ChevronRight size={18} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TOP FEATURED FREELANCERS */}
      <section className="featured-freelancers-section">
        <div className="container">
          <div className="section-header flex justify-between items-center">
            <div>
              <h2 className="section-title">Top Rated Vetted Talent</h2>
              <p className="section-subtitle">Handpicked professionals with verified work history and AI safety badges.</p>
            </div>
            <Link to="/freelancers" className="pill-btn pill-outline hidden-mobile">
              View All Freelancers <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="freelancers-grid">
            {featuredFreelancers.map((freelancer) => (
              <div key={freelancer.id} className="freelancer-card hover-lift">
                <div className="freelancer-header">
                  <img src={freelancer.avatar} alt={freelancer.name} className="freelancer-avatar" />
                  <div>
                    <h3 className="freelancer-name">{freelancer.name}</h3>
                    <p className="freelancer-title">{freelancer.title}</p>
                  </div>
                </div>
                
                <div className="freelancer-details">
                  <div className="detail-item">
                    <Star size={14} fill="#f59e0b" color="#f59e0b" />
                    <span>{freelancer.rating} ({freelancer.reviews})</span>
                  </div>
                  <div className="detail-item">
                    <ShieldCheck size={14} color="#10b981" />
                    <span style={{ color: '#10b981', fontWeight: 700 }}>AI Risk {freelancer.riskScore}%</span>
                  </div>
                </div>
                
                <div className="freelancer-skills">
                  {freelancer.skills.map((skill, i) => (
                    <span key={i} className="skill-badge">{skill}</span>
                  ))}
                </div>
                
                <div className="freelancer-footer">
                  <div className="freelancer-price">
                    <span className="price-label">Rate</span>
                    <span className="price-amount">{formatINR(freelancer.price)}/hr</span>
                  </div>
                  <Link to={`/freelancer/${freelancer.id}`} className="min-btn min-btn-primary">
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FEATURED OPEN OPPORTUNITIES */}
      <section className="featured-projects-section">
        <div className="container">
          <div className="section-header flex justify-between items-center">
            <div>
              <h2 className="section-title">Latest Project Opportunities</h2>
              <p className="section-subtitle">Verified client projects open for proposals right now.</p>
            </div>
            <Link to="/explore" className="pill-btn pill-outline hidden-mobile">
              Browse All Projects <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="projects-grid">
            {featuredProjects.map((project) => (
              <div key={project.id} className="project-card hover-lift">
                <div className="project-header">
                  <span className="project-category">{project.category}</span>
                  <span className="project-posted">{project.posted}</span>
                </div>
                <h3 className="project-title">{project.title}</h3>
                <p className="project-desc">{project.description}</p>
                
                <div className="project-skills">
                  {project.skills.map((skill, i) => (
                    <span key={i} className="skill-badge">{skill}</span>
                  ))}
                </div>
                
                <div className="project-footer">
                  <div className="project-budget">
                    <span className="budget-amount">{formatINR(project.budget)}</span>
                    <span className="budget-type">{project.type}</span>
                  </div>
                  <Link to={`/gig/${project.id}`} className="min-btn min-btn-primary">
                    Submit Bid
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FINAL GOOGLE ANTIGRAVITY PILL CTA */}
      <section className="final-cta-section">
        <div className="container text-center">
          <h2 className="cta-title">Ready to experience the future of freelancing?</h2>
          <p className="cta-subtitle">Join thousands of Indian businesses and top freelancers collaborating with AI security and instant Razorpay payouts.</p>
          <div className="cta-buttons">
            <Link to="/auth/client-join" className="pill-btn pill-white">
              <Briefcase size={18} /> Join as Client
            </Link>
            <Link to="/auth/freelancer-join" className="pill-btn pill-dark">
              <Award size={18} /> Join as Freelancer
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Log In Auth Modal Popup */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

    </div>
  );
}
