import React from 'react';
import { 
  Search, Code, Palette, PenTool, Video, Music, TrendingUp, Star, 
  CheckCircle, Shield, Briefcase, Zap, Globe, MessageSquare, 
  ChevronRight, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatINR } from '../utils/currency';
import './Home.css';

const categories = [
  { name: 'Web Development', icon: Code, color: 'var(--primary)', bg: 'rgba(37, 99, 235, 0.1)' },
  { name: 'Mobile App Development', icon: Code, color: 'rgb(245, 158, 11)', bg: 'rgba(245, 158, 11, 0.1)' },
  { name: 'UI/UX Design', icon: Palette, color: 'rgb(219, 39, 119)', bg: 'rgba(219, 39, 119, 0.1)' },
  { name: 'Graphic Design', icon: Palette, color: 'rgb(147, 51, 234)', bg: 'rgba(147, 51, 234, 0.1)' },
  { name: 'Digital Marketing', icon: TrendingUp, color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
  { name: 'Content Writing', icon: PenTool, color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' },
  { name: 'Video & Animation', icon: Video, color: 'rgb(147, 51, 234)', bg: 'rgba(147, 51, 234, 0.1)' },
  { name: 'Data Science', icon: TrendingUp, color: 'var(--primary)', bg: 'rgba(37, 99, 235, 0.1)' },
];

const featuredFreelancers = [
  {
    id: 1,
    name: 'Priya Sharma',
    title: 'Senior UI/UX Designer',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 4.9,
    skills: ['Figma', 'UI Design', 'Wireframing'],
    location: 'Bangalore, India',
    price: 1500,
  },
  {
    id: 2,
    name: 'Arjun Mehta',
    title: 'Full Stack Developer',
    avatar: 'https://i.pravatar.cc/150?img=11',
    rating: 5.0,
    skills: ['React', 'Node.js', 'MongoDB'],
    location: 'Pune, India',
    price: 2000,
  },
  {
    id: 3,
    name: 'Rohan Kumar',
    title: 'Digital Marketing Expert',
    avatar: 'https://i.pravatar.cc/150?img=14',
    rating: 4.8,
    skills: ['SEO', 'Google Ads', 'Content'],
    location: 'Mumbai, India',
    price: 1000,
  },
  {
    id: 4,
    name: 'Neha Verma',
    title: 'Content Writer & Strategist',
    avatar: 'https://i.pravatar.cc/150?img=9',
    rating: 4.9,
    skills: ['Copywriting', 'Blogging', 'SEO'],
    location: 'Delhi, India',
    price: 800,
  }
];

const featuredProjects = [
  {
    id: 1,
    title: 'E-commerce Website Development',
    description: 'Looking for an experienced React developer to build a modern e-commerce storefront.',
    category: 'Web Development',
    skills: ['React', 'Tailwind', 'Redux'],
    budget: 50000,
    type: 'Fixed Price',
    posted: '2 days ago'
  },
  {
    id: 2,
    title: 'Logo & Brand Identity Design',
    description: 'Need a minimalist logo and brand guidelines for a new tech startup.',
    category: 'Graphic Design',
    skills: ['Illustrator', 'Branding', 'Logo Design'],
    budget: 15000,
    type: 'Fixed Price',
    posted: '5 hours ago'
  },
  {
    id: 3,
    title: 'SEO Optimization for Blog',
    description: 'Require an SEO expert to optimize our WordPress blog and improve rankings.',
    category: 'Digital Marketing',
    skills: ['SEO', 'WordPress', 'Analytics'],
    budget: 10000,
    type: 'Monthly',
    posted: '1 day ago'
  }
];

export default function Home() {
  return (
    <div className="gigsphere-landing-page">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Find the Right Talent. <br /><span className="highlight-text">Get Work Done.</span>
            </h1>
            <p className="hero-subtitle">
              GigSphere connects clients with skilled freelancers to build, design, market, and grow their ideas. 
              The leading Indian freelance marketplace.
            </p>
            
            <div className="hero-ctas">
              <Link to="/explore" className="btn btn-primary btn-lg">Explore Projects</Link>
              <Link to="/freelancers" className="btn btn-outline btn-lg">Find Freelancers</Link>
            </div>
            
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">10k+</span>
                <span className="stat-label">Freelancers</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">5k+</span>
                <span className="stat-label">Projects Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">4.9/5</span>
                <span className="stat-label">Average Rating</span>
              </div>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-card-stack">
              <div className="hero-floating-card card-1 glass">
                <div className="card-header">
                  <img src="https://i.pravatar.cc/150?img=5" alt="Freelancer" className="floating-avatar" />
                  <div>
                    <h4>Priya S.</h4>
                    <p>UI/UX Designer</p>
                  </div>
                </div>
                <div className="card-rating">
                  <Star size={14} fill="var(--warning)" color="var(--warning)" /> 5.0 (120 reviews)
                </div>
              </div>
              
              <div className="hero-floating-card card-2 glass">
                <div className="card-header">
                  <div className="icon-box"><Code size={20} /></div>
                  <div>
                    <h4>Web Development</h4>
                    <p>Starting at {formatINR(15000)}</p>
                  </div>
                </div>
              </div>
              
              <div className="hero-main-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
                  alt="Team collaborating" 
                  className="hero-main-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION */}
      <section className="value-prop-section bg-light">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Everything You Need to Work Better</h2>
            <p className="section-subtitle">Discover a seamless way to collaborate and achieve your goals.</p>
          </div>
          
          <div className="value-cards-grid">
            <div className="value-card">
              <div className="value-icon"><Search size={28} /></div>
              <h3>Find Skilled Freelancers</h3>
              <p>Discover talented professionals across multiple categories, ready to bring your vision to life.</p>
            </div>
            
            <div className="value-card">
              <div className="value-icon"><Briefcase size={28} /></div>
              <h3>Post Your Project</h3>
              <p>Tell freelancers what you need and receive proposals from skilled professionals instantly.</p>
            </div>
            
            <div className="value-card">
              <div className="value-icon"><Shield size={28} /></div>
              <h3>Work Securely</h3>
              <p>Manage projects, milestones, communication, and payments safely in one place.</p>
            </div>
            
            <div className="value-card">
              <div className="value-icon"><TrendingUp size={28} /></div>
              <h3>Build Your Career</h3>
              <p>Freelancers can showcase their skills, find projects, and grow their professional reputation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EXPLORE CATEGORIES */}
      <section id="categories" className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Explore Popular Services</h2>
            <Link to="/explore" className="view-all-link">Browse all categories <ArrowRight size={16} /></Link>
          </div>
          
          <div className="category-grid">
            {categories.map((cat, idx) => (
              <Link to={`/explore?category=${encodeURIComponent(cat.name)}`} key={idx} className="category-card">
                <div className="category-icon-wrapper" style={{ backgroundColor: cat.bg, color: cat.color }}>
                  <cat.icon size={32} />
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

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="how-it-works-section bg-light">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">How GigSphere Works</h2>
            <p className="section-subtitle">A simple, transparent process for both clients and freelancers.</p>
          </div>
          
          <div className="how-it-works-split">
            <div className="how-it-works-col">
              <h3>For Clients</h3>
              <div className="step-list">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Create a Project</h4>
                    <p>Outline your requirements, budget, and timeline.</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Receive Proposals</h4>
                    <p>Review bids and portfolios from interested freelancers.</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Hire the Right Freelancer</h4>
                    <p>Select the best fit and start communicating directly.</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Complete the Project</h4>
                    <p>Approve the work and release secure payments.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="how-it-works-col">
              <h3>For Freelancers</h3>
              <div className="step-list">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Create Your Profile</h4>
                    <p>Highlight your skills, experience, and portfolio.</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Discover Projects</h4>
                    <p>Browse open opportunities that match your expertise.</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Submit Proposals</h4>
                    <p>Send tailored pitches and negotiate rates.</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Get Hired</h4>
                    <p>Deliver great work and build your reputation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED FREELANCERS */}
      <section className="featured-freelancers-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Meet Top Freelancers</h2>
            <Link to="/freelancers" className="view-all-link">View all freelancers <ArrowRight size={16} /></Link>
          </div>
          
          <div className="freelancers-grid">
            {featuredFreelancers.map((freelancer) => (
              <div key={freelancer.id} className="freelancer-card">
                <div className="freelancer-header">
                  <img src={freelancer.avatar} alt={freelancer.name} className="freelancer-avatar" />
                  <div>
                    <h3 className="freelancer-name">{freelancer.name}</h3>
                    <p className="freelancer-title">{freelancer.title}</p>
                  </div>
                </div>
                
                <div className="freelancer-details">
                  <div className="detail-item">
                    <Star size={14} className="icon-warning" />
                    <span>{freelancer.rating} Rating</span>
                  </div>
                  <div className="detail-item">
                    <Globe size={14} className="icon-muted" />
                    <span>{freelancer.location}</span>
                  </div>
                </div>
                
                <div className="freelancer-skills">
                  {freelancer.skills.map((skill, i) => (
                    <span key={i} className="skill-badge">{skill}</span>
                  ))}
                </div>
                
                <div className="freelancer-footer">
                  <div className="freelancer-price">
                    <span className="price-label">Starting at</span>
                    <span className="price-amount">{formatINR(freelancer.price)}/hr</span>
                  </div>
                  <Link to={`/freelancer/${freelancer.id}`} className="btn btn-outline btn-sm">View Profile</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FEATURED PROJECTS */}
      <section className="featured-projects-section bg-light">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Latest Opportunities</h2>
            <Link to="/explore" className="view-all-link">Browse all projects <ArrowRight size={16} /></Link>
          </div>
          
          <div className="projects-grid">
            {featuredProjects.map((project) => (
              <div key={project.id} className="project-card">
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
                  <Link to={`/gig/${project.id}`} className="btn btn-primary btn-sm">View Project</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TRUST SECTION */}
      <section className="trust-section">
        <div className="container text-center">
          <h2 className="section-title">Built for Better Freelancing</h2>
          <p className="section-subtitle">We provide the tools and security you need to focus on what matters: great work.</p>
          
          <div className="trust-features">
            <div className="trust-feature">
              <CheckCircle size={32} className="trust-icon" />
              <h4>Verified Profiles</h4>
              <p>Work with confident, verified professionals and clients.</p>
            </div>
            <div className="trust-feature">
              <Shield size={32} className="trust-icon" />
              <h4>Secure Payments</h4>
              <p>Your funds are protected. Pay only for approved work.</p>
            </div>
            <div className="trust-feature">
              <MessageSquare size={32} className="trust-icon" />
              <h4>Professional Communication</h4>
              <p>Built-in chat and file sharing for seamless collaboration.</p>
            </div>
            <div className="trust-feature">
              <Star size={32} className="trust-icon" />
              <h4>Ratings & Reviews</h4>
              <p>Transparent feedback helps build a trusted community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CLIENT + FREELANCER SPLIT */}
      <section className="split-cta-section">
        <div className="container">
          <div className="split-cards">
            <div className="split-card client-card">
              <h3>For Clients</h3>
              <p>Turn your ideas into reality with skilled freelancers ready to execute your vision.</p>
              <Link to="/auth/client-join" className="btn btn-primary">Find a Freelancer</Link>
            </div>
            
            <div className="split-card freelancer-card">
              <h3>For Freelancers</h3>
              <p>Showcase your skills, find projects that match your expertise, and grow your business.</p>
              <Link to="/auth/freelancer-join" className="btn btn-outline">Join as Freelancer</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="final-cta-section">
        <div className="container text-center">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-subtitle">Whether you're looking for skilled talent or your next opportunity, GigSphere brings you together.</p>
          <div className="cta-buttons">
            <Link to="/auth/client-join" className="btn btn-primary btn-lg">Join as Client</Link>
            <Link to="/auth/freelancer-join" className="btn btn-outline btn-lg cta-outline">Join as Freelancer</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
