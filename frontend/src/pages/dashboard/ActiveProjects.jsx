import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Clock, Calendar, CheckCircle, 
  MessageSquare, FolderOpen, Send, AlertTriangle, ArrowLeft, Paperclip, Check, X
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { apiFetch } from '../../utils/api';
import './ActiveProjects.css';

export default function ActiveProjects() {
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('All Active');
  const [isLoading, setIsLoading] = useState(true);

  // Workspace State
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [workspaceTab, setWorkspaceTab] = useState('Overview');
  const [submitModal, setSubmitModal] = useState({ show: false, milestone: null });
  const [submitText, setSubmitText] = useState('');

  const tabs = ['All Active', 'In Progress', 'Submitted for Review', 'Revision Requested', 'Completed'];
  const workspaceTabs = ['Overview', 'Milestones', 'Messages'];

  useEffect(() => {
    fetchActiveContracts();
  }, []);

  const fetchActiveContracts = async () => {
    try {
      const data = await apiFetch('/contracts/active').catch(() => []);
      const mapped = (Array.isArray(data) ? data : []).map(c => {
        const milestonesArr = c.milestones || [];
        const completedMilestones = milestonesArr.filter(m => m.status === 'Completed');
        const earned = completedMilestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
        const totalVal = Number(c.totalValue || 0);
        const progressPercent = milestonesArr.length > 0 ? Math.round((completedMilestones.length / milestonesArr.length) * 100) : 0;
        
        const deadlineDate = c.deadline ? new Date(c.deadline) : new Date(Date.now() + 14 * 86400000);
        const remainingMs = deadlineDate.getTime() - new Date().getTime();
        const daysRemaining = Math.ceil(remainingMs / (1000 * 3600 * 24));
        const activeMilestone = milestonesArr.find(m => m.status === 'In Progress' || m.status === 'Under Review' || m.status === 'Pending') || milestonesArr[milestonesArr.length - 1];

        const clientObj = c.client_id || {};
        const clientName = clientObj.name || clientObj.companyName || 'Client Partner';
        const clientAvatar = clientObj.avatar || clientObj.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=1a73e8&color=fff`;

        return {
          ...c,
          id: c._id,
          title: c.title ? c.title.replace('Contract: ', '') : (c.project_id?.title || 'Active Project'),
          clientName,
          clientAvatar,
          daysRemaining: isNaN(daysRemaining) ? 14 : daysRemaining,
          totalValue: totalVal,
          amountEarned: earned,
          progress: progressPercent,
          milestonesTotal: milestonesArr.length,
          milestonesCompleted: completedMilestones.length,
          currentMilestone: activeMilestone ? activeMilestone.title : 'None',
          nextDeadline: activeMilestone && activeMilestone.deadline ? new Date(activeMilestone.deadline).toLocaleDateString('en-IN') : 'N/A',
          startDate: new Date(c.startDate || c.createdAt || Date.now()).toLocaleDateString('en-IN'),
          deadline: deadlineDate.toLocaleDateString('en-IN')
        };
      });
      setProjects(mapped);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Compute KPIs
  const activeCount = projects.filter(p => p.status !== 'Completed').length;
  const milestonesDue = projects.filter(p => p.status !== 'Completed' && p.daysRemaining <= 7).length;
  const upcomingDeadlines = projects.filter(p => p.status !== 'Completed' && p.daysRemaining <= 3).length;
  const pendingPayments = projects
    .filter(p => p.status !== 'Completed')
    .reduce((acc, curr) => acc + (curr.totalValue - curr.amountEarned), 0);

  const filteredProjects = projects.filter(p => {
    if (activeTab === 'All Active') return p.status !== 'Completed';
    return p.status === activeTab;
  });

  const getUrgencyClass = (days) => {
    if (days <= 3) return 'urgency-high';
    if (days <= 7) return 'urgency-medium';
    return 'urgency-low';
  };

  const getUrgencyText = (days) => {
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due Today';
    if (days === 1) return 'Due Tomorrow';
    return `${days} Days Left`;
  };

  const handleOpenWorkspace = (id, defaultTab = 'Overview') => {
    setSelectedProjectId(id);
    setWorkspaceTab(defaultTab);
  };

  const handleCloseWorkspace = () => {
    setSelectedProjectId(null);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleSubmitWork = async () => {
    if (!submitModal.milestone) return;

    try {
      await apiFetch(`/contracts/${selectedProjectId}/milestones/${submitModal.milestone._id}/submit`, {
        method: 'PUT'
      });
      
      setSubmitModal({ show: false, milestone: null });
      setSubmitText('');
      alert('Work submitted successfully');
      fetchActiveContracts();
    } catch (error) {
      console.error('Failed to submit work:', error);
      alert('Failed to submit work: ' + error.message);
    }
  };

  return (
    <div className="gigsphere-freelancer-active-projects animate-fade-in-up">
      <div className="projects-container">
        
        {selectedProject ? (
          /* WORKSPACE VIEW */
          <div className="workspace-view">
            <button className="btn btn-secondary back-btn" onClick={handleCloseWorkspace}>
              <ArrowLeft size={16} /> Back to Projects
            </button>

            <div className="workspace-header">
              <div className="project-info">
                <h1 className="page-title">{selectedProject.title}</h1>
                <div className="client-meta">
                  <img src={selectedProject.clientAvatar} alt={selectedProject.clientName} className="client-avatar-small" />
                  <span>{selectedProject.clientName}</span>
                  <span className={`status-badge status-${selectedProject.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {selectedProject.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="tabs-container workspace-tabs">
              {workspaceTabs.map(tab => (
                <button 
                  key={tab}
                  className={`tab-btn ${workspaceTab === tab ? 'active' : ''}`}
                  onClick={() => setWorkspaceTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="workspace-content">
              {workspaceTab === 'Overview' && (
                <div className="overview-tab">
                  <div className="financial-grid">
                    <div className="financial-item">
                      <span className="financial-label">Total Project Value</span>
                      <span className="financial-value" style={{fontSize: '24px'}}>{formatINR(selectedProject.totalValue)}</span>
                    </div>
                    <div className="financial-item">
                      <span className="financial-label">Earned / Released</span>
                      <span className="financial-value value-earned" style={{fontSize: '24px'}}>{formatINR(selectedProject.amountEarned)}</span>
                    </div>
                    <div className="financial-item">
                      <span className="financial-label">Remaining to Earn</span>
                      <span className="financial-value value-remaining" style={{fontSize: '24px'}}>{formatINR(selectedProject.totalValue - selectedProject.amountEarned)}</span>
                    </div>
                  </div>

                  <div className="project-card mt-24">
                    <div className="progress-section">
                      <div className="progress-header">
                        <span className="progress-title">Project Progress</span>
                        <span className="progress-count">
                          {selectedProject.milestonesCompleted} of {selectedProject.milestonesTotal} Milestones
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{width: `${selectedProject.progress}%`}}></div>
                      </div>
                    </div>
                    
                    <div className="dates-flex mt-16" style={{borderTop: 'none'}}>
                      <span><strong>Started:</strong> {selectedProject.startDate}</span>
                      <span><strong>Final Deadline:</strong> {selectedProject.deadline}</span>
                    </div>
                  </div>
                </div>
              )}

              {workspaceTab === 'Milestones' && (
                <div className="milestones-tab">
                  <h3 className="section-title">Project Milestones</h3>
                  <div className="milestones-list">
                    {selectedProject.milestones.map((milestone, idx) => (
                      <div key={milestone.id} className="milestone-card">
                        <div className="milestone-number">{idx + 1}</div>
                        <div className="milestone-details">
                          <div className="milestone-header">
                            <h4>{milestone.title}</h4>
                            <span className="milestone-amount">{formatINR(milestone.amount)}</span>
                          </div>
                          <div className="milestone-meta">
                            <span className="milestone-deadline"><Calendar size={14}/> Due: {new Date(milestone.deadline).toLocaleDateString()}</span>
                            <span className={`status-badge status-${milestone.status.toLowerCase().replace(/\s+/g, '-')}`}>
                              {milestone.status}
                            </span>
                          </div>
                        </div>
                        <div className="milestone-actions">
                          {milestone.status === 'In Progress' && (
                            <button className="btn btn-primary" onClick={() => setSubmitModal({ show: true, milestone })}>
                              <Send size={16} /> Submit Work
                            </button>
                          )}
                          {milestone.status === 'Under Review' && (
                            <button className="btn btn-secondary" disabled>Under Review</button>
                          )}
                          {milestone.status === 'Completed' && (
                            <button className="btn btn-success" disabled><Check size={16}/> Paid</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {workspaceTab === 'Messages' && (
                <div className="messages-tab">
                  <div className="empty-state" style={{padding: '40px 20px'}}>
                    <MessageSquare className="empty-icon" size={48} />
                    <h3 className="empty-title">Project Messages</h3>
                    <p className="empty-desc">Send a message to {selectedProject.clientName} regarding this project.</p>
                    <div className="chat-input-mock mt-24" style={{width: '100%', maxWidth: '600px', display: 'flex', gap: '8px'}}>
                      <input type="text" className="search-input" placeholder="Type your message..." style={{flex: 1}}/>
                      <button className="btn btn-primary"><Send size={16}/></button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Work Modal */}
            {submitModal.show && (
              <div className="modal-overlay" style={{zIndex: 1100}}>
                <div className="modal-content">
                  <h3 className="modal-title">Submit Work for Milestone</h3>
                  <p className="modal-desc" style={{marginBottom: '16px'}}>
                    Submitting work for: <strong>{submitModal.milestone.title}</strong>
                  </p>
                  
                  <div className="form-group" style={{marginBottom: '16px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500}}>Upload Files</label>
                    <div className="upload-box">
                      <Paperclip size={24} color="var(--text-muted)"/>
                      <span>Click to upload or drag & drop files here</span>
                    </div>
                  </div>

                  <div className="form-group" style={{marginBottom: '24px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500}}>Message to Client</label>
                    <textarea 
                      rows={4} 
                      className="search-input" 
                      style={{width: '100%', padding: '12px', resize: 'none'}} 
                      placeholder="Describe the work you have completed..."
                      value={submitText}
                      onChange={(e) => setSubmitText(e.target.value)}
                    />
                  </div>

                  <div className="modal-actions">
                    <button className="btn-outline" onClick={() => {setSubmitModal({ show: false, milestone: null }); setSubmitText('');}}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmitWork}>Submit for Review</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* PROJECTS LIST VIEW */
          <>
            {/* Header */}
            <div className="page-header">
              <div className="breadcrumb">Dashboard / Active Projects</div>
              <h1 className="page-title">Active Projects</h1>
              <p className="page-desc">Manage your ongoing work, milestones, deadlines, and Client communication.</p>
            </div>

            {upcomingDeadlines > 0 && (
              <div className="deadlines-banner">
                <AlertTriangle size={20} />
                You have {upcomingDeadlines} project{upcomingDeadlines > 1 ? 's' : ''} with deadlines approaching in the next 3 days!
              </div>
            )}

            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <h3 className="kpi-title">Active Projects</h3>
                <p className="kpi-value">{activeCount}</p>
              </div>
              <div className="kpi-card">
                <h3 className="kpi-title">Milestones Due</h3>
                <p className="kpi-value">{milestonesDue}</p>
              </div>
              <div className="kpi-card">
                <h3 className="kpi-title">Upcoming Deadlines</h3>
                <p className="kpi-value" style={{color: upcomingDeadlines > 0 ? 'var(--urgency-high-text)' : 'inherit'}}>
                  {upcomingDeadlines}
                </p>
              </div>
              <div className="kpi-card">
                <h3 className="kpi-title">Pending Payments</h3>
                <p className="kpi-value">{formatINR(pendingPayments)}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
              {tabs.map(tab => (
                <button 
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Projects Grid */}
            <div className="projects-grid">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="project-card">
                    <div className="skeleton" style={{width: '60%', height: '24px'}}></div>
                    <div className="skeleton" style={{width: '100%', height: '80px'}}></div>
                    <div className="skeleton" style={{width: '100%', height: '60px'}}></div>
                  </div>
                ))
              ) : filteredProjects.length > 0 ? (
                filteredProjects.map(project => {
                  const remainingPayment = project.totalValue - project.amountEarned;
                  
                  return (
                    <div key={project.id} className="project-card">
                      
                      <div className="card-header">
                        <div>
                          <div className="client-info">
                            <img src={project.clientAvatar} alt={project.clientName} className="client-avatar" />
                            <span className="client-name">{project.clientName}</span>
                          </div>
                          <h3 className="project-title">{project.title}</h3>
                        </div>
                        <div>
                          <span className={`status-badge status-${project.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {project.status}
                          </span>
                        </div>
                      </div>

                      <div className="financial-grid">
                        <div className="financial-item">
                          <span className="financial-label">Total Value</span>
                          <span className="financial-value">{formatINR(project.totalValue)}</span>
                        </div>
                        <div className="financial-item">
                          <span className="financial-label">Earned</span>
                          <span className="financial-value value-earned">{formatINR(project.amountEarned)}</span>
                        </div>
                        <div className="financial-item">
                          <span className="financial-label">Remaining</span>
                          <span className="financial-value value-remaining">{formatINR(remainingPayment)}</span>
                        </div>
                      </div>

                      <div className="progress-section">
                        <div className="progress-header">
                          <span className="progress-title">Project Progress</span>
                          <span className="progress-count">
                            {project.milestonesCompleted} of {project.milestonesTotal} Milestones
                          </span>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{width: `${project.progress}%`}}></div>
                        </div>
                        
                        <div className="milestone-info">
                          <div className="milestone-current">
                            <CheckCircle size={14} color="var(--primary)" />
                            Current: <strong>{project.currentMilestone}</strong>
                          </div>
                          {project.status !== 'Completed' && (
                            <div style={{display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px'}}>
                              <span className={`urgency-indicator ${getUrgencyClass(project.daysRemaining)}`}>
                                <Clock size={12} /> {getUrgencyText(project.daysRemaining)}
                              </span>
                              <span style={{fontSize: '13px', color: 'var(--text-muted)'}}>
                                Next deadline: {project.nextDeadline}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="dates-flex">
                        <span>Started: {project.startDate}</span>
                        <span>Deadline: {project.deadline}</span>
                      </div>

                      <div className="card-actions">
                        <button className="btn btn-secondary" onClick={() => handleOpenWorkspace(project.id, 'Overview')}>
                          <FolderOpen size={16} /> Workspace
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleOpenWorkspace(project.id, 'Messages')}>
                          <MessageSquare size={16} /> Message
                        </button>
                        <button className="btn btn-secondary" onClick={() => handleOpenWorkspace(project.id, 'Milestones')}>
                          <Calendar size={16} /> Milestones
                        </button>
                        {(project.status === 'In Progress' || project.status === 'Revision Requested') && (
                          <button className="btn btn-primary" onClick={() => {
                            const activeMilestone = project.milestones.find(m => m.status === 'In Progress') || project.milestones[0];
                            handleOpenWorkspace(project.id, 'Milestones');
                            setSubmitModal({ show: true, milestone: activeMilestone });
                          }}>
                            <Send size={16} /> Submit Work
                          </button>
                        )}
                        {(project.status === 'Submitted for Review') && (
                          <button className="btn btn-success" disabled>
                            Under Review
                          </button>
                        )}
                      </div>
                      
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  <Briefcase className="empty-icon" size={48} />
                  <h3 className="empty-title">No Active Projects</h3>
                  <p className="empty-desc">
                    {activeTab === 'All Active' 
                      ? 'You currently have no ongoing projects. Check your proposals or browse for new opportunities.'
                      : `You have no projects with status '${activeTab}'.`}
                  </p>
                  {activeTab === 'All Active' && (
                    <Link to="/explore" style={{textDecoration: 'none', marginTop: '16px'}}>
                      <button className="btn btn-primary">Browse Projects</button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
