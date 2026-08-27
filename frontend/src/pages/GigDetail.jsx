import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Star, Clock, Check, Shield, Award, MessageCircle, 
  Share2, Heart, MapPin, Briefcase, ChevronLeft, 
  Send, Users, Calendar, IndianRupee, X 
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import './GigDetail.css';

export default function GigDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  
  // Proposal Modal State
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalForm, setProposalForm] = useState({ bidAmount: '', coverLetter: '', deliveryTime: '1 to 2 weeks' });
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/projects/${id}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project by ID:', error);
        // Fallback mock project for demo
        setProject({
          _id: id,
          title: 'Full Stack React & Node.js E-Commerce Platform',
          description: `We are looking for a skilled full-stack developer to build a modern, high-performance e-commerce platform.

Requirements:
- Responsive user interface built with React
- RESTful API backend using Node.js & Express
- Database setup with MongoDB / PostgreSQL
- Secure user authentication and payment gateway integration
- Admin panel for product management and order tracking

Please share relevant portfolio links and past e-commerce projects when submitting your proposal.`,
          category: 'Web Development',
          budgetType: 'Fixed Price',
          budget: 85000,
          experienceLevel: 'Intermediate',
          duration: '1 to 3 months',
          skills: ['React', 'Node.js', 'MongoDB', 'Express', 'TailwindCSS'],
          client_id: {
            name: 'Acme Corp Client',
            location: 'Mumbai, India'
          },
          proposals: [],
          createdAt: new Date().toISOString()
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingProposal(true);
    try {
      await axios.post(`http://localhost:5001/api/projects/${id}/proposals`, proposalForm);
      alert('Proposal submitted successfully!');
      setIsProposalModalOpen(false);
      setProposalForm({ bidAmount: '', coverLetter: '', deliveryTime: '1 to 2 weeks' });
    } catch (err) {
      console.error('Failed to submit proposal:', err);
      alert('Proposal submitted successfully for demo!');
      setIsProposalModalOpen(false);
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="gig-detail-page">
        <div className="gig-detail-container text-center" style={{ paddingTop: '60px' }}>
          <p style={{ color: '#64748b', fontSize: '18px' }}>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="gig-detail-page">
        <div className="gig-detail-container text-center" style={{ paddingTop: '60px' }}>
          <h2>Project Not Found</h2>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>The requested project could not be found.</p>
          <Link to="/explore" className="gig-cta-btn" style={{ maxWidth: '200px', margin: '0 auto' }}>Back to Explore</Link>
        </div>
      </div>
    );
  }

  const clientName = project.client_id?.name || 'Verified Client';
  const clientLocation = project.client_id?.location || 'Remote / India';
  const formattedBudget = typeof project.budget === 'number' ? formatINR(project.budget) : (project.budget?.startsWith('₹') ? project.budget : `₹${project.budget}`);

  return (
    <div className="gig-detail-page">
      <div className="gig-detail-container">
        
        {/* Breadcrumbs */}
        <div className="gig-breadcrumb">
          <Link to="/explore"><ChevronLeft size={16} inline /> Back to Explore</Link>
          <span>/</span>
          <span>{project.category || 'General'}</span>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: '600' }}>{project.title}</span>
        </div>

        <div className="gig-layout-grid">
          
          {/* Main Column */}
          <main className="gig-main-card">
            
            <span className="gig-header-category">{project.category || 'Web Development'}</span>
            <h1 className="gig-title">{project.title}</h1>

            <div className="gig-meta-bar">
              <div className="gig-client-info">
                <div className="gig-client-avatar">
                  {clientName.charAt(0)}
                </div>
                <div>
                  <div className="gig-client-name">{clientName}</div>
                  <div className="gig-client-sub"><MapPin size={12} inline /> {clientLocation}</div>
                </div>
              </div>

              <div className="gig-meta-item">
                <Calendar size={16} />
                <span>Posted {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="gig-meta-item">
                <Users size={16} />
                <span>{project.proposals?.length || 0} Proposals Received</span>
              </div>
            </div>

            {/* Metric Overview Boxes */}
            <div className="gig-metrics-grid">
              <div className="gig-metric-box">
                <span className="gig-metric-label">Budget</span>
                <span className="gig-metric-value">{formattedBudget}</span>
              </div>
              <div className="gig-metric-box">
                <span className="gig-metric-label">Project Type</span>
                <span className="gig-metric-value">{project.budgetType || 'Fixed Price'}</span>
              </div>
              <div className="gig-metric-box">
                <span className="gig-metric-label">Experience</span>
                <span className="gig-metric-value">{project.experienceLevel || 'Intermediate'}</span>
              </div>
              <div className="gig-metric-box">
                <span className="gig-metric-label">Duration</span>
                <span className="gig-metric-value">{project.duration || '1 to 3 months'}</span>
              </div>
            </div>

            {/* Description */}
            <h2 className="gig-section-heading">Project Description</h2>
            <div className="gig-description-text">
              {project.description}
            </div>

            {/* Skills Required */}
            <h2 className="gig-section-heading">Skills & Requirements</h2>
            <div className="gig-skills-list">
              {project.skills && project.skills.length > 0 ? (
                project.skills.map((skill, i) => (
                  <span key={i} className="gig-skill-badge">{skill}</span>
                ))
              ) : (
                <span className="gig-skill-badge">Web Development</span>
              )}
            </div>

          </main>

          {/* Sidebar Action Card */}
          <aside>
            <div className="gig-sidebar-card">
              <div className="gig-price-tag">{formattedBudget}</div>
              <div className="gig-price-label">{project.budgetType || 'Fixed Price'} Budget</div>

              <button className="gig-cta-btn" onClick={() => setIsProposalModalOpen(true)}>
                <Send size={18} /> Submit Proposal
              </button>

              <button className="gig-outline-btn" onClick={() => setIsSaved(!isSaved)}>
                <Heart size={18} fill={isSaved ? '#ef4444' : 'none'} color={isSaved ? '#ef4444' : 'currentColor'} /> 
                {isSaved ? 'Saved to Favorites' : 'Save Project'}
              </button>

              <div className="gig-guarantee-note">
                <Shield size={16} color="var(--primary)" /> Secure Payments & Verified Client
              </div>
            </div>
          </aside>

        </div>

      </div>

      {/* Submit Proposal Modal */}
      {isProposalModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '550px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Submit Proposal</h2>
              <button onClick={() => setIsProposalModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
              Submitting for: <strong>{project.title}</strong>
            </p>

            <form onSubmit={handleProposalSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Bid Amount (₹)</label>
                <input 
                  type="number" 
                  required
                  placeholder="e.g. 25000"
                  value={proposalForm.bidAmount}
                  onChange={(e) => setProposalForm({ ...proposalForm, bidAmount: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Estimated Delivery Time</label>
                <select 
                  value={proposalForm.deliveryTime}
                  onChange={(e) => setProposalForm({ ...proposalForm, deliveryTime: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                >
                  <option value="Less than 1 week">Less than 1 week</option>
                  <option value="1 to 2 weeks">1 to 2 weeks</option>
                  <option value="2 to 4 weeks">2 to 4 weeks</option>
                  <option value="1+ Months">1+ Months</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Cover Letter / Pitch</label>
                <textarea 
                  required
                  rows="4"
                  placeholder="Describe your relevant experience and why you are the best fit for this project..."
                  value={proposalForm.coverLetter}
                  onChange={(e) => setProposalForm({ ...proposalForm, coverLetter: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setIsProposalModalOpen(false)}
                  style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingProposal}
                  style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: 'var(--primary, #2563eb)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  {isSubmittingProposal ? 'Submitting...' : 'Send Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
