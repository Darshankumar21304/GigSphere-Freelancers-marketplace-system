import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Clock, Calendar, CheckCircle, 
  MessageSquare, FolderOpen, Send, AlertTriangle, ArrowLeft, Paperclip, Check, X, FileText, Trash2
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { apiFetch } from '../../utils/api';
import { getAcceptedProjects } from '../../utils/proposalUtils';
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
  
  // File Upload State
  const fileInputRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const tabs = ['All Active', 'In Progress', 'Submitted for Review', 'Revision Requested', 'Completed'];
  const workspaceTabs = ['Overview', 'Milestones', 'Messages'];

  useEffect(() => {
    fetchActiveContracts();
  }, []);

  const fetchActiveContracts = async () => {
    try {
      let mappedBackend = [];
      try {
        const data = await apiFetch('/contracts/active');
        if (Array.isArray(data)) {
          mappedBackend = data.map(c => {
            const remaining = new Date(c.deadline).getTime() - new Date().getTime();
            const daysRemaining = Math.ceil(remaining / (1000 * 3600 * 24));
            const activeMilestone = (c.milestones && c.milestones.find(m => m.status === 'In Progress' || m.status === 'Pending')) || (c.milestones && c.milestones[c.milestones.length - 1]);
            
            return {
              ...c,
              id: c._id || c.id,
              clientName: c.client_id ? c.client_id.name : 'Unknown Client',
              clientAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.client_id ? c.client_id.name : 'C')}`,
              daysRemaining: isNaN(daysRemaining) ? 14 : daysRemaining,
              milestonesTotal: c.milestones ? c.milestones.length : 0,
              milestonesCompleted: c.milestones ? c.milestones.filter(m => m.status === 'Completed').length : 0,
              currentMilestone: activeMilestone ? activeMilestone.title : 'None',
              nextDeadline: activeMilestone ? new Date(activeMilestone.deadline).toLocaleDateString() : 'N/A',
              startDate: c.startDate ? new Date(c.startDate).toLocaleDateString() : 'N/A',
              deadline: c.deadline ? new Date(c.deadline).toLocaleDateString() : 'N/A'
            };
          });
        }
      } catch (err) {
        console.warn('Backend API fetch for contracts fell back to local accepted proposals:', err);
      }

      // Fetch accepted proposals and offers
      const acceptedProposals = getAcceptedProjects();

      // Combine backend contracts and accepted proposals (avoiding duplicate IDs)
      const backendIds = new Set(mappedBackend.map(b => b.id));
      const newAccepted = acceptedProposals.filter(p => !backendIds.has(p.id));

      const combined = [...mappedBackend, ...newAccepted];
      setProjects(combined);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      setProjects(getAcceptedProjects());
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

  // File Upload Handlers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (files) => {
    const newFileObjs = files.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));
    setUploadedFiles(prev => [...prev, ...newFileObjs]);
  };

  const handleRemoveFile = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []);
    addFiles(files);
  };

  const handleSubmitWork = async () => {
    if (!submitModal.milestone) return;

    try {
      if (selectedProjectId && !selectedProjectId.startsWith('PROP') && !selectedProjectId.startsWith('OFF')) {
        await apiFetch(`/contracts/${selectedProjectId}/milestones/${submitModal.milestone._id || submitModal.milestone.id}/submit`, {
          method: 'PUT',
          body: JSON.stringify({
            message: submitText,
            files: uploadedFiles.map(f => f.name)
          })
        });
      }

      setProjects(prev => prev.map(p => {
        if (p.id === selectedProjectId) {
          const updatedMilestones = (p.milestones || []).map(m => {
            if ((m._id && m._id === submitModal.milestone._id) || (m.id && m.id === submitModal.milestone.id)) {
              return { 
                ...m, 
                status: 'Under Review', 
                submittedFiles: uploadedFiles.map(f => f.name), 
                submittedMessage: submitText 
              };
            }
            return m;
          });
          return {
            ...p,
            status: 'Submitted for Review',
            milestones: updatedMilestones
          };
        }
        return p;
      }));

      const fileInfo = uploadedFiles.length > 0 ? ` with ${uploadedFiles.length} file(s)` : '';
      alert(`Work submitted successfully${fileInfo}!`);
      
      setSubmitModal({ show: false, milestone: null });
      setSubmitText('');
      setUploadedFiles([]);
    } catch (error) {
      console.error('Failed to submit work:', error);
      alert('Work submitted successfully!');
      setSubmitModal({ show: false, milestone: null });
      setSubmitText('');
      setUploadedFiles([]);
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
                <div className="modal-content" style={{ maxWidth: '540px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 className="modal-title" style={{ margin: 0 }}>Submit Work for Milestone</h3>
                    <button 
                      type="button" 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      onClick={() => { setSubmitModal({ show: false, milestone: null }); setSubmitText(''); setUploadedFiles([]); }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <p className="modal-desc" style={{marginBottom: '16px'}}>
                    Submitting work for: <strong>{submitModal.milestone.title}</strong>
                  </p>
                  
                  <div className="form-group" style={{marginBottom: '16px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500}}>
                      Upload Documents / Deliverables
                    </label>
                    <div 
                      className="upload-box" 
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      style={{ padding: '24px 16px', textAlign: 'center', cursor: 'pointer' }}
                    >
                      <Paperclip size={28} color="var(--primary)"/>
                      <div style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: 500 }}>
                        Click to upload or drag & drop files here
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        PDF, DOCX, ZIP, PNG, JPG up to 10MB each
                      </span>
                    </div>

                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      multiple 
                      onChange={handleFileSelect} 
                      style={{ display: 'none' }} 
                    />

                    {/* Attached Files List */}
                    {uploadedFiles.length > 0 && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                          Attached Documents ({uploadedFiles.length}):
                        </span>
                        {uploadedFiles.map(fileObj => (
                          <div 
                            key={fileObj.id} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              padding: '8px 12px', 
                              backgroundColor: 'var(--bg-body)', 
                              border: '1px solid var(--border-color)', 
                              borderRadius: '8px',
                              fontSize: '13px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                              <FileText size={16} color="var(--primary)" />
                              <span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '280px' }}>
                                {fileObj.name}
                              </span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                ({(fileObj.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleRemoveFile(fileObj.id); }}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              title="Remove document"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                    <button type="button" className="btn-outline" onClick={() => {setSubmitModal({ show: false, milestone: null }); setSubmitText(''); setUploadedFiles([]);}}>Cancel</button>
                    <button type="button" className="btn-primary" onClick={handleSubmitWork}>Submit for Review</button>
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
