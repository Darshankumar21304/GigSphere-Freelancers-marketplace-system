import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, List, Grid, MoreVertical, 
  MapPin, Star, ShieldCheck, Clock, Calendar, 
  CheckCircle, Briefcase, CreditCard, ChevronRight,
  MessageSquare, User, FileText, CheckSquare, 
  XOctagon, Navigation
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import './HiredFreelancers.css';

const MOCK_HIRED_FREELANCERS = [
  {
    id: 'HF-101',
    freelancer: {
      name: 'Alex Smith',
      title: 'Senior UI/UX Designer',
      avatar: 'https://i.pravatar.cc/150?u=alex',
      isVerified: true,
      rating: 4.9,
      location: 'Mumbai, India',
      skills: ['Figma', 'UI/UX', 'Web Design']
    },
    project: {
      id: 'PRJ-1021',
      title: 'Modern E-commerce Website Design',
      value: 85000,
      progress: 65,
      milestonesTotal: 5,
      milestonesCompleted: 3,
      nextMilestone: 'Homepage Development',
      nextDeadline: '12 Aug 2026',
      startDate: '01 Jul 2026',
      deadline: '30 Aug 2026'
    },
    contract: {
      status: 'Active',
      amountPaid: 35000,
      lastActivity: '2 hours ago'
    }
  },
  {
    id: 'HF-102',
    freelancer: {
      name: 'Priya Sharma',
      title: 'Full Stack Node.js Developer',
      avatar: 'https://i.pravatar.cc/150?u=priya',
      isVerified: true,
      rating: 4.8,
      location: 'Bangalore, India',
      skills: ['Node.js', 'React', 'MongoDB']
    },
    project: {
      id: 'PRJ-1018',
      title: 'Custom Payment Gateway Integration',
      value: 45000,
      progress: 100,
      milestonesTotal: 4,
      milestonesCompleted: 4,
      nextMilestone: null,
      nextDeadline: null,
      startDate: '10 Sep 2025',
      deadline: '25 Sep 2025'
    },
    contract: {
      status: 'Completed',
      amountPaid: 45000,
      completedDate: '26 Sep 2025',
      finalRatingGiven: 5.0,
      reviewStatus: 'Reviewed',
      lastActivity: '1 month ago'
    }
  },
  {
    id: 'HF-103',
    freelancer: {
      name: 'Rahul Verma',
      title: 'SEO & Content Strategist',
      avatar: 'https://i.pravatar.cc/150?u=rahul',
      isVerified: false,
      rating: 4.5,
      location: 'Delhi, India',
      skills: ['SEO', 'Content Writing', 'Marketing']
    },
    project: {
      id: 'PRJ-1022',
      title: 'SEO Content Writing for Tech Blog',
      value: 20000,
      progress: 0,
      milestonesTotal: 2,
      milestonesCompleted: 0,
      nextMilestone: 'Keyword Research',
      nextDeadline: '20 Aug 2026',
      startDate: '15 Aug 2026',
      deadline: '30 Sep 2026'
    },
    contract: {
      status: 'Awaiting Start',
      amountPaid: 0,
      lastActivity: '1 day ago'
    }
  },
  {
    id: 'HF-104',
    freelancer: {
      name: 'Sneha Gupta',
      title: 'Mobile App Developer (Flutter)',
      avatar: 'https://i.pravatar.cc/150?u=sneha',
      isVerified: true,
      rating: 4.7,
      location: 'Pune, India',
      skills: ['Flutter', 'Dart', 'Firebase']
    },
    project: {
      id: 'PRJ-1030',
      title: 'Food Delivery App MVP',
      value: 120000,
      progress: 90,
      milestonesTotal: 4,
      milestonesCompleted: 3,
      nextMilestone: 'Final Testing & Bug Fixes',
      nextDeadline: '15 Jul 2026',
      startDate: '01 May 2026',
      deadline: '20 Jul 2026'
    },
    contract: {
      status: 'Work Submitted',
      amountPaid: 80000,
      lastActivity: '30 mins ago'
    }
  }
];

export default function HiredFreelancers() {
  const navigate = useNavigate();
  const [freelancers, setFreelancers] = useState(MOCK_HIRED_FREELANCERS);
  const [activeTab, setActiveTab] = useState('All Freelancers');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);

  const tabs = ['All Freelancers', 'Active', 'Awaiting Start', 'Work Submitted', 'Completed'];

  const filteredFreelancers = freelancers.filter(f => {
    const matchesTab = activeTab === 'All Freelancers' || f.contract.status === activeTab;
    const matchesSearch = 
      f.freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.freelancer.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  // KPIs
  const totalHired = freelancers.length;
  const currentlyWorking = freelancers.filter(f => ['Active', 'Work Submitted'].includes(f.contract.status)).length;
  const completedContracts = freelancers.filter(f => f.contract.status === 'Completed').length;
  const totalPaid = freelancers.reduce((acc, curr) => acc + curr.contract.amountPaid, 0);

  const getStatusClass = (status) => {
    return status.replace(/\s+/g, '-').toLowerCase();
  };

  const getValidActions = (status, reviewStatus) => {
    const baseActions = [];
    baseActions.push({ label: 'Message Freelancer', icon: MessageSquare });
    baseActions.push({ label: 'View Profile', icon: User });
    baseActions.push({ label: 'View Contract', icon: FileText });
    
    if (status !== 'Completed') {
      baseActions.push({ label: 'View Milestones', icon: CheckSquare });
    }

    if (status === 'Work Submitted' || status === 'Active') {
      baseActions.push({ label: 'Release Payment', icon: CreditCard });
    }

    if (status === 'Completed' && reviewStatus !== 'Reviewed') {
      baseActions.push({ label: 'Leave Review', icon: Star });
    }

    if (status === 'Active' || status === 'Awaiting Start' || status === 'Work Submitted') {
      baseActions.push({ label: 'End Contract', icon: XOctagon, danger: true });
    }

    return baseActions;
  };

  return (
    <div className="gigsphere-client-hired-freelancers">
      {/* Header */}
      <div className="gchf-header">
        <div className="gchf-breadcrumbs">
          <Link to="/client/dashboard">Dashboard</Link>
          <ChevronRight size={14} className="gchf-breadcrumb-icon" />
          <span className="gchf-active-breadcrumb">Hired Freelancers</span>
        </div>
        <div className="gchf-header-content">
          <div>
            <h1 className="gchf-page-title">Hired Freelancers</h1>
            <p className="gchf-page-description">Manage freelancers you have hired and track your active collaborations.</p>
          </div>
          <Link to="/explore" className="gchf-browse-btn">
            <Search size={18} /> Browse Freelancers
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="gchf-kpi-grid">
        <div className="gchf-kpi-card">
          <div className="gchf-kpi-icon-wrap bg-blue">
            <User className="gchf-kpi-icon text-blue" size={20} />
          </div>
          <div className="gchf-kpi-info">
            <h3 className="gchf-kpi-label">Total Freelancers Hired</h3>
            <p className="gchf-kpi-value">{totalHired}</p>
          </div>
        </div>
        <div className="gchf-kpi-card">
          <div className="gchf-kpi-icon-wrap bg-brand">
            <Briefcase className="gchf-kpi-icon text-brand" size={20} />
          </div>
          <div className="gchf-kpi-info">
            <h3 className="gchf-kpi-label">Currently Working</h3>
            <p className="gchf-kpi-value">{currentlyWorking}</p>
          </div>
        </div>
        <div className="gchf-kpi-card">
          <div className="gchf-kpi-icon-wrap bg-green">
            <CheckCircle className="gchf-kpi-icon text-green" size={20} />
          </div>
          <div className="gchf-kpi-info">
            <h3 className="gchf-kpi-label">Completed Contracts</h3>
            <p className="gchf-kpi-value">{completedContracts}</p>
          </div>
        </div>
        <div className="gchf-kpi-card">
          <div className="gchf-kpi-icon-wrap bg-purple">
            <CreditCard className="gchf-kpi-icon text-purple" size={20} />
          </div>
          <div className="gchf-kpi-info">
            <h3 className="gchf-kpi-label">Total Paid</h3>
            <p className="gchf-kpi-value">{formatINR(totalPaid)}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="gchf-toolbar">
        <div className="gchf-toolbar-top">
          <div className="gchf-tabs">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`gchf-tab ${activeTab === tab ? 'gchf-active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="gchf-view-toggles">
            <button 
              onClick={() => setViewMode('grid')}
              className={`gchf-view-toggle ${viewMode === 'grid' ? 'gchf-active' : ''}`}
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`gchf-view-toggle ${viewMode === 'list' ? 'gchf-active' : ''}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
        <div className="gchf-toolbar-bottom">
          <div className="gchf-search-box">
            <Search className="gchf-search-icon" size={16} />
            <input 
              type="text" 
              placeholder="Search freelancers, projects, or skills..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="gchf-search-input"
            />
          </div>
          <button className="gchf-filter-btn">
            <Filter size={16} /> Filters
          </button>
          <select className="gchf-sort-select">
            <option>Sort by: Newest</option>
            <option>Sort by: Oldest</option>
            <option>Sort by: Highest Paid</option>
          </select>
        </div>
      </div>

      {/* Collaboration Cards */}
      {filteredFreelancers.length === 0 ? (
        <div className="gchf-empty-state">
          <div className="gchf-empty-icon-wrap">
            <User size={32} />
          </div>
          <h3 className="gchf-empty-title">
            {activeTab === 'All Freelancers' ? 'No Freelancers Hired Yet' : 
             activeTab === 'Completed' ? 'No Completed Contracts' : 
             searchQuery ? 'No Search Results' : 'No Active Collaborations'}
          </h3>
          <p className="gchf-empty-desc">
            {searchQuery 
              ? 'Try adjusting your search or filters to find what you are looking for.' 
              : 'Post a project or browse our talented freelancers to get started.'}
          </p>
          {!searchQuery && activeTab === 'All Freelancers' && (
            <Link to="/explore" className="gchf-browse-btn-large">
              Browse Freelancers
            </Link>
          )}
        </div>
      ) : (
        <div className={`gchf-${viewMode}-view`}>
          {filteredFreelancers.map(item => {
            const remainingPayment = item.project.value - item.contract.amountPaid;
            const isCompleted = item.contract.status === 'Completed';

            return (
              <div key={item.id} className="gchf-collab-card">
                
                {/* Freelancer Header Info */}
                <div className="gchf-card-header">
                  <div className="gchf-freelancer-profile">
                    <div className="gchf-avatar-container">
                      <img src={item.freelancer.avatar} alt={item.freelancer.name} className="gchf-avatar" />
                      {item.freelancer.isVerified && (
                        <div className="gchf-verified-badge" title="Verified Freelancer">
                          <ShieldCheck size={12} />
                        </div>
                      )}
                    </div>
                    <div className="gchf-freelancer-info">
                      <h3 className="gchf-freelancer-name">{item.freelancer.name}</h3>
                      <p className="gchf-freelancer-title">{item.freelancer.title}</p>
                      <div className="gchf-freelancer-meta">
                        <span className="gchf-meta-item"><Star size={12} className="text-yellow" /> {item.freelancer.rating}</span>
                        <span className="gchf-meta-divider">•</span>
                        <span className="gchf-meta-item"><MapPin size={12} /> {item.freelancer.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="gchf-card-menu-container">
                    <span className={`gchf-status-badge gchf-status-${getStatusClass(item.contract.status)}`}>
                      {item.contract.status}
                    </span>
                    <button 
                      className="gchf-menu-btn"
                      onClick={() => setMenuOpen(menuOpen === item.id ? null : item.id)}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {menuOpen === item.id && (
                      <div className="gchf-dropdown-menu">
                        {getValidActions(item.contract.status, item.contract.reviewStatus).map((action, idx) => (
                          <button 
                            key={idx} 
                            className={`gchf-dropdown-item ${action.danger ? 'gchf-danger' : ''}`}
                            onClick={() => {
                              setMenuOpen(null);
                              if (action.label.includes('Message')) {
                                navigate('/client/dashboard/chat');
                              } else if (action.label.includes('Profile')) {
                                navigate('/freelancers');
                              } else {
                                alert(`${action.label} action triggered for ${item.freelancer.name}`);
                              }
                            }}
                          >
                            <action.icon size={14} /> {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Details */}
                <div className="gchf-project-details">
                  <div className="gchf-project-header">
                    <span className="gchf-project-label">Current Project</span>
                    <span className="gchf-last-activity"><Clock size={12} /> Active {item.contract.lastActivity}</span>
                  </div>
                  <h4 className="gchf-project-title">{item.project.title}</h4>
                  
                  <div className="gchf-skills-row">
                    {item.freelancer.skills.map((skill, idx) => (
                      <span key={idx} className="gchf-skill-pill">{skill}</span>
                    ))}
                  </div>
                </div>

                {/* Finances & Dates */}
                <div className="gchf-stats-row">
                  <div className="gchf-stat-box">
                    <span className="gchf-stat-label">Project Value</span>
                    <span className="gchf-stat-value">{formatINR(item.project.value)}</span>
                  </div>
                  <div className="gchf-stat-box">
                    <span className="gchf-stat-label">Amount Paid</span>
                    <span className="gchf-stat-value text-green">{formatINR(item.contract.amountPaid)}</span>
                  </div>
                  {!isCompleted ? (
                    <div className="gchf-stat-box">
                      <span className="gchf-stat-label">Remaining</span>
                      <span className="gchf-stat-value text-brand">{formatINR(remainingPayment)}</span>
                    </div>
                  ) : (
                    <div className="gchf-stat-box">
                      <span className="gchf-stat-label">Final Rating</span>
                      <span className="gchf-stat-value text-yellow"><Star size={14} style={{display:'inline', marginBottom:'-2px'}}/> {item.contract.finalRatingGiven}</span>
                    </div>
                  )}
                </div>

                {/* Progress & Milestones (For Active/Working) */}
                {!isCompleted ? (
                  <div className="gchf-progress-section">
                    <div className="gchf-progress-top">
                      <span className="gchf-progress-label">Project Progress</span>
                      <span className="gchf-progress-percent">{item.project.progress}%</span>
                    </div>
                    <div className="gchf-progress-bar">
                      <div className="gchf-progress-fill" style={{ width: `${item.project.progress}%` }}></div>
                    </div>
                    <div className="gchf-milestone-info">
                      <span className="gchf-milestone-count">{item.project.milestonesCompleted} of {item.project.milestonesTotal} Milestones Completed</span>
                      {item.project.nextMilestone && (
                        <div className="gchf-next-milestone">
                          <strong>Next Milestone:</strong> {item.project.nextMilestone}
                          <span className="gchf-due-date">Due: {item.project.nextDeadline}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="gchf-completed-section">
                    <div className="gchf-completed-date">
                      <Calendar size={14} /> Completed Date: {item.contract.completedDate}
                    </div>
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="gchf-card-footer">
                  <div className="gchf-dates">
                    <span>Started: {item.project.startDate}</span>
                    <span>Deadline: {item.project.deadline}</span>
                  </div>
                  <button className="gchf-primary-action" onClick={() => navigate('/client/dashboard/chat')}>
                    <Navigation size={16} /> Open Workspace
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
