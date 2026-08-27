import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, CheckCircle, Clock, XCircle, Search, Filter, 
  MoreVertical, Eye, MessageSquare, Edit2, Trash2, ShieldCheck, FileSearch, Check, X
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import './MyProposals.css';

const MOCK_PROPOSALS = [
  {
    id: 'PROP-101',
    projectTitle: 'E-commerce App React Native',
    clientName: 'TechNova Solutions',
    clientVerified: true,
    submittedDate: 'Oct 24, 2023',
    status: 'Pending',
    bidAmount: 45000,
    deliveryTime: '3 Weeks',
    coverLetter: 'Hi, I have extensive experience building React Native applications for e-commerce. I recently completed a very similar project for a retail client, resulting in a 30% increase in mobile conversions. I am confident I can deliver high-quality work within the required timeline.',
    skills: ['React Native', 'Redux', 'Stripe Integration'],
    projectBudget: '₹40,000 - ₹50,000',
    lastActivity: '2 hours ago'
  },
  {
    id: 'PROP-102',
    projectTitle: 'Custom WordPress Theme Development',
    clientName: 'Studio Creative',
    clientVerified: true,
    submittedDate: 'Oct 20, 2023',
    status: 'Shortlisted',
    bidAmount: 28000,
    deliveryTime: '2 Weeks',
    coverLetter: 'I am a WordPress expert with 5 years of experience creating custom themes from scratch. I reviewed your Figma files and I can build a pixel-perfect, responsive theme optimized for Core Web Vitals.',
    skills: ['WordPress', 'PHP', 'CSS3', 'Figma'],
    projectBudget: '₹25,000 - ₹35,000',
    lastActivity: '1 day ago'
  },
  {
    id: 'PROP-103',
    projectTitle: 'Node.js Backend Microservices',
    clientName: 'GlobalFin Inc',
    clientVerified: false,
    submittedDate: 'Oct 15, 2023',
    status: 'Accepted',
    bidAmount: 85000,
    deliveryTime: '1 Month',
    coverLetter: 'I specialize in Node.js backend architectures. I will design your microservices using Express, Redis for caching, and MongoDB. My architecture ensures high availability and scalability.',
    skills: ['Node.js', 'MongoDB', 'Microservices', 'AWS'],
    projectBudget: '₹80,000 - ₹1,00,000',
    lastActivity: 'Oct 18, 2023'
  },
  {
    id: 'PROP-104',
    projectTitle: 'Logo and Brand Identity Design',
    clientName: 'StartUp Hub',
    clientVerified: true,
    submittedDate: 'Oct 10, 2023',
    status: 'Declined',
    bidAmount: 15000,
    deliveryTime: '1 Week',
    coverLetter: 'As a visual designer, I can create a unique and memorable brand identity for StartUp Hub. I will provide 3 distinct logo concepts and full brand guidelines.',
    skills: ['Illustrator', 'Branding', 'Graphic Design'],
    projectBudget: '₹10,000 - ₹20,000',
    lastActivity: 'Oct 12, 2023'
  },
  {
    id: 'PROP-105',
    projectTitle: 'SEO Content Writing',
    clientName: 'Marketing Pro',
    clientVerified: true,
    submittedDate: 'Oct 05, 2023',
    status: 'Withdrawn',
    bidAmount: 5000,
    deliveryTime: '3 Days',
    coverLetter: 'I can write high-converting SEO articles for your tech blog.',
    skills: ['SEO', 'Content Writing', 'Tech Writing'],
    projectBudget: '₹5,000',
    lastActivity: 'Oct 06, 2023'
  }
];

const MOCK_OFFERS = [
  {
    id: 'OFF-201',
    projectTitle: 'Senior Frontend Developer for SaaS',
    clientName: 'CloudScale Inc',
    clientVerified: true,
    receivedDate: 'Oct 25, 2023',
    status: 'Pending',
    offerAmount: 120000,
    deliveryTime: '2 Months',
    projectDescription: 'We are looking for a senior frontend developer to help us migrate our legacy dashboard to React. You will be working with a team of 3 backend developers. The ideal candidate should have strong experience with Redux, Tailwind, and Webpack.',
    skills: ['React', 'Redux', 'Tailwind CSS'],
    clientStats: { hireRate: '85%', totalSpent: '₹12,00,000+', rating: 4.8 }
  },
  {
    id: 'OFF-202',
    projectTitle: 'UI/UX Design for Fintech App',
    clientName: 'FinTrust',
    clientVerified: true,
    receivedDate: 'Oct 22, 2023',
    status: 'Pending',
    offerAmount: 60000,
    deliveryTime: '3 Weeks',
    projectDescription: 'We need a complete redesign of our mobile banking app. The current app has usability issues. We want a modern, clean, and trustworthy design. Deliverables include wireframes, high-fidelity mockups, and a clickable prototype.',
    skills: ['Figma', 'UI/UX', 'Mobile Design'],
    clientStats: { hireRate: '100%', totalSpent: '₹4,50,000+', rating: 5.0 }
  }
];

export default function MyProposals() {
  const [proposals, setProposals] = useState(MOCK_PROPOSALS);
  const [offers, setOffers] = useState(MOCK_OFFERS);
  const [activeTab, setActiveTab] = useState('All Proposals');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest');
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  
  const [withdrawModal, setWithdrawModal] = useState({ show: false, id: null });
  const [detailsModal, setDetailsModal] = useState({ show: false, type: null, data: null });
  
  // New state for Accept/Decline actions with reasons, and messaging
  const [actionModal, setActionModal] = useState({ show: false, actionType: null, offerId: null });
  const [actionMessage, setActionMessage] = useState('');
  const [declineReason, setDeclineReason] = useState('Budget too low');

  const tabs = ['All Proposals', 'Pending', 'Shortlisted', 'Accepted', 'Declined', 'Withdrawn', 'Received Offers'];
  const isOffersTab = activeTab === 'Received Offers';

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Stats calculation
  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'Pending').length,
    accepted: proposals.filter(p => p.status === 'Accepted').length,
    offers: offers.filter(o => o.status === 'Pending').length
  };

  // Filter & Sort Proposals
  const filteredProposals = proposals.filter(p => {
    const matchesTab = activeTab === 'All Proposals' || p.status === activeTab;
    const matchesSearch = p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  }).sort((a, b) => {
    if (sortOption === 'Newest') return -1;
    if (sortOption === 'Oldest') return 1;
    if (sortOption === 'Highest Bid') return b.bidAmount - a.bidAmount;
    if (sortOption === 'Lowest Bid') return a.bidAmount - b.bidAmount;
    return 0;
  });

  // Filter Offers
  const filteredOffers = offers.filter(o => {
    return o.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
           o.clientName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleWithdraw = () => {
    if (withdrawModal.id) {
      setProposals(prev => prev.map(p => p.id === withdrawModal.id ? { ...p, status: 'Withdrawn' } : p));
    }
    setWithdrawModal({ show: false, id: null });
    setMenuOpen(null);
  };

  const submitOfferAction = () => {
    if (!actionModal.offerId) return;
    
    if (actionModal.actionType === 'accept') {
      setOffers(prev => prev.map(o => o.id === actionModal.offerId ? { ...o, status: 'Accepted' } : o));
    } else if (actionModal.actionType === 'decline') {
      setOffers(prev => prev.map(o => o.id === actionModal.offerId ? { ...o, status: 'Declined' } : o));
    }
    // (If actionType === 'message', we would normally route to inbox)
    
    setActionModal({ show: false, actionType: null, offerId: null });
    setActionMessage('');
    setDetailsModal({ show: false, type: null, data: null });
  };

  const getEmptyStateContent = () => {
    if (searchQuery) return { title: 'No Search Results', desc: 'Try adjusting your keywords to find what you are looking for.' };
    if (activeTab === 'Pending') return { title: 'No Pending Proposals', desc: 'You do not have any pending proposals at the moment.' };
    if (activeTab === 'Received Offers') return { title: 'No Offers Yet', desc: 'You have not received any direct offers or invitations yet.' };
    return { title: 'No Proposals Yet', desc: 'Start exploring and applying to projects to see your proposals here.' };
  };

  const renderOfferCard = (offer) => (
    <div key={offer.id} className="proposal-card offer-card">
      <div className="card-header">
        <div className="project-info">
          <h3 className="project-title">{offer.projectTitle}</h3>
          <div className="client-meta">
            <span style={{color: 'var(--text-main)', fontWeight: 500}}>{offer.clientName}</span>
            {offer.clientVerified && (
              <span className="verified-badge" title="Payment Verified">
                <ShieldCheck size={14} /> Verified
              </span>
            )}
            <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <Clock size={14} /> Received: {offer.receivedDate}
            </span>
          </div>
        </div>
        <div>
          <span className={`status-badge status-${offer.status.toLowerCase()}`}>
            {offer.status === 'Pending' ? 'Action Required' : offer.status}
          </span>
        </div>
      </div>

      <div className="card-stats highlight-stats">
        <div className="stat-item">
          <span className="stat-label">Client's Offer</span>
          <span className="stat-value text-primary">{formatINR(offer.offerAmount)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Timeline</span>
          <span className="stat-value">{offer.deliveryTime}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Client Hire Rate</span>
          <span className="stat-value">{offer.clientStats.hireRate}</span>
        </div>
      </div>

      <div className="cover-letter-section">
        <p className="cover-letter">
          <strong style={{display: 'block', marginBottom: '8px', color: 'var(--text-main)'}}>Project Description:</strong>
          {offer.projectDescription}
        </p>
      </div>

      <div className="skills-list">
        {offer.skills.map(skill => (
          <span key={skill} className="skill-chip">{skill}</span>
        ))}
      </div>

      <div className="card-footer">
        <button className="btn-outline" onClick={() => setDetailsModal({ show: true, type: 'offer', data: offer })}>
          <Eye size={16} style={{marginRight: '8px'}}/> Analyze Offer
        </button>
        
        {offer.status === 'Pending' && (
          <div className="actions" style={{display: 'flex', gap: '12px'}}>
            <button className="btn-outline" onClick={() => setActionModal({ show: true, actionType: 'message', offerId: offer.id })}>
              <MessageSquare size={16} style={{marginRight: '4px'}}/> Connect
            </button>
            <button className="btn-outline danger" onClick={() => setActionModal({ show: true, actionType: 'decline', offerId: offer.id })}>
              <X size={16} style={{marginRight: '4px'}}/> Decline
            </button>
            <button className="btn-primary success" onClick={() => setActionModal({ show: true, actionType: 'accept', offerId: offer.id })}>
              <Check size={16} style={{marginRight: '4px'}}/> Accept Offer
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderProposalCard = (proposal) => (
    <div key={proposal.id} className="proposal-card">
      <div className="card-header">
        <div className="project-info">
          <h3 className="project-title">{proposal.projectTitle}</h3>
          <div className="client-meta">
            <span style={{color: 'var(--text-main)', fontWeight: 500}}>{proposal.clientName}</span>
            {proposal.clientVerified && (
              <span className="verified-badge" title="Payment Verified">
                <ShieldCheck size={14} /> Verified
              </span>
            )}
            <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              <Clock size={14} /> Submitted: {proposal.submittedDate}
            </span>
          </div>
        </div>
        <div>
          <span className={`status-badge status-${proposal.status.toLowerCase()}`}>
            {proposal.status}
          </span>
        </div>
      </div>

      <div className="card-stats">
        <div className="stat-item">
          <span className="stat-label">Your Bid</span>
          <span className="stat-value">{formatINR(proposal.bidAmount)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Estimated Delivery</span>
          <span className="stat-value">{proposal.deliveryTime}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Project Budget</span>
          <span className="stat-value">{proposal.projectBudget}</span>
        </div>
      </div>

      <div className="cover-letter-section">
        <p className="cover-letter">
          {proposal.coverLetter}
        </p>
      </div>

      <div className="skills-list">
        {proposal.skills.map(skill => (
          <span key={skill} className="skill-chip">{skill}</span>
        ))}
      </div>

      <div className="card-footer">
        <div className="last-activity">
          Last Activity: {proposal.lastActivity}
        </div>
        
        <div className="actions">
          <button className="btn-primary" onClick={() => setDetailsModal({ show: true, type: 'proposal', data: proposal })}>View Proposal</button>
          
          <div className="menu-wrapper">
            <button 
              className="btn-icon" 
              onClick={() => setMenuOpen(menuOpen === proposal.id ? null : proposal.id)}
            >
              <MoreVertical size={18} />
            </button>
            
            {menuOpen === proposal.id && (
              <div className="dropdown-menu">
                <button className="dropdown-item">
                  <Eye size={16} /> View Project
                </button>
                {(proposal.status === 'Accepted' || proposal.status === 'Shortlisted') && (
                  <button className="dropdown-item">
                    <MessageSquare size={16} /> Message Client
                  </button>
                )}
                {proposal.status === 'Pending' && (
                  <button className="dropdown-item">
                    <Edit2 size={16} /> Edit Proposal
                  </button>
                )}
                {(proposal.status === 'Pending' || proposal.status === 'Shortlisted') && (
                  <button 
                    className="dropdown-item danger"
                    onClick={() => setWithdrawModal({ show: true, id: proposal.id })}
                  >
                    <Trash2 size={16} /> Withdraw Proposal
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="gigsphere-freelancer-proposals">
      <div className="proposals-container">
        
        {/* Header */}
        <div className="page-header">
          <div className="breadcrumb">Dashboard / {isOffersTab ? 'Received Offers' : 'My Proposals'}</div>
          <h1 className="page-title">{isOffersTab ? 'Received Offers & Invitations' : 'My Proposals'}</h1>
          <p className="page-desc">{isOffersTab ? 'Review and accept direct job offers or interview invitations from clients.' : 'Track and manage all proposals you have submitted to Clients.'}</p>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <h3 className="kpi-title">Total Proposals</h3>
            <p className="kpi-value">{stats.total}</p>
          </div>
          <div className="kpi-card">
            <h3 className="kpi-title">Pending</h3>
            <p className="kpi-value">{stats.pending}</p>
          </div>
          <div className="kpi-card">
            <h3 className="kpi-title">Accepted</h3>
            <p className="kpi-value">{stats.accepted}</p>
          </div>
          <div className="kpi-card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <h3 className="kpi-title" style={{ color: 'var(--primary)' }}>New Offers</h3>
            <p className="kpi-value">{stats.offers}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          {tabs.map(tab => (
            <button 
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''} ${tab === 'Received Offers' ? 'highlight-tab' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {tab === 'Received Offers' && stats.offers > 0 && (
                <span className="badge badge-primary" style={{marginLeft: '8px'}}>{stats.offers}</span>
              )}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by project or client..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="toolbar-actions">
            <button className="btn-outline">
              <Filter size={16} /> Filters
            </button>
            {!isOffersTab && (
              <select 
                className="custom-select" 
                value={sortOption} 
                onChange={e => setSortOption(e.target.value)}
              >
                <option>Newest</option>
                <option>Oldest</option>
                <option>Highest Bid</option>
                <option>Lowest Bid</option>
              </select>
            )}
          </div>
        </div>

        {/* Content List */}
        <div className="proposals-list">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="proposal-card">
                <div className="skeleton" style={{width: '40%', height: '24px'}}></div>
                <div className="skeleton" style={{width: '100%', height: '80px'}}></div>
                <div className="skeleton" style={{width: '100%', height: '40px'}}></div>
              </div>
            ))
          ) : activeTab === 'All Proposals' ? (
            <>
              {filteredOffers.length > 0 && filteredOffers.map(renderOfferCard)}
              {filteredProposals.length > 0 && filteredProposals.map(renderProposalCard)}
              {filteredOffers.length === 0 && filteredProposals.length === 0 && (
                <div className="empty-state">
                  <FileSearch className="empty-icon" size={48} />
                  <h3 className="empty-title">{getEmptyStateContent().title}</h3>
                  <p className="empty-desc">{getEmptyStateContent().desc}</p>
                </div>
              )}
            </>
          ) : isOffersTab ? (
            // OFFERS VIEW
            filteredOffers.length > 0 ? filteredOffers.map(renderOfferCard) : (
              <div className="empty-state">
                <FileSearch className="empty-icon" size={48} />
                <h3 className="empty-title">{getEmptyStateContent().title}</h3>
                <p className="empty-desc">{getEmptyStateContent().desc}</p>
              </div>
            )
          ) : (
            // PROPOSALS VIEW
            filteredProposals.length > 0 ? filteredProposals.map(renderProposalCard) : (
              <div className="empty-state">
                <FileSearch className="empty-icon" size={48} />
                <h3 className="empty-title">{getEmptyStateContent().title}</h3>
                <p className="empty-desc">{getEmptyStateContent().desc}</p>
                {searchQuery && (
                  <button className="btn-outline" style={{marginTop: '24px'}} onClick={() => setSearchQuery('')}>
                    Clear Search
                  </button>
                )}
              </div>
            )
          )}
        </div>

      </div>

      {/* Withdraw Modal */}
      {withdrawModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Withdraw Proposal?</h3>
            <p className="modal-desc">Are you sure you want to withdraw this proposal? You will not be able to submit another proposal for this project.</p>
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setWithdrawModal({ show: false, id: null })}>Cancel</button>
              <button className="btn-danger" onClick={handleWithdraw}>Yes, Withdraw</button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Analysis Modal */}
      {detailsModal.show && detailsModal.data && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div className="modal-header-flex">
              <h3 className="modal-title">{detailsModal.type === 'offer' ? 'Analyze Direct Offer' : 'Proposal Details'}</h3>
              <button className="btn-icon" onClick={() => setDetailsModal({ show: false, type: null, data: null })}><X size={24}/></button>
            </div>
            
            <div className="modal-body">
              <div className="analysis-section">
                <h4>Project details</h4>
                <h2>{detailsModal.data.projectTitle}</h2>
                <p className="client-name">{detailsModal.data.clientName} {detailsModal.data.clientVerified && <ShieldCheck size={14} className="verified-icon"/>}</p>
                
                <div className="analysis-grid">
                  <div className="analysis-card">
                    <span className="analysis-label">{detailsModal.type === 'offer' ? 'Offered Amount' : 'Your Bid'}</span>
                    <span className="analysis-value">{formatINR(detailsModal.type === 'offer' ? detailsModal.data.offerAmount : detailsModal.data.bidAmount)}</span>
                  </div>
                  <div className="analysis-card">
                    <span className="analysis-label">Timeline</span>
                    <span className="analysis-value">{detailsModal.data.deliveryTime}</span>
                  </div>
                  {detailsModal.type === 'offer' && (
                    <>
                      <div className="analysis-card">
                        <span className="analysis-label">Client Rating</span>
                        <span className="analysis-value">⭐ {detailsModal.data.clientStats.rating}</span>
                      </div>
                      <div className="analysis-card">
                        <span className="analysis-label">Client Hire Rate</span>
                        <span className="analysis-value text-success">{detailsModal.data.clientStats.hireRate}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="description-box">
                  <h4>{detailsModal.type === 'offer' ? 'Client\'s Description' : 'Your Cover Letter'}</h4>
                  <p>{detailsModal.type === 'offer' ? detailsModal.data.projectDescription : detailsModal.data.coverLetter}</p>
                </div>
                
                {detailsModal.type === 'offer' && detailsModal.data.status === 'Pending' && (
                  <div className="analysis-insights">
                    <h4>💡 Insights</h4>
                    <p>This client has a high hire rate and has spent over {detailsModal.data.clientStats.totalSpent}. Accepting this offer could lead to long-term work.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions" style={{justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '24px'}}>
              <button className="btn-outline" onClick={() => setDetailsModal({ show: false, type: null, data: null })}>Close</button>
              
              {detailsModal.type === 'offer' && detailsModal.data.status === 'Pending' && (
                <div style={{display: 'flex', gap: '12px'}}>
                  <button className="btn-outline" onClick={() => setActionModal({ show: true, actionType: 'message', offerId: detailsModal.data.id })}>
                    <MessageSquare size={16} style={{marginRight: '4px'}}/> Connect
                  </button>
                  <button className="btn-outline danger" onClick={() => setActionModal({ show: true, actionType: 'decline', offerId: detailsModal.data.id })}>
                    Decline Offer
                  </button>
                  <button className="btn-primary success" onClick={() => setActionModal({ show: true, actionType: 'accept', offerId: detailsModal.data.id })}>
                    Accept Offer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Accept/Decline/Message) */}
      {actionModal.show && (
        <div className="modal-overlay" style={{zIndex: 1100}}>
          <div className="modal-content">
            <h3 className="modal-title">
              {actionModal.actionType === 'accept' ? 'Accept Offer' : 
               actionModal.actionType === 'decline' ? 'Decline Offer' : 'Message Client'}
            </h3>
            
            {actionModal.actionType === 'decline' && (
              <div className="form-group" style={{marginBottom: '16px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500}}>Reason for Declining</label>
                <select className="custom-select" style={{width: '100%', marginBottom: '16px'}} value={declineReason} onChange={(e) => setDeclineReason(e.target.value)}>
                  <option>Budget is too low</option>
                  <option>Timeline is too tight</option>
                  <option>Not a good fit for my skills</option>
                  <option>Currently unavailable</option>
                  <option>Other</option>
                </select>
              </div>
            )}

            <div className="form-group" style={{marginBottom: '24px'}}>
              <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500}}>
                {actionModal.actionType === 'message' ? 'Your Message' : 'Message to Client (Optional)'}
              </label>
              <textarea 
                rows={4} 
                className="search-input" 
                style={{width: '100%', padding: '12px', resize: 'none'}} 
                placeholder={actionModal.actionType === 'message' ? "Type your message..." : "Explain why you are making this decision..."}
                value={actionMessage}
                onChange={(e) => setActionMessage(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-outline" onClick={() => {setActionModal({ show: false, actionType: null, offerId: null }); setActionMessage('');}}>Cancel</button>
              
              {actionModal.actionType === 'accept' && (
                <button className="btn-primary success" onClick={submitOfferAction}>Confirm Acceptance</button>
              )}
              {actionModal.actionType === 'decline' && (
                <button className="btn-danger" onClick={submitOfferAction}>Decline Offer</button>
              )}
              {actionModal.actionType === 'message' && (
                <button className="btn-primary" onClick={submitOfferAction}>Send Message</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
