import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Briefcase, Clock, Calendar, CheckCircle, 
  MessageSquare, FolderOpen, Send, AlertTriangle, ArrowLeft, Paperclip, Check, X,
  FileText, Download, Image, Video, ExternalLink, UploadCloud, Eye, Copy, Sparkles, Folder, Layers,
  Archive, Trash2, Plus, Globe
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { apiFetch } from '../../utils/api';
import { uploadFileToCloudinary } from '../../utils/fileUpload';
import { getCleanAvatar } from '../../utils/avatarUtils';
import MediaPreviewModal from '../../components/MediaPreviewModal';
import './ActiveProjects.css';

const GithubIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function ActiveProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('All Active');
  const [isLoading, setIsLoading] = useState(true);

  // Workspace State
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [workspaceTab, setWorkspaceTab] = useState('Overview');
  const [submitModal, setSubmitModal] = useState({ show: false, milestone: null });
  const [submitText, setSubmitText] = useState('');
  
  // Shared Materials & Upload State
  const [uploadedDeliverables, setUploadedDeliverables] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewFile, setPreviewFile] = useState(null);
  const [isMediaPreviewOpen, setIsMediaPreviewOpen] = useState(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [githubForm, setGithubForm] = useState({ title: '', url: '', description: '' });

  const tabs = ['All Active', 'In Progress', 'Submitted for Review', 'Revision Requested', 'Completed'];
  const workspaceTabs = ['Overview', 'Milestones', 'Shared Materials & Files', 'Messages'];

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
        const rawClientName = clientObj.name || clientObj.companyName || '';
        const isGenericName = !rawClientName || ['client user', 'client pro', 'demo client', 'client', 'unknown client', 'client partner', 'user'].includes(rawClientName.toLowerCase());
        const clientName = !isGenericName 
          ? rawClientName 
          : (clientObj.companyName && !['client user', 'demo client'].includes(clientObj.companyName.toLowerCase()) ? clientObj.companyName : 'Sarah Jenkins');

        const rawAvatar = clientObj.avatar || clientObj.profilePhoto;
        const clientAvatar = (rawAvatar && typeof rawAvatar === 'string' && rawAvatar.startsWith('http') && !rawAvatar.includes('pravatar.cc') && !rawAvatar.includes('ui-avatars.com')) 
          ? rawAvatar 
          : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';

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

  const handleOpenWorkspace = async (projectId, tab = 'Overview') => {
    setSelectedProjectId(projectId);
    setWorkspaceTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const proj = projects.find(p => p.id === projectId || p._id === projectId);
    const realProjId = proj?.project_id?._id || (typeof proj?.project_id === 'string' ? proj?.project_id : null) || proj?._id || projectId;

    // Fetch fresh project from backend to get latest attachments
    let freshAtts = [];
    if (realProjId) {
      try {
        const freshRes = await apiFetch(`/projects/${realProjId}`);
        const freshProj = freshRes?.project || freshRes;
        if (freshProj && Array.isArray(freshProj.attachments)) {
          freshAtts = freshProj.attachments;
        }
      } catch (e) {}
    }

    const rawAtts = freshAtts.length > 0 ? freshAtts : ((proj?.project_id && Array.isArray(proj.project_id.attachments)) ? proj.project_id.attachments : (Array.isArray(proj?.attachments) ? proj.attachments : []));

    let clientAtts = rawAtts.map((att, idx) => {
      let fullUrl = '';
      let name = 'Project Asset';
      let type = '';

      if (typeof att === 'string') {
        if (att.startsWith('http://') || att.startsWith('https://')) {
          fullUrl = att;
          name = att.split('/').pop().split('?')[0];
        } else {
          fullUrl = `https://res.cloudinary.com/s5moukpf/image/upload/v1788070426/gigsphere/avatars/${att}.jpg`;
          name = `Attachment_${att.slice(0, 8)}.jpg`;
          type = 'image/jpeg';
        }
      } else if (att && typeof att === 'object') {
        fullUrl = att.url || '';
        name = att.name || (fullUrl ? fullUrl.split('/').pop() : 'Deliverable Document');
        type = att.type || '';
      }

      const isDrive = (att && att.isDrive) || (fullUrl && (fullUrl.includes('drive.google.com') || fullUrl.includes('docs.google.com') || fullUrl.includes('dropbox.com') || fullUrl.includes('onedrive')));
      const isFigma = (att && att.isFigma) || (fullUrl && (fullUrl.includes('figma.com') || fullUrl.includes('canva.com')));
      const isGithub = (att && att.isGithub) || (fullUrl && fullUrl.includes('github.com')) || (name && name.toLowerCase().includes('github'));
      const isZip = !isDrive && !isFigma && !isGithub && ((att && att.isZip) || (name && /\.(zip|rar|7z|tar|gz)$/i.test(name)) || (fullUrl && /\.(zip|rar|7z|tar|gz)/i.test(fullUrl)) || (type && type.includes('zip')));

      return {
        id: (att && (att._id || att.id)) || `att_${idx}`,
        name,
        url: fullUrl,
        type,
        isDrive,
        isFigma,
        isGithub,
        isZip,
        isLink: isDrive || isFigma || isGithub || (att && att.isLink) || fullUrl.startsWith('http'),
        size: isDrive ? 'Google Drive Folder' : (isFigma ? 'Figma Design' : (isGithub ? 'GitHub Repository' : (isZip ? 'ZIP Archive' : 'Project Asset'))),
        uploadedBy: (att && att.uploadedBy) || 'Client',
        uploadedAt: (att && att.uploadedAt) || 'Project Start'
      };
    });

    const saved = localStorage.getItem(`gigsphere_fl_deliverables_${realProjId}`) || localStorage.getItem(`gigsphere_fl_deliverables_${projectId}`);
    let localDels = [];
    if (saved) {
      try { localDels = JSON.parse(saved); } catch(e) { localDels = []; }
    }

    const combined = [...localDels];
    clientAtts.forEach(ca => {
      if (ca.url && !combined.some(d => d.url === ca.url)) {
        combined.push(ca);
      }
    });

    setUploadedDeliverables(combined);
  };

  const handleCloseWorkspace = () => {
    setSelectedProjectId(null);
  };

  const convertDeliverablesToAttachments = (dels) => {
    return dels.map(d => ({
      name: d.name,
      url: d.url,
      type: d.type || '',
      isDrive: !!d.isDrive,
      isFigma: !!d.isFigma,
      isGithub: !!d.isGithub,
      isZip: !!d.isZip,
      isLink: !!d.isLink,
      size: d.size || '',
      description: d.description || '',
      uploadedBy: d.uploadedBy || 'Freelancer',
      uploadedAt: d.uploadedAt || new Date().toLocaleDateString('en-IN')
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingFile(true);
    setUploadError('');

    try {
      const res = await uploadFileToCloudinary(file, '/api/upload/single');
      const fileUrl = res.fileUrl || res.avatarUrl || res.url;
      const isZip = file.name.endsWith('.zip') || file.name.endsWith('.rar') || file.name.endsWith('.7z') || file.type.includes('zip');
      const newFileObj = {
        id: Date.now().toString(),
        name: file.name,
        url: fileUrl,
        size: isZip ? `${(file.size / (1024 * 1024)).toFixed(2)} MB (ZIP)` : `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: file.type || (isZip ? 'application/zip' : 'document'),
        isZip,
        uploadedBy: 'Freelancer',
        uploadedAt: new Date().toLocaleDateString('en-IN')
      };

      const updated = [newFileObj, ...uploadedDeliverables];
      setUploadedDeliverables(updated);

      if (selectedProjectId) {
        const proj = projects.find(p => p.id === selectedProjectId || p._id === selectedProjectId);
        const realProjId = proj?.project_id?._id || (typeof proj?.project_id === 'string' ? proj?.project_id : null) || proj?._id || selectedProjectId;
        
        localStorage.setItem(`gigsphere_fl_deliverables_${selectedProjectId}`, JSON.stringify(updated));
        if (realProjId) {
          localStorage.setItem(`gigsphere_fl_deliverables_${realProjId}`, JSON.stringify(updated));
          const updatedAtts = convertDeliverablesToAttachments(updated);
          apiFetch(`/projects/${realProjId}`, {
            method: 'PUT',
            body: JSON.stringify({ attachments: updatedAtts })
          }).catch(err => console.error('Error syncing file to MongoDB:', err));

          setProjects(prev => prev.map(p => {
            const pId = p.id || p._id;
            if (pId === selectedProjectId) {
              if (p.project_id && typeof p.project_id === 'object') {
                return { ...p, project_id: { ...p.project_id, attachments: updatedAtts } };
              }
              return { ...p, attachments: updatedAtts };
            }
            return p;
          }));
        }
      }
    } catch (err) {
      setUploadError(err.message || 'File upload failed');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleAddGithubLink = async (e) => {
    e.preventDefault();
    if (!githubForm.url || !githubForm.title) {
      alert('Please provide resource URL and a title');
      return;
    }
    const url = githubForm.url;
    const category = githubForm.category || 'drive';
    const isDrive = category === 'drive' || url.includes('drive.google.com') || url.includes('dropbox.com') || url.includes('onedrive');
    const isFigma = category === 'figma' || url.includes('figma.com') || url.includes('canva.com');
    const isGithub = category === 'github' || url.includes('github.com') || url.includes('gitlab.com');

    const newLinkObj = {
      id: Date.now().toString(),
      name: githubForm.title,
      url: githubForm.url,
      type: category,
      linkType: category,
      isDrive,
      isFigma,
      isGithub,
      isLink: true,
      size: isDrive ? 'Google Drive Folder' : (isFigma ? 'Figma Design' : (isGithub ? 'GitHub Repository' : 'External Web Link')),
      description: githubForm.description,
      uploadedBy: 'Freelancer',
      uploadedAt: new Date().toLocaleDateString('en-IN')
    };

    const updated = [newLinkObj, ...uploadedDeliverables];
    setUploadedDeliverables(updated);

    if (selectedProjectId) {
      const proj = projects.find(p => p.id === selectedProjectId || p._id === selectedProjectId);
      const realProjId = proj?.project_id?._id || (typeof proj?.project_id === 'string' ? proj?.project_id : null) || proj?._id || selectedProjectId;

      localStorage.setItem(`gigsphere_fl_deliverables_${selectedProjectId}`, JSON.stringify(updated));
      if (realProjId) {
        localStorage.setItem(`gigsphere_fl_deliverables_${realProjId}`, JSON.stringify(updated));
        const updatedAtts = convertDeliverablesToAttachments(updated);
        apiFetch(`/projects/${realProjId}`, {
          method: 'PUT',
          body: JSON.stringify({ attachments: updatedAtts })
        }).catch(err => console.error('Error syncing link to MongoDB:', err));

        setProjects(prev => prev.map(p => {
          const pId = p.id || p._id;
          if (pId === selectedProjectId) {
            if (p.project_id && typeof p.project_id === 'object') {
              return { ...p, project_id: { ...p.project_id, attachments: updatedAtts } };
            }
            return { ...p, attachments: updatedAtts };
          }
          return p;
        }));
      }
    }
    setGithubForm({ title: '', url: '', description: '', category: 'drive' });
    setIsGithubModalOpen(false);
  };

  const handleDeleteDeliverable = (fileId) => {
    const updated = uploadedDeliverables.filter(f => f.id !== fileId);
    setUploadedDeliverables(updated);

    if (selectedProjectId) {
      const proj = projects.find(p => p.id === selectedProjectId || p._id === selectedProjectId);
      const realProjId = proj?.project_id?._id || (typeof proj?.project_id === 'string' ? proj?.project_id : null) || proj?._id || selectedProjectId;

      localStorage.setItem(`gigsphere_fl_deliverables_${selectedProjectId}`, JSON.stringify(updated));
      if (realProjId) {
        localStorage.setItem(`gigsphere_fl_deliverables_${realProjId}`, JSON.stringify(updated));
        const updatedAtts = convertDeliverablesToAttachments(updated);
        apiFetch(`/projects/${realProjId}`, {
          method: 'PUT',
          body: JSON.stringify({ attachments: updatedAtts })
        }).catch(err => console.error('Error syncing deletion to MongoDB:', err));

        setProjects(prev => prev.map(p => {
          const pId = p.id || p._id;
          if (pId === selectedProjectId) {
            if (p.project_id && typeof p.project_id === 'object') {
              return { ...p, project_id: { ...p.project_id, attachments: updatedAtts } };
            }
            return { ...p, attachments: updatedAtts };
          }
          return p;
        }));
      }
    }
  };

  const handleSubmitWork = async () => {
    if (!submitModal.milestone) return;

    try {
      const contractId = selectedProject._id || selectedProject.id;
      const milestoneId = submitModal.milestone._id || submitModal.milestone.id;

      await apiFetch(`/contracts/${contractId}/milestones/${milestoneId}/submit`, {
        method: 'PUT',
        body: JSON.stringify({ message: submitText })
      });

      alert('Work submitted for review successfully!');
      setSubmitModal({ show: false, milestone: null });
      setSubmitText('');
      fetchActiveContracts();
    } catch (error) {
      alert(error.message || 'Failed to submit work');
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

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

              {workspaceTab === 'Shared Materials & Files' && (
                <div className="shared-materials-tab">
                  {/* 1. Client Project Specifications & Brief */}
                  <div className="materials-section-card">
                    <div className="materials-section-header">
                      <div className="materials-sec-title-wrap">
                        <FileText size={20} color="#1a73e8" />
                        <div>
                          <h3 className="materials-section-title">Client Project Specifications & Scope</h3>
                          <span className="materials-section-subtitle">Requirements provided by {selectedProject.clientName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="project-brief-content">
                      <p className="project-scope-desc">
                        {selectedProject.project_id?.description || selectedProject.description || 'Full specifications established in initial project scope.'}
                      </p>

                      {Array.isArray(selectedProject.project_id?.skills || selectedProject.skills) && (selectedProject.project_id?.skills || selectedProject.skills).length > 0 && (
                        <div className="project-scope-skills">
                          <span className="scope-skills-label">Required Tech Stack:</span>
                          <div className="scope-skills-tags">
                            {(selectedProject.project_id?.skills || selectedProject.skills).map((sk, idx) => (
                              <span key={idx} className="scope-skill-badge">{sk}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Client Shared Attachments (PDFs, Images, Wireframes) */}
                  <div className="materials-section-card mt-24">
                    <div className="materials-section-header">
                      <div className="materials-sec-title-wrap">
                        <FolderOpen size={20} color="#10b981" />
                        <div>
                          <h3 className="materials-section-title">Client Shared Project Materials</h3>
                          <span className="materials-section-subtitle">PDFs, images, design assets, and documentation shared for this project</span>
                        </div>
                      </div>
                    </div>

                    {(() => {
                      const rawAttachments = selectedProject.project_id?.attachments || selectedProject.attachments || [];
                      const clientFiles = (Array.isArray(rawAttachments) ? rawAttachments : [rawAttachments])
                        .filter(Boolean)
                        .map((att, idx) => {
                          if (typeof att === 'string') {
                            const isImg = att.match(/\.(jpg|jpeg|png|webp|gif|svg)/i) || att.includes('image/upload');
                            const isPdf = att.match(/\.pdf/i) || att.includes('pdf');
                            const isVideo = att.match(/\.(mp4|webm|ogg|mov)/i) || att.includes('video/upload');
                            const isZip = att.match(/\.(zip|rar|7z|tar|gz)/i) || att.includes('archives');
                            const isGithub = att.includes('github.com');
                            const fileName = att.split('/').pop().split('?')[0] || (isGithub ? 'GitHub Repository' : `Project_Material_${idx + 1}`);
                            return { id: `att-${idx}`, name: decodeURIComponent(fileName), url: att, isImg, isPdf, isVideo, isZip, isGithub, isLink: isGithub, size: isGithub ? 'GitHub Repo' : (isZip ? 'ZIP Archive' : 'Shared Material') };
                          }
                          const url = att.url || att.fileUrl || att.secure_url || '#';
                          const name = att.name || att.filename || att.title || `Shared_Document_${idx + 1}`;
                          const isGithub = att.isGithub || (url && url.includes('github.com')) || (name && name.toLowerCase().includes('github'));
                          const isZip = att.isZip || (name && /\.(zip|rar|7z|tar|gz)$/i.test(name)) || (url && /\.(zip|rar|7z|tar|gz)/i.test(url)) || (att.type && att.type.includes('zip'));
                          return {
                            id: att._id || att.id || `att-${idx}`,
                            name,
                            url,
                            type: att.type,
                            isGithub,
                            isZip,
                            isImg: !isGithub && !isZip && ((att.type && att.type.startsWith('image/')) || (url && url.match(/\.(jpg|jpeg|png|webp|gif|svg)/i))),
                            isPdf: !isGithub && !isZip && ((att.type && att.type.includes('pdf')) || (url && url.includes('.pdf'))),
                            isVideo: !isGithub && !isZip && ((att.type && att.type.startsWith('video/')) || (url && url.match(/\.(mp4|webm|ogg|mov)/i))),
                            size: att.size ? (typeof att.size === 'number' ? `${(att.size / 1024).toFixed(0)} KB` : att.size) : (isGithub ? 'GitHub Repo' : (isZip ? 'ZIP Archive' : 'Shared Material'))
                          };
                        });

                      if (clientFiles.length === 0) {
                        return (
                          <div className="empty-materials-box">
                            <FileText size={36} color="#94a3b8" />
                            <p className="empty-mat-title">No standalone attachments uploaded yet</p>
                            <span className="empty-mat-desc">The client provided all core requirements in the Project Scope Brief above. If additional design or asset files are needed, you can request them in Chat.</span>
                          </div>
                        );
                      }

                      return (
                        <div className="materials-files-grid">
                          {clientFiles.map(file => (
                            <div key={file.id} className="mat-file-card">
                              <div className="mat-file-icon-box">
                                {file.isGithub ? (
                                  <GithubIcon size={24} color="#0f172a" />
                                ) : file.isZip ? (
                                  <Archive size={24} color="#d97706" />
                                ) : file.isImg ? (
                                  <Image size={24} color="#3b82f6" />
                                ) : file.isPdf ? (
                                  <FileText size={24} color="#ef4444" />
                                ) : file.isVideo ? (
                                  <Video size={24} color="#8b5cf6" />
                                ) : (
                                  <Folder size={24} color="#10b981" />
                                )}
                              </div>

                              <div className="mat-file-meta">
                                <h4 className="mat-file-name" title={file.name}>{file.name}</h4>
                                <span className="mat-file-size">{file.size}</span>
                              </div>

                              <div className="mat-file-actions">
                                <button
                                  type="button"
                                  className="mat-btn-preview"
                                  onClick={() => {
                                    setPreviewFile(file);
                                    setIsMediaPreviewOpen(true);
                                  }}
                                  title="Preview In-App"
                                >
                                  <Eye size={15} /> Preview In-App
                                </button>
                                {file.isGithub ? (
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mat-btn-download"
                                    style={{ background: '#24292f', color: '#ffffff' }}
                                    title="Open on GitHub"
                                  >
                                    <ExternalLink size={15} /> GitHub
                                  </a>
                                ) : (
                                  <a
                                    href={file.url}
                                    download={file.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mat-btn-download"
                                    title="Download File"
                                  >
                                    <Download size={15} /> {file.isZip ? 'ZIP' : 'Download'}
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* 3. Freelancer Deliverables & Submission Vault */}
                  <div className="materials-section-card mt-24">
                    <div className="materials-section-header">
                      <div className="materials-sec-title-wrap">
                        <UploadCloud size={20} color="#8b5cf6" />
                        <div>
                          <h3 className="materials-section-title">Freelancer Deliverables & Upload Vault</h3>
                          <span className="materials-section-subtitle">Upload milestone assets, ZIP archives, or share Google Drive, Figma & GitHub links</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="github-share-btn"
                          onClick={() => setIsGithubModalOpen(true)}
                        >
                          <ExternalLink size={16} /> Share Link / Drive
                        </button>

                        <label className={`upload-deliverable-btn ${isUploadingFile ? 'disabled' : ''}`}>
                          <UploadCloud size={16} />
                          {isUploadingFile ? 'Uploading...' : 'Upload File / ZIP'}
                          <input
                            type="file"
                            accept=".zip,.rar,.7z,.tar,.gz,image/*,application/pdf,video/*"
                            onChange={handleFileUpload}
                            disabled={isUploadingFile}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                    </div>

                    {uploadError && (
                      <div className="mat-upload-error">
                        <AlertTriangle size={16} />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {uploadedDeliverables.length === 0 ? (
                      <div className="empty-materials-box">
                        <UploadCloud size={36} color="#94a3b8" />
                        <p className="empty-mat-title">No deliverables uploaded yet</p>
                        <span className="empty-mat-desc">Use the "Upload File / ZIP" or "Share GitHub Repo" button above to share code bundles, archives, or repositories with the client.</span>
                      </div>
                    ) : (
                      <div className="materials-files-grid">
                        {uploadedDeliverables.map(file => (
                          <div key={file.id} className="mat-file-card">
                            <div className="mat-file-icon-box">
                              {file.isGithub ? (
                                <GithubIcon size={24} color="#0f172a" />
                              ) : file.isZip || file.name?.endsWith('.zip') || file.type?.includes('zip') ? (
                                <Archive size={24} color="#d97706" />
                              ) : file.type?.startsWith('image/') ? (
                                <Image size={24} color="#3b82f6" />
                              ) : file.type?.includes('pdf') ? (
                                <FileText size={24} color="#ef4444" />
                              ) : file.type?.startsWith('video/') ? (
                                <Video size={24} color="#8b5cf6" />
                              ) : (
                                <Folder size={24} color="#8b5cf6" />
                              )}
                            </div>

                            <div className="mat-file-meta">
                              <h4 className="mat-file-name" title={file.name}>{file.name}</h4>
                              <span className="mat-file-size">{file.size} • Uploaded {file.uploadedAt}</span>
                            </div>

                            <div className="mat-file-actions">
                              <button
                                type="button"
                                className="mat-btn-preview"
                                onClick={() => {
                                  setPreviewFile(file);
                                  setIsMediaPreviewOpen(true);
                                }}
                                title="Preview In-App"
                              >
                                <Eye size={15} /> Preview In-App
                              </button>
                              {file.isGithub ? (
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mat-btn-download"
                                  style={{ background: '#24292f', color: '#ffffff' }}
                                  title="Open Repository on GitHub"
                                >
                                  <ExternalLink size={15} /> GitHub
                                </a>
                              ) : (
                                <a
                                  href={file.url}
                                  download={file.name}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mat-btn-download"
                                  title="Download File"
                                >
                                  <Download size={15} /> {file.isZip ? 'ZIP' : 'Download'}
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteDeliverable(file.id)}
                                className="mat-btn-delete"
                                title="Remove Deliverable"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {workspaceTab === 'Messages' && (
                <div className="messages-tab">
                  <div className="empty-state" style={{padding: '40px 20px'}}>
                    <MessageSquare className="empty-icon" size={48} />
                    <h3 className="empty-title">Project Direct Chat</h3>
                    <p className="empty-desc">Collaborate and discuss deliverables in real-time with {selectedProject.clientName}.</p>
                    <button
                      className="btn btn-primary mt-16"
                      onClick={() => navigate(`/freelancer/dashboard/chat?partnerId=${selectedProject.client_id?._id || selectedProject.client_id}`)}
                    >
                      <MessageSquare size={16} /> Open Workspace Chat with {selectedProject.clientName}
                    </button>
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

      {/* Freelancer Share Link / Drive Modal */}
      {isGithubModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }} onClick={() => setIsGithubModalOpen(false)}>
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', maxWidth: '520px', width: '100%', padding: '1.75rem', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ExternalLink size={20} color="#0f172a" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Share External Link / Drive</h3>
                  <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.8rem' }}>Share Google Drive, Figma design, GitHub repo, or web links</p>
                </div>
              </div>
              <button onClick={() => setIsGithubModalOpen(false)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddGithubLink} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.5rem' }}>Resource Type / Platform *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'drive', label: 'Google Drive', icon: <Folder size={18} /> },
                    { id: 'figma', label: 'Figma', icon: <Layers size={18} /> },
                    { id: 'github', label: 'GitHub', icon: <GithubIcon size={18} /> },
                    { id: 'link', label: 'Web Link', icon: <Globe size={18} /> }
                  ].map(cat => {
                    const isSelected = (githubForm.category || 'drive') === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setGithubForm({ ...githubForm, category: cat.id })}
                        style={{
                          padding: '0.65rem 0.4rem',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #8b5cf6' : '1px solid #e2e8f0',
                          background: isSelected ? '#f5f3ff' : '#f8fafc',
                          color: isSelected ? '#6d28d9' : '#475569',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {cat.icon}
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                  {githubForm.category === 'figma' ? 'Figma Design URL *' : 
                   githubForm.category === 'github' ? 'GitHub Repository URL *' : 
                   githubForm.category === 'link' ? 'Web Link URL *' : 'Google Drive / Storage URL *'}
                </label>
                <input 
                  type="url" 
                  placeholder={
                    githubForm.category === 'figma' ? 'https://www.figma.com/file/...' : 
                    githubForm.category === 'github' ? 'https://github.com/your-username/repo' : 
                    githubForm.category === 'link' ? 'https://example.com/demo' : 'https://drive.google.com/drive/folders/...'
                  }
                  value={githubForm.url} 
                  onChange={(e) => setGithubForm({ ...githubForm, url: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Deliverable Title / Display Name *</label>
                <input 
                  type="text" 
                  placeholder={
                    githubForm.category === 'figma' ? 'e.g. Final UI/UX Prototypes & Figma File' : 
                    githubForm.category === 'github' ? 'e.g. Complete Source Code & API Integration' : 
                    githubForm.category === 'link' ? 'e.g. Live Staging Preview App' : 'e.g. Project Assets, Raw Exports & Videos'
                  }
                  value={githubForm.title} 
                  onChange={(e) => setGithubForm({ ...githubForm, title: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                  required 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Notes / Instructions (Optional)</label>
                <textarea 
                  rows={3}
                  placeholder="e.g. Shared full edit access. Added setup guide in folder."
                  value={githubForm.description} 
                  onChange={(e) => setGithubForm({ ...githubForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsGithubModalOpen(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: '40px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.65rem 1.5rem', borderRadius: '40px', background: '#8b5cf6', border: 'none', color: '#ffffff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <ExternalLink size={15} /> Attach Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Feature Media Preview Modal (PDFs with Canvas Viewer, Videos, Images, Docs, GitHub, ZIP) */}
      <MediaPreviewModal
        isOpen={isMediaPreviewOpen}
        onClose={() => setIsMediaPreviewOpen(false)}
        file={previewFile}
      />
    </div>
  );
}
