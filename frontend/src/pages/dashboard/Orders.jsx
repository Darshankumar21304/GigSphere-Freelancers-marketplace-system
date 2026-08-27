import React, { useState } from 'react';
import { 
  Search, Filter, List, Grid, MoreVertical, Plus, 
  ChevronRight, ChevronLeft, Calendar, Clock, CreditCard, LayoutTemplate, MessageSquare, Briefcase, FileText, Edit
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Orders.css';

export default function Orders() {
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('All Projects');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);
  
  // Fetch projects from backend
  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/projects');
        setProjects(response.data.map(p => ({
          ...p,
          id: p._id,
          status: 'Open', // Mock status for demo
          proposals: 0,
          postedDate: new Date(p.createdAt).toLocaleDateString()
        })));
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [workspaceTab, setWorkspaceTab] = useState('overview');
  const navigate = useNavigate();

  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedProjectForMilestone, setSelectedProjectForMilestone] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', amount: '', date: '' });

  const tabs = ['All Projects', 'Draft', 'Open', 'In Progress', 'Completed', 'Closed'];

  const handleActionClick = (action, project) => {
    if (action === 'Milestones') {
      setSelectedProjectForMilestone(project);
      setIsMilestoneModalOpen(true);
      setMenuOpen(null);
    } else if (action === 'Messages') {
      navigate('/client/dashboard/chat');
      setMenuOpen(null);
    } else if (action === 'Workspace') {
      setActiveWorkspace(project);
      setWorkspaceTab('overview');
      setMenuOpen(null);
    } else {
      setMenuOpen(null);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesTab = activeTab === 'All Projects' || p.status === activeTab;
    const matchesSearch = p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const StatusBadge = ({ status }) => {
    const statusClass = status.replace(/\s+/g, '-').toLowerCase();
    return (
      <span className={`client-projects-status client-projects-status-${statusClass}`}>
        {status}
      </span>
    );
  };

  const getActions = (status) => {
    switch (status) {
      case 'Draft': return ['Edit', 'Publish', 'Delete'];
      case 'Open': return ['View Proposals', 'Edit', 'Pause', 'Close'];
      case 'In Progress': return ['Workspace', 'Messages', 'Milestones'];
      case 'Completed': return ['View Details', 'Invoice', 'Review Freelancer'];
      default: return ['View Details'];
    }
  };

  if (activeWorkspace) {
    return (
      <div className="client-projects-page">
        {/* Workspace Header */}
        <div className="client-projects-header" style={{ marginBottom: '24px' }}>
          <div>
            <button 
              onClick={() => setActiveWorkspace(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', marginBottom: '8px', padding: 0 }}
            >
              <ChevronLeft size={16} /> Back to Projects
            </button>
            <h1 className="client-projects-title">{activeWorkspace.title} Workspace</h1>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/client/dashboard/chat')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={16} /> Message Freelancer
          </button>
        </div>

        {/* Workspace Tabs */}
        <div className="client-projects-tabs" style={{ marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
          {['overview', 'milestones', 'messages'].map(tab => (
            <button
              key={tab}
              onClick={() => {
                if (tab === 'messages') navigate('/client/dashboard/chat');
                else setWorkspaceTab(tab);
              }}
              className={`client-projects-tab ${workspaceTab === tab ? 'active' : ''}`}
              style={{ textTransform: 'capitalize' }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Workspace Content */}
        {workspaceTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div className="client-projects-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', margin: 0 }}>Project Overview</h3>
                <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border)', background: 'transparent', borderRadius: '6px', cursor: 'pointer' }} onClick={() => alert('Edit feature coming soon!')}>
                  <Edit size={14} /> Edit Project
                </button>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>{activeWorkspace.description}</p>
              
              <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Required Skills</h4>
              <div className="client-projects-skills">
                {activeWorkspace.skills.map(skill => (
                  <span key={skill} className="client-projects-skill">{skill}</span>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="client-projects-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Project Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                    <StatusBadge status={activeWorkspace.status} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Budget</span>
                    <span style={{ fontWeight: 600 }}>{formatINR(activeWorkspace.budget || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Deadline</span>
                    <span style={{ fontWeight: 600 }}>{activeWorkspace.deadline || 'Not Set'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Hired Freelancer</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{activeWorkspace.hired || 'None'}</span>
                  </div>
                </div>
              </div>

              <div className="client-projects-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Progress</h3>
                <div className="client-projects-progress-labels" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
                   <span>Completed</span>
                   <span style={{ color: 'var(--primary)' }}>{activeWorkspace.progress || 0}%</span>
                 </div>
                 <div className="client-projects-progress-track">
                   <div className="client-projects-progress-fill" style={{ width: `${activeWorkspace.progress || 0}%` }}></div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {workspaceTab === 'milestones' && (
          <div className="client-projects-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', margin: 0 }}>Project Milestones</h3>
              <button className="btn btn-primary" onClick={() => {setSelectedProjectForMilestone(activeWorkspace); setIsMilestoneModalOpen(true);}} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} /> Create Milestone
              </button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="client-projects-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '14px' }}>Milestone</th>
                    <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '14px' }}>Amount</th>
                    <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '14px' }}>Status</th>
                    <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '14px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ fontWeight: 500 }}>Initial Setup & Design</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Due: Oct 20, 2023</div>
                    </td>
                    <td style={{ padding: '16px 12px', fontWeight: 500 }}>{formatINR(25000)}</td>
                    <td style={{ padding: '16px 12px' }}><span className="client-projects-status client-projects-status-completed">Paid</span></td>
                    <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                      <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} disabled>Release</button>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{ fontWeight: 500 }}>Frontend Development</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Due: Nov 10, 2023</div>
                    </td>
                    <td style={{ padding: '16px 12px', fontWeight: 500 }}>{formatINR(35000)}</td>
                    <td style={{ padding: '16px 12px' }}><span className="client-projects-status client-projects-status-in-progress">In Progress</span></td>
                    <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px' }}>Release Payment</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Include Milestone Modal within the workspace view too so it works */}
        {isMilestoneModalOpen && selectedProjectForMilestone && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
            <div style={{ background: 'var(--white, #fff)', borderRadius: '12px', width: '90%', maxWidth: '400px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              {isSuccess ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ width: '64px', height: '64px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: 'var(--text-primary)' }}>Milestone Added!</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>The milestone has been successfully added to {selectedProjectForMilestone.title}.</p>
                </div>
              ) : (
                <>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: 'var(--text-primary)' }}>Create Milestone</h3>
                  <p style={{ margin: '0 0 20px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>Add a new milestone for {selectedProjectForMilestone.title}.</p>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    setIsProcessing(true);
                    setTimeout(() => {
                      setIsProcessing(false);
                      setIsSuccess(true);
                      setTimeout(() => {
                        setIsMilestoneModalOpen(false);
                        setIsSuccess(false);
                        setNewMilestone({ title: '', amount: '', date: '' });
                      }, 2000);
                    }, 1500);
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Milestone Title</label>
                      <input type="text" required placeholder="e.g. Design Handover" value={newMilestone.title} onChange={e => setNewMilestone({...newMilestone, title: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--border, #e5e7eb)', borderRadius: '8px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Budget Amount</label>
                      <input type="number" required placeholder="5000" value={newMilestone.amount} onChange={e => setNewMilestone({...newMilestone, amount: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--border, #e5e7eb)', borderRadius: '8px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Expected Date</label>
                      <input type="date" required value={newMilestone.date} onChange={e => setNewMilestone({...newMilestone, date: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--border, #e5e7eb)', borderRadius: '8px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                      <button type="button" onClick={() => setIsMilestoneModalOpen(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }} disabled={isProcessing}>Cancel</button>
                      <button type="submit" style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }} disabled={isProcessing}>{isProcessing ? 'Saving...' : 'Add Milestone'}</button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="client-projects-page">
      {/* Breadcrumbs & Header */}
      <div className="client-projects-header">
        <div className="client-projects-breadcrumbs">
          <span>Dashboard</span>
          <ChevronRight size={14} className="client-projects-breadcrumb-icon" />
          <span className="active">My Projects</span>
        </div>
        <div className="client-projects-header-content">
          <div>
            <h1 className="client-projects-title">My Projects</h1>
            <p className="client-projects-description">Create, manage, and track all your posted projects from one workspace.</p>
          </div>
          <Link 
            to="/client/dashboard/create-project"
            className="client-projects-create-btn"
          >
            <Plus size={18} /> Create Project
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="client-projects-stats-grid">
        <div className="client-projects-stat-card">
          <div className="client-projects-stat-header">
            <h3 className="client-projects-stat-label">Total Projects</h3>
            <div className="client-projects-stat-icon-container bg-gray">
              <LayoutTemplate size={16} className="client-projects-stat-icon text-gray" />
            </div>
          </div>
          <div className="client-projects-stat-value">12</div>
        </div>
        <div className="client-projects-stat-card">
          <div className="client-projects-stat-accent-bar"></div>
          <div className="client-projects-stat-header">
            <h3 className="client-projects-stat-label">Active Projects</h3>
            <div className="client-projects-stat-icon-container bg-brand">
              <Briefcase size={16} className="client-projects-stat-icon text-brand" />
            </div>
          </div>
          <div className="client-projects-stat-value">3</div>
        </div>
        <div className="client-projects-stat-card">
          <div className="client-projects-stat-header">
            <h3 className="client-projects-stat-label">Completed Projects</h3>
            <div className="client-projects-stat-icon-container bg-green">
              <FileText size={16} className="client-projects-stat-icon text-green" />
            </div>
          </div>
          <div className="client-projects-stat-value">8</div>
        </div>
        <div className="client-projects-stat-card">
          <div className="client-projects-stat-header">
            <h3 className="client-projects-stat-label">Total Spent</h3>
            <div className="client-projects-stat-icon-container bg-blue">
              <CreditCard size={16} className="client-projects-stat-icon text-blue" />
            </div>
          </div>
          <div className="client-projects-stat-value">{formatINR(155000)}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="client-projects-toolbar">
        <div className="client-projects-toolbar-top">
          <div className="client-projects-tabs">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`client-projects-tab ${activeTab === tab ? 'active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="client-projects-view-toggles">
             <button 
               onClick={() => setViewMode('grid')}
               className={`client-projects-view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
             >
               <Grid size={16} />
             </button>
             <button 
               onClick={() => setViewMode('list')}
               className={`client-projects-view-toggle ${viewMode === 'list' ? 'active' : ''}`}
             >
               <List size={16} />
             </button>
          </div>
        </div>

        <div className="client-projects-toolbar-bottom">
           <div className="client-projects-search">
             <Search className="client-projects-search-icon" size={16} />
             <input 
               type="text" 
               placeholder="Search projects..." 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               className="client-projects-search-input"
             />
           </div>
           <button className="client-projects-filter-btn">
             <Filter size={16} /> Filters
           </button>
           <select className="client-projects-sort">
             <option>Sort by: Newest</option>
             <option>Sort by: Oldest</option>
             <option>Sort by: Budget High to Low</option>
           </select>
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <div className="client-projects-empty-state">
           <div className="client-projects-empty-icon">
             <LayoutTemplate size={24} />
           </div>
           <h3 className="client-projects-empty-title">You haven't posted any projects yet</h3>
           <p className="client-projects-empty-desc">Create your first project and start receiving proposals from skilled freelancers.</p>
           <Link to="/client/dashboard/create-project" className="client-projects-create-btn">
             Create Your First Project
           </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="client-projects-grid">
          {filteredProjects.map(project => (
            <div key={project.id} className="client-projects-card">
              <div className="client-projects-card-body">
                <div className="client-projects-card-header">
                  <StatusBadge status={project.status} />
                  <div className="client-projects-menu-container">
                    <button 
                      onClick={() => setMenuOpen(menuOpen === project.id ? null : project.id)}
                      className="client-projects-menu-btn"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {menuOpen === project.id && (
                      <div className="client-projects-dropdown">
                        {getActions(project.status).map(action => (
                          <button key={action} className="client-projects-dropdown-item" onClick={() => handleActionClick(action, project)}>
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 className="client-projects-card-title">{project.title}</h3>
                <p className="client-projects-card-desc">{project.description}</p>
                
                <div className="client-projects-skills">
                  {project.skills && project.skills.map(skill => (
                    <span key={skill} className="client-projects-skill">{skill}</span>
                  ))}
                </div>

                {project.status === 'In Progress' && (
                  <div className="client-projects-progress" style={{ marginBottom: '16px' }}>
                     <div className="client-projects-progress-labels">
                       <span>Progress</span>
                       <span>{project.progress}%</span>
                     </div>
                     <div className="client-projects-progress-track">
                       <div className="client-projects-progress-fill" style={{ width: `${project.progress}%` }}></div>
                     </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button 
                    onClick={() => handleActionClick('Workspace', project)}
                    style={{ flex: 1, padding: '8px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Briefcase size={16} /> View Project
                  </button>
                  <button 
                    onClick={() => handleActionClick('Milestones', project)}
                    style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Plus size={16} /> Add Milestone
                  </button>
                </div>
              </div>

              <div className="client-projects-card-footer">
                <div className="client-projects-meta-grid">
                  <div className="client-projects-meta-item">
                    <p className="client-projects-meta-label">Budget ({project.budgetType})</p>
                    <p className="client-projects-meta-value">{formatINR(project.budget || 0)}{project.budgetType === 'Hourly' ? '/hr' : ''}</p>
                  </div>
                  <div className="client-projects-meta-item">
                    <p className="client-projects-meta-label">Proposals</p>
                    <div className="client-projects-meta-value-icon">
                      <MessageSquare size={14} className="icon" />
                      <span>{project.proposals}</span>
                    </div>
                  </div>
                  <div className="client-projects-meta-item">
                    <p className="client-projects-meta-label">Posted</p>
                    <div className="client-projects-meta-value-icon">
                      <Calendar size={14} className="icon" /> <span>{project.postedDate}</span>
                    </div>
                  </div>
                  <div className="client-projects-meta-item">
                    <p className="client-projects-meta-label">Deadline</p>
                    <div className="client-projects-meta-value-icon">
                      <Clock size={14} className="icon" /> <span>{project.deadline || 'Not set'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="client-projects-list-container">
          <table className="client-projects-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Budget</th>
                <th>Proposals</th>
                <th>Deadline</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => (
                <tr key={project.id}>
                  <td>
                    <div className="client-projects-table-title">{project.title}</div>
                    <div className="client-projects-table-category">{project.category}</div>
                  </td>
                  <td>
                    <StatusBadge status={project.status} />
                  </td>
                  <td>
                    <div className="client-projects-table-budget">{formatINR(project.budget || 0)}{project.budgetType === 'Hourly' ? '/hr' : ''}</div>
                    <div className="client-projects-table-budget-type">{project.budgetType}</div>
                  </td>
                  <td className="client-projects-table-proposals">
                    {project.proposals}
                  </td>
                  <td className="client-projects-table-deadline">
                    {project.deadline}
                  </td>
                  <td className="text-right relative">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        onClick={() => handleActionClick('Workspace', project)}
                        style={{ padding: '6px 12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Briefcase size={14} /> View
                      </button>
                      <button 
                        onClick={() => handleActionClick('Milestones', project)}
                        style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={14} /> Milestone
                      </button>
                      <div className="client-projects-menu-container list-view-menu">
                        <button 
                          onClick={() => setMenuOpen(menuOpen === project.id ? null : project.id)}
                          className="client-projects-menu-btn"
                        >
                          <MoreVertical size={16} />
                        </button>
                      {menuOpen === project.id && (
                        <div className="client-projects-dropdown list-dropdown">
                          {getActions(project.status).map(action => (
                            <button key={action} className="client-projects-dropdown-item" onClick={() => handleActionClick(action, project)}>
                              {action}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredProjects.length > 0 && (
        <div className="client-projects-pagination">
          <nav className="client-projects-pagination-nav">
            <button className="client-projects-page-btn" disabled>Prev</button>
            <button className="client-projects-page-btn active">1</button>
            <button className="client-projects-page-btn">2</button>
            <button className="client-projects-page-btn">3</button>
            <button className="client-projects-page-btn">Next</button>
          </nav>
        </div>
      )}

      {/* Create Milestone Modal */}
      {isMilestoneModalOpen && selectedProjectForMilestone && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(17,24,39,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ background: 'var(--white, #fff)', borderRadius: '12px', width: '90%', maxWidth: '400px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            {isSuccess ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 0' }}>
                <div style={{ width: '64px', height: '64px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: 'var(--text-primary)' }}>Milestone Added!</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>The milestone has been successfully added to {selectedProjectForMilestone.title}.</p>
              </div>
            ) : (
              <>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: 'var(--text-primary)' }}>Create Milestone</h3>
                <p style={{ margin: '0 0 20px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>Add a new milestone for {selectedProjectForMilestone.title}.</p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setIsProcessing(true);
                  setTimeout(() => {
                    setIsProcessing(false);
                    setIsSuccess(true);
                    setTimeout(() => {
                      setIsMilestoneModalOpen(false);
                      setIsSuccess(false);
                      setNewMilestone({ title: '', amount: '', date: '' });
                    }, 2000);
                  }, 1500);
                }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Milestone Title</label>
                    <input type="text" required placeholder="e.g. Design Handover" value={newMilestone.title} onChange={e => setNewMilestone({...newMilestone, title: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--border, #e5e7eb)', borderRadius: '8px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Budget Amount</label>
                    <input type="number" required placeholder="5000" value={newMilestone.amount} onChange={e => setNewMilestone({...newMilestone, amount: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--border, #e5e7eb)', borderRadius: '8px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Expected Date</label>
                    <input type="date" required value={newMilestone.date} onChange={e => setNewMilestone({...newMilestone, date: e.target.value})} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid var(--border, #e5e7eb)', borderRadius: '8px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                    <button type="button" onClick={() => setIsMilestoneModalOpen(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }} disabled={isProcessing}>Cancel</button>
                    <button type="submit" style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }} disabled={isProcessing}>{isProcessing ? 'Saving...' : 'Add Milestone'}</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
