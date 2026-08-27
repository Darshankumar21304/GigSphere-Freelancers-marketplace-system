import React, { useState } from 'react';
import { 
  Download, Search, Filter, Briefcase, ChevronDown, CheckCircle,
  MoreVertical, Eye, MessageSquare, User, Check, X, ShieldCheck,
  Star, MapPin, Clock, Calendar, FileText
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import './ReceivedProposals.css';

// Mock Data
const MOCK_PROJECTS = [
  { id: 'all', title: 'All Projects' },
  { id: 'prj-1', title: 'Modern E-commerce Website Design', status: 'Open', budget: 85000 },
  { id: 'prj-2', title: 'SEO Content Writing for Tech Blog', status: 'In Progress', budget: 15000 }
];

const MOCK_PROPOSALS = [
  {
    id: 'prop-1',
    projectId: 'prj-1',
    projectTitle: 'Modern E-commerce Website Design',
    freelancer: {
      name: 'Alex Rivera',
      title: 'Senior UI/UX Designer',
      avatar: 'https://i.pravatar.cc/150?img=11',
      verified: true,
      rating: 4.9,
      reviews: 124,
      location: 'New Delhi, India',
      completedProjects: 85
    },
    status: 'New',
    bidAmount: 75000,
    deliveryTime: '3 Weeks',
    submittedDate: 'Oct 25, 2023',
    coverLetter: 'Hi there, I specialize in e-commerce UI/UX and have successfully redesigned 3 Shopify stores in the last quarter, increasing their conversion rates by an average of 22%. I have reviewed your requirements and I am confident in delivering a modern, glassmorphism aesthetic that perfectly suits your brand vision.',
    skills: ['Figma', 'UI/UX', 'Prototyping', 'E-commerce']
  },
  {
    id: 'prop-2',
    projectId: 'prj-1',
    projectTitle: 'Modern E-commerce Website Design',
    freelancer: {
      name: 'Sarah Chen',
      title: 'Product Designer',
      avatar: 'https://i.pravatar.cc/150?img=5',
      verified: true,
      rating: 4.7,
      reviews: 42,
      location: 'Mumbai, India',
      completedProjects: 31
    },
    status: 'Shortlisted',
    bidAmount: 90000,
    deliveryTime: '4 Weeks',
    submittedDate: 'Oct 23, 2023',
    coverLetter: 'I would love to help you overhaul your Shopify store. My approach is user-centric, starting with wireframes and usability testing before moving to high-fidelity designs.',
    skills: ['UI Design', 'Figma', 'Web Design']
  },
  {
    id: 'prop-3',
    projectId: 'prj-2',
    projectTitle: 'SEO Content Writing for Tech Blog',
    freelancer: {
      name: 'Priya Sharma',
      title: 'Technical Writer & SEO Expert',
      avatar: 'https://i.pravatar.cc/150?img=44',
      verified: true,
      rating: 5.0,
      reviews: 89,
      location: 'Bangalore, India',
      completedProjects: 120
    },
    status: 'Hired',
    bidAmount: 14000,
    deliveryTime: 'Ongoing',
    submittedDate: 'Oct 20, 2023',
    coverLetter: 'I am a specialized technical writer focusing on React and Node.js ecosystems. I can deliver 4 high-quality, long-form articles per month tailored to your specific audience.',
    skills: ['SEO', 'Technical Writing', 'React', 'Content Strategy']
  }
];

import { useNavigate } from 'react-router-dom';

export default function ReceivedProposals() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState(MOCK_PROPOSALS);
  const [selectedProject, setSelectedProject] = useState('all');
  const [activeTab, setActiveTab] = useState('All Proposals');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest First');
  const [menuOpen, setMenuOpen] = useState(null);
  const [selectedProposals, setSelectedProposals] = useState([]);

  const tabs = ['All Proposals', 'New', 'Under Review', 'Shortlisted', 'Hired', 'Rejected', 'Withdrawn'];

  const handleUpdateStatus = (proposalId, newStatus) => {
    setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status: newStatus } : p));
    setMenuOpen(null);
    if (newStatus === 'Hired') {
      alert('Freelancer hired successfully! Navigating to Hired Freelancers...');
      navigate('/client/dashboard/hired');
    }
  };

  // Filtering Logic
  const filteredProposals = proposals.filter(p => {
    const matchesProject = selectedProject === 'all' || p.projectId === selectedProject;
    const matchesTab = activeTab === 'All Proposals' || p.status === activeTab;
    const matchesSearch = p.freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesProject && matchesTab && matchesSearch;
  }).sort((a, b) => {
    if (sortOption === 'Lowest Bid') return a.bidAmount - b.bidAmount;
    if (sortOption === 'Highest Bid') return b.bidAmount - a.bidAmount;
    if (sortOption === 'Best Rated') return b.freelancer.rating - a.freelancer.rating;
    return 0; // default Newest First
  });

  // Project Info for Selector
  const currentProjectInfo = MOCK_PROJECTS.find(p => p.id === selectedProject);
  
  // KPI Stats based on selected project
  const projectProposals = selectedProject === 'all' ? proposals : proposals.filter(p => p.projectId === selectedProject);
  const stats = {
    total: projectProposals.length,
    new: projectProposals.filter(p => p.status === 'New').length,
    shortlisted: projectProposals.filter(p => p.status === 'Shortlisted').length,
    hired: projectProposals.filter(p => p.status === 'Hired').length,
  };

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(/\s+/g, '-');
  };

  const toggleProposalSelection = (id) => {
    if (selectedProposals.includes(id)) {
      setSelectedProposals(selectedProposals.filter(pid => pid !== id));
    } else {
      if (selectedProposals.length < 3) {
        setSelectedProposals([...selectedProposals, id]);
      } else {
        alert('You can only compare up to 3 proposals at a time.');
      }
    }
  };

  const getEmptyStateContent = () => {
    if (searchQuery) return { title: 'No Search Results', desc: 'No proposals match your search terms. Try adjusting your keywords.' };
    if (activeTab !== 'All Proposals') return { title: `No ${activeTab} Proposals`, desc: `There are currently no proposals in the ${activeTab} stage.` };
    return { title: 'No Proposals Received Yet', desc: 'Once freelancers submit proposals for your projects, they will appear here.' };
  };

  return (
    <div className="gigsphere-client-received-proposals">
      
      {/* Header */}
      <div className="gcrp-header-wrapper">
        <div>
          <div className="gcrp-breadcrumb">Dashboard / Received Proposals</div>
          <h1 className="gcrp-title">Received Proposals</h1>
          <p className="gcrp-subtitle">Review proposals, compare freelancers, and hire the right talent for your projects.</p>
        </div>
        <button className="gcrp-export-btn">
          <Download size={16} /> Export
        </button>
      </div>

      {/* KPI Cards */}
      <div className="gcrp-kpi-grid">
        <div className="gcrp-kpi-card">
          <div className="gcrp-kpi-header">
            <h3 className="gcrp-kpi-label">Total Proposals</h3>
            <div className="gcrp-kpi-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary, #2563eb)' }}>
              <FileText size={20} />
            </div>
          </div>
          <p className="gcrp-kpi-value">{stats.total}</p>
        </div>
        <div className="gcrp-kpi-card">
          <div className="gcrp-kpi-header">
            <h3 className="gcrp-kpi-label">New Proposals</h3>
            <div className="gcrp-kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <p className="gcrp-kpi-value">{stats.new}</p>
        </div>
        <div className="gcrp-kpi-card">
          <div className="gcrp-kpi-header">
            <h3 className="gcrp-kpi-label">Shortlisted</h3>
            <div className="gcrp-kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <Star size={20} />
            </div>
          </div>
          <p className="gcrp-kpi-value">{stats.shortlisted}</p>
        </div>
        <div className="gcrp-kpi-card">
          <div className="gcrp-kpi-header">
            <h3 className="gcrp-kpi-label">Hired</h3>
            <div className="gcrp-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success, #10b981)' }}>
              <Briefcase size={20} />
            </div>
          </div>
          <p className="gcrp-kpi-value">{stats.hired}</p>
        </div>
      </div>

      {/* Project Selector */}
      <div className="gcrp-project-selector-container">
        <span className="gcrp-selector-label">Viewing Proposals For:</span>
        <select 
          className="gcrp-selector-select"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          {MOCK_PROJECTS.map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        
        {selectedProject !== 'all' && currentProjectInfo && (
          <div className="gcrp-project-meta">
            <div className="gcrp-meta-item">
              Status: <strong>{currentProjectInfo.status}</strong>
            </div>
            <div className="gcrp-meta-item">
              Budget: <strong>{formatINR(currentProjectInfo.budget)}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="gcrp-tabs-container">
        {tabs.map(tab => {
          const count = tab === 'All Proposals' ? stats.total : projectProposals.filter(p => p.status === tab).length;
          return (
            <button 
              key={tab}
              className={`gcrp-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab} <span className="gcrp-tab-badge">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="gcrp-toolbar">
        <div className="gcrp-search-box">
          <Search className="gcrp-search-icon" size={18} />
          <input 
            type="text" 
            className="gcrp-search-input" 
            placeholder="Search by freelancer name, skill, or proposal..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="gcrp-toolbar-actions">
          {selectedProposals.length > 0 && (
            <button className="gcrp-btn-primary">
              Compare Selected ({selectedProposals.length})
            </button>
          )}
          <button className="gcrp-btn-outline">
            <Filter size={16} /> Filters
          </button>
          <select 
            className="gcrp-sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option>Newest First</option>
            <option>Oldest First</option>
            <option>Lowest Bid</option>
            <option>Highest Bid</option>
            <option>Best Rated</option>
          </select>
        </div>
      </div>

      {/* Proposals List */}
      <div className="gcrp-proposals-list">
        {filteredProposals.length > 0 ? (
          filteredProposals.map(proposal => (
            <div key={proposal.id} className="gcrp-proposal-card">
              <div className="gcrp-card-top">
                
                {/* Freelancer Column */}
                <div className="gcrp-freelancer-col">
                  <div className="gcrp-freelancer-info">
                    <div className="gcrp-avatar-wrapper">
                      <img src={proposal.freelancer.avatar} alt="Avatar" className="gcrp-avatar" />
                      {proposal.freelancer.verified && (
                        <div className="gcrp-verified-badge" title="Verified Freelancer">
                          <ShieldCheck size={12} />
                        </div>
                      )}
                    </div>
                    <div className="gcrp-freelancer-details">
                      <h3>{proposal.freelancer.name}</h3>
                      <p className="gcrp-freelancer-title">{proposal.freelancer.title}</p>
                      <div className="gcrp-freelancer-meta">
                        <div className="gcrp-meta-icon rating">
                          <Star size={14} fill="currentColor" /> {proposal.freelancer.rating}
                        </div>
                        <div className="gcrp-meta-icon">
                          <MapPin size={14} /> {proposal.freelancer.location}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="gcrp-freelancer-stats">
                    <div className="gcrp-stat-box">
                      <span>Projects</span>
                      <span>{proposal.freelancer.completedProjects}</span>
                    </div>
                    <div className="gcrp-stat-box">
                      <span>Reviews</span>
                      <span>{proposal.freelancer.reviews}</span>
                    </div>
                  </div>
                  
                  <label style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: 'auto'}}>
                    <input 
                      type="checkbox" 
                      checked={selectedProposals.includes(proposal.id)}
                      onChange={() => toggleProposalSelection(proposal.id)}
                      style={{width: '16px', height: '16px', accentColor: 'var(--primary)'}}
                    />
                    Select to Compare
                  </label>
                </div>
                
                {/* Proposal Content */}
                <div className="gcrp-proposal-content">
                  <div className="gcrp-proposal-header">
                    <div className="gcrp-proposal-title-area">
                      <h4>{proposal.projectTitle}</h4>
                      <div className="gcrp-proposal-subtitle">
                        <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                          <Calendar size={14} /> Submitted: {proposal.submittedDate}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className={`gcrp-status-badge gcrp-status-${getStatusClass(proposal.status)}`}>
                        {proposal.status}
                      </span>
                    </div>
                  </div>
                  
                  <p className="gcrp-cover-letter">
                    "{proposal.coverLetter}"
                  </p>
                  
                  <div className="gcrp-skills-list">
                    {proposal.skills.map(skill => (
                      <span key={skill} className="gcrp-skill-chip">{skill}</span>
                    ))}
                  </div>
                </div>
                
              </div>
              
              {/* Card Bottom / Actions */}
              <div className="gcrp-card-bottom">
                <div className="gcrp-bid-details">
                  <div className="gcrp-bid-item amount">
                    <span>Bid Amount</span>
                    <span>{formatINR(proposal.bidAmount)}</span>
                  </div>
                  <div className="gcrp-bid-item">
                    <span>Delivery Time</span>
                    <span>{proposal.deliveryTime}</span>
                  </div>
                </div>
                
                <div className="gcrp-actions">
                  <button className="gcrp-btn-primary">View Proposal</button>
                  
                  <div className="gcrp-menu-wrapper">
                    <button 
                      className="gcrp-btn-icon"
                      onClick={() => setMenuOpen(menuOpen === proposal.id ? null : proposal.id)}
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {menuOpen === proposal.id && (
                      <div className="gcrp-dropdown-menu">
                         <button className="gcrp-dropdown-item" onClick={() => navigate('/freelancers')}>
                          <User size={16} /> View Profile
                        </button>
                        
                        {(proposal.status === 'New' || proposal.status === 'Under Review') && (
                          <button className="gcrp-dropdown-item" onClick={() => handleUpdateStatus(proposal.id, 'Shortlisted')}>
                            <Star size={16} /> Shortlist
                          </button>
                        )}
                        
                        {proposal.status === 'Shortlisted' && (
                          <button className="gcrp-dropdown-item" onClick={() => handleUpdateStatus(proposal.id, 'Under Review')}>
                            <Star size={16} fill="currentColor" style={{color: '#8b5cf6'}} /> Remove from Shortlist
                          </button>
                        )}
                        
                        {(proposal.status === 'New' || proposal.status === 'Shortlisted' || proposal.status === 'Under Review') && (
                          <button className="gcrp-dropdown-item" onClick={() => navigate('/client/dashboard/chat')}>
                            <MessageSquare size={16} /> Message Freelancer
                          </button>
                        )}
                        
                        {(proposal.status === 'New' || proposal.status === 'Shortlisted') && (
                          <button className="gcrp-dropdown-item" style={{color: 'var(--success)'}} onClick={() => handleUpdateStatus(proposal.id, 'Hired')}>
                            <Check size={16} /> Hire Freelancer
                          </button>
                        )}

                        {proposal.status === 'Hired' && (
                          <button className="gcrp-dropdown-item" onClick={() => navigate('/client/dashboard/chat')}>
                            <MessageSquare size={16} /> Messages
                          </button>
                        )}
                        
                        {(proposal.status === 'New' || proposal.status === 'Shortlisted') && (
                          <button className="gcrp-dropdown-item danger" onClick={() => handleUpdateStatus(proposal.id, 'Rejected')}>
                            <X size={16} /> Reject Proposal
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="gcrp-empty-state">
            <div className="gcrp-empty-icon">
              <FileText size={32} />
            </div>
            <h3 className="gcrp-empty-title">{getEmptyStateContent().title}</h3>
            <p className="gcrp-empty-desc">{getEmptyStateContent().desc}</p>
            {searchQuery && (
              <button className="gcrp-btn-primary outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
