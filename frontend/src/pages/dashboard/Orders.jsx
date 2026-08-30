import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, List, Grid, MoreVertical, Plus, 
  ChevronRight, ChevronLeft, Calendar, Clock, CreditCard, LayoutTemplate, MessageSquare, Briefcase, FileText, Edit, X, Save,
  Shield, Upload, FileCheck, CheckCircle2, MessageCircle, DollarSign, Download, Paperclip, Lock, UserCheck, Trash2
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../utils/api';
import { uploadFileToCloudinary } from '../../utils/fileUpload';
import MediaPreviewModal from '../../components/MediaPreviewModal';
import './Orders.css';

export default function Orders() {
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('All Projects');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);
  
  // Media Preview Modal State
  const [previewFile, setPreviewFile] = useState(null);
  const [isMediaPreviewOpen, setIsMediaPreviewOpen] = useState(false);
  
  // Edit Project Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Workspace State
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [workspaceTab, setWorkspaceTab] = useState('overview');
  const [workspaceNotes, setWorkspaceNotes] = useState('');
  const [workspaceNotesSaved, setWorkspaceNotesSaved] = useState(false);
  const [workspaceFiles, setWorkspaceFiles] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [workspaceMilestones, setWorkspaceMilestones] = useState([
    { id: 1, title: 'Project Initialization & Architecture', amount: 500, status: 'Paid', dueDate: 'Sep 05, 2026' },
    { id: 2, title: 'Core Functionality & Integration', amount: 1200, status: 'In Progress', dueDate: 'Sep 15, 2026' },
    { id: 3, title: 'Final QA, Deployment & Handoff', amount: 800, status: 'Pending', dueDate: 'Sep 25, 2026' }
  ]);

  const navigate = useNavigate();

  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedProjectForMilestone, setSelectedProjectForMilestone] = useState(null);
  const [newMilestone, setNewMilestone] = useState({ title: '', amount: '', date: '' });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const tabs = ['All Projects', 'Draft', 'Open', 'In Progress', 'Completed', 'Closed'];

  const [activeContract, setActiveContract] = useState(null);
  const [isLoadingWorkspaceData, setIsLoadingWorkspaceData] = useState(false);

  useEffect(() => {
    const fetchWorkspaceContract = async () => {
      if (!activeWorkspace) {
        setActiveContract(null);
        return;
      }
      setIsLoadingWorkspaceData(true);
      try {
        const contracts = await apiFetch('/contracts/active').catch(() => []);
        const projId = activeWorkspace.id || activeWorkspace._id;
        const matched = contracts.find(c => {
          const cProjId = c.project_id?._id || c.project_id || '';
          return cProjId.toString() === projId.toString();
        });

        if (matched) {
          setActiveContract(matched);
          const formatted = (matched.milestones || []).map((m, idx) => ({
            id: m._id || m.id || idx,
            title: m.title,
            amount: m.amount,
            status: m.status === 'Completed' ? 'Paid' : m.status,
            dueDate: new Date(m.deadline).toLocaleDateString('en-US', { month: 'short', day: '0-digit', year: 'numeric' })
          }));
          setWorkspaceMilestones(formatted);
        } else {
          setActiveContract(null);
          setWorkspaceMilestones([]);
        }
      } catch (err) {
        console.error('Failed to load workspace contract:', err);
        setActiveContract(null);
        setWorkspaceMilestones([]);
      } finally {
        setIsLoadingWorkspaceData(false);
      }
    };
    fetchWorkspaceContract();
  }, [activeWorkspace]);

  const handleReleaseEscrow = async (milestoneId, amount) => {
    try {
      const res = await apiFetch(`/contracts/${activeContract._id}/milestones/${milestoneId}/approve`, {
        method: 'PUT'
      });
      if (res && res.success) {
        setWorkspaceMilestones(prev => prev.map(item => item.id === milestoneId ? { ...item, status: 'Paid' } : item));
        alert(`Payment of ${formatINR(amount)} released successfully to freelancer!`);
      }
    } catch (err) {
      alert(err.message || 'Error releasing escrow payment');
    }
  };

  const handleFundEscrow = async (milestoneId, amount) => {
    try {
      const res = await apiFetch(`/contracts/${activeContract._id}/milestones/${milestoneId}/fund`, {
        method: 'PUT'
      });
      if (res && res.success) {
        setWorkspaceMilestones(prev => prev.map(item => item.id === milestoneId ? { ...item, status: 'In Progress' } : item));
        alert(`Escrow of ${formatINR(amount)} funded successfully!`);
      }
    } catch (err) {
      alert(err.message || 'Error funding escrow milestone');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await apiFetch('/projects').catch(() => []);
      if (Array.isArray(data)) {
        setProjects(data.map(p => ({
          ...p,
          id: p._id || p.id,
          status: p.status || 'Open',
          proposals: p.proposals ? p.proposals.length : 0,
          postedDate: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'
        })));
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const formatDeadline = (deadline, duration) => {
    const val = deadline || duration;
    if (!val) return 'Not set';
    if (typeof val === 'string' && (val.includes('-') || val.includes('/'))) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
    return val;
  };

  const handleActionClick = async (action, project, e) => {
    if (e) e.stopPropagation();
    setMenuOpen(null);
    const projId = project.id || project._id;

    if (action === 'View Proposals') {
      navigate('/client/dashboard/proposals');
    } else if (action === 'Edit') {
      setEditingProject({
        id: projId,
        title: project.title || '',
        category: project.category || 'Web Development',
        budget: project.budget || '',
        deadline: project.deadline || '',
        description: project.description || ''
      });
      setIsEditModalOpen(true);
    } else if (action === 'Pause') {
      try {
        await apiFetch(`/projects/${projId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Paused' }) });
        setProjects(prev => prev.map(p => (p.id === projId || p._id === projId) ? { ...p, status: 'Paused' } : p));
      } catch (err) { alert('Failed to pause project'); }
    } else if (action === 'Resume') {
      try {
        await apiFetch(`/projects/${projId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Open' }) });
        setProjects(prev => prev.map(p => (p.id === projId || p._id === projId) ? { ...p, status: 'Open' } : p));
      } catch (err) { alert('Failed to resume project'); }
    } else if (action === 'Close') {
      try {
        await apiFetch(`/projects/${projId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'Closed' }) });
        setProjects(prev => prev.map(p => (p.id === projId || p._id === projId) ? { ...p, status: 'Closed' } : p));
      } catch (err) { alert('Failed to close project'); }
    } else if (action === 'Delete') {
      if (window.confirm(`Are you sure you want to delete '${project.title}'?`)) {
        try {
          await apiFetch(`/projects/${projId}`, { method: 'DELETE' });
          setProjects(prev => prev.filter(p => (p.id !== projId && p._id !== projId)));
        } catch (err) { alert('Failed to delete project'); }
      }
    } else if (action === 'Milestones') {
      setSelectedProjectForMilestone(project);
      setIsMilestoneModalOpen(true);
    } else if (action === 'Messages') {
      navigate('/client/dashboard/chat');
    } else if (action === 'Workspace') {
      setActiveWorkspace(project);
      setWorkspaceTab('overview');
      if (project.attachments && Array.isArray(project.attachments)) {
        setWorkspaceFiles(project.attachments.map(att => {
          let fullUrl = '';
          let name = 'Project Deliverable';
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

          return {
            name,
            url: fullUrl,
            type,
            size: 'Project Deliverable'
          };
        }));
      }
    }
  };

  const handleSaveEditProject = async (e) => {
    e.preventDefault();
    if (!editingProject) return;

    setIsSavingEdit(true);
    try {
      await apiFetch(`/projects/${editingProject.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editingProject.title,
          budget: editingProject.budget,
          category: editingProject.category,
          deadline: editingProject.deadline,
          description: editingProject.description
        })
      });

      setProjects(prev => prev.map(p => (p.id === editingProject.id || p._id === editingProject.id) ? { ...p, ...editingProject } : p));
      setIsEditModalOpen(false);
      setEditingProject(null);
    } catch (err) {
      alert('Failed to update project details');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleUploadWorkspaceFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const res = await uploadFileToCloudinary(file, '/api/upload/single');
      const fileUrl = res.url || res.secure_url;
      const newFileObj = {
        name: file.name,
        url: fileUrl,
        type: file.type,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setWorkspaceFiles(prev => [...prev, newFileObj]);

      if (activeWorkspace) {
        const projId = activeWorkspace.id || activeWorkspace._id;
        const currentAtts = activeWorkspace.attachments || [];
        const updatedAtts = [...currentAtts, { name: file.name, url: fileUrl, type: file.type }];
        await apiFetch(`/projects/${projId}`, {
          method: 'PUT',
          body: JSON.stringify({ attachments: updatedAtts })
        });
      }
    } catch (err) {
      alert('Failed to upload deliverable: ' + err.message);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleDeleteWorkspaceFile = async (fileIndex) => {
    const updatedFiles = workspaceFiles.filter((_, i) => i !== fileIndex);
    setWorkspaceFiles(updatedFiles);

    if (activeWorkspace) {
      const projId = activeWorkspace.id || activeWorkspace._id;
      const updatedAtts = updatedFiles.map(f => ({ name: f.name, url: f.url, type: f.type }));
      try {
        await apiFetch(`/projects/${projId}`, {
          method: 'PUT',
          body: JSON.stringify({ attachments: updatedAtts })
        });
      } catch (err) {
        console.error('Failed to sync deleted attachment:', err);
      }
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesTab = activeTab === 'All Projects' || p.status === activeTab;
    const matchesSearch = p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const StatusBadge = ({ status }) => {
    const statusClass = (status || 'Open').replace(/\s+/g, '-').toLowerCase();
    return (
      <span className={`client-projects-status client-projects-status-${statusClass}`}>
        {status || 'Open'}
      </span>
    );
  };

  const getActions = (status) => {
    switch (status) {
      case 'Draft': return ['Edit', 'Publish', 'Delete'];
      case 'Open': return ['View Proposals', 'Edit', 'Pause', 'Close', 'Delete'];
      case 'Paused': return ['View Proposals', 'Edit', 'Resume', 'Close', 'Delete'];
      case 'In Progress': return ['Workspace', 'Messages', 'Milestones', 'Edit', 'Delete'];
      case 'Completed': return ['View Details', 'Invoice', 'Review Freelancer', 'Delete'];
      default: return ['View Details', 'Edit', 'Delete'];
    }
  };

  // FULLY FEATURED RICH WORKSPACE VIEW
  if (activeWorkspace) {
    return (
      <div className="client-projects-page" style={{ animation: 'fadeIn 0.3s ease' }}>
        {/* Workspace Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <button 
              onClick={() => setActiveWorkspace(null)}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '6px 14px', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginBottom: '12px', fontWeight: 700, fontSize: '0.8rem' }}
            >
              <ChevronLeft size={14} /> Back to My Projects
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{activeWorkspace.title}</h1>
              <StatusBadge status={activeWorkspace.status} />
              {activeWorkspace.category && (
                <span style={{ fontSize: '11px', fontWeight: 700, background: '#e8f0fe', color: '#1a73e8', padding: '4px 12px', borderRadius: '20px' }}>
                  {activeWorkspace.category}
                </span>
              )}
            </div>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.875rem' }}>GigSphere Project Workspace & Deliverable Control Hub</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => navigate('/client/dashboard/chat')}
              style={{ padding: '9px 18px', background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '30px', color: '#0f172a', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <MessageCircle size={16} color="#1a73e8" /> Open Chat
            </button>
            <button 
              onClick={() => navigate('/client/dashboard/proposals')}
              style={{ padding: '9px 18px', background: '#1a73e8', border: 'none', borderRadius: '30px', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <UserCheck size={16} /> View Proposals ({activeWorkspace.proposals || 0})
            </button>
          </div>
        </div>

        {/* 4-Stat Workspace KPI Summary Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 18px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Project Budget</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>{formatINR(activeWorkspace.budget || 0)}</span>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 18px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Escrow Protection</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1a73e8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={14} color="#1a73e8" /> 100% Protected
            </span>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 18px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Target Deadline</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>{formatDeadline(activeWorkspace.deadline, activeWorkspace.duration)}</span>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 18px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Posted Date</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>{activeWorkspace.postedDate || 'Today'}</span>
          </div>
        </div>

        {/* Workspace Nav Pills */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '10px', marginBottom: '24px' }}>
          {[
            { id: 'overview', label: '📌 Project Overview' },
            { id: 'milestones', label: '🎯 Milestones & Escrow' },
            { id: 'files', label: '📁 Shared Deliverables & Assets' },
            { id: 'timeline', label: '📜 Activity Timeline' }
          ].map(t => (
            <button 
              key={t.id}
              onClick={() => setWorkspaceTab(t.id)}
              style={{
                padding: '9px 18px',
                borderRadius: '30px',
                border: 'none',
                background: workspaceTab === t.id ? '#1a73e8' : '#f8fafc',
                color: workspaceTab === t.id ? '#ffffff' : '#475569',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {workspaceTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Project Summary & Requirements</h3>
                <p style={{ color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-line', margin: 0 }}>{activeWorkspace.description}</p>

                {activeWorkspace.skills && activeWorkspace.skills.length > 0 && (
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Required Skills & Expertise</h4>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {activeWorkspace.skills.map(sk => (
                        <span key={sk} style={{ fontSize: '12px', fontWeight: 700, background: '#e8f0fe', color: '#1a73e8', border: '1px solid #bfdbfe', padding: '4px 12px', borderRadius: '14px' }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Client Notes Section */}
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>Client Workspace Notes</h3>
                  {workspaceNotesSaved && <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 700 }}>Saved!</span>}
                </div>
                <textarea 
                  rows={4}
                  placeholder="Keep private notes, credentials checklist, or project updates for your team here..."
                  value={workspaceNotes}
                  onChange={(e) => { setWorkspaceNotes(e.target.value); setWorkspaceNotesSaved(false); }}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                />
                <button 
                  onClick={() => setWorkspaceNotesSaved(true)}
                  style={{ marginTop: '10px', padding: '8px 18px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '30px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Save Notes
                </button>
              </div>
            </div>

            {/* Sidebar Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Escrow Payment Vault</h4>
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Total Funded:</span>
                    <span style={{ fontWeight: 800, color: '#10b981' }}>{formatINR(activeWorkspace.budget || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Released to Date:</span>
                    <span style={{ fontWeight: 800, color: '#1a73e8' }}>{formatINR(500)}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setWorkspaceTab('milestones')}
                  style={{ width: '100%', padding: '9px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '30px', color: '#0f172a', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Manage Payments & Milestones
                </button>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Quick Workspace Actions</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => { setSelectedProjectForMilestone(activeWorkspace); setIsMilestoneModalOpen(true); }} style={{ padding: '8px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', textAlign: 'left', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', color: '#0f172a' }}>+ Create New Milestone</button>
                  <button onClick={() => setWorkspaceTab('files')} style={{ padding: '8px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', textAlign: 'left', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', color: '#0f172a' }}>📁 Upload Deliverable Attachment</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MILESTONES & ESCROW */}
        {workspaceTab === 'milestones' && (
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Project Milestones & Payment Escrow</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Escrow funds are held safely by GigSphere and only released upon your final approval.</p>
              </div>
              <button 
                onClick={() => { setSelectedProjectForMilestone(activeWorkspace); setIsMilestoneModalOpen(true); }}
                style={{ padding: '8px 18px', background: '#1a73e8', color: '#ffffff', border: 'none', borderRadius: '30px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Add Milestone
              </button>
            </div>

             {workspaceMilestones.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', marginTop: '10px' }}>
                <Briefcase size={36} color="#94a3b8" style={{ marginBottom: '12px', display: 'inline-block' }} />
                <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>No Active Contract / Hired Freelancer</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.4' }}>
                  No freelancer has been assigned to this project yet. Go to the <strong>Proposals</strong> tab of this project to review bids and hire a freelancer to start tracking escrow milestones!
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid #cbd5e1', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px' }}>Milestone Phase</th>
                      <th style={{ padding: '12px' }}>Due Date</th>
                      <th style={{ padding: '12px' }}>Amount</th>
                      <th style={{ padding: '12px' }}>Escrow Status</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workspaceMilestones.map(m => (
                      <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 12px', fontWeight: 700, color: '#0f172a' }}>{m.title}</td>
                        <td style={{ padding: '14px 12px', color: '#475569', fontSize: '0.85rem' }}>{m.dueDate}</td>
                        <td style={{ padding: '14px 12px', fontWeight: 800, color: '#10b981' }}>{formatINR(m.amount)}</td>
                        <td style={{ padding: '14px 12px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: m.status === 'Paid' ? '#dcfce7' : m.status === 'In Progress' ? '#e8f0fe' : '#f1f5f9', color: m.status === 'Paid' ? '#15803d' : m.status === 'In Progress' ? '#1a73e8' : '#64748b' }}>
                            {m.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                          {m.status === 'In Progress' ? (
                            <button 
                              onClick={() => handleReleaseEscrow(m.id, m.amount)}
                              style={{ padding: '6px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Release Escrow
                            </button>
                          ) : m.status === 'Paid' ? (
                            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>✓ Released</span>
                          ) : (
                            <button 
                              onClick={() => handleFundEscrow(m.id, m.amount)}
                              style={{ padding: '6px 14px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Fund Escrow
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SHARED DELIVERABLES & ASSETS */}
        {workspaceTab === 'files' && (
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Project Deliverables & Shared Assets</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Upload project specifications, source code archives, PDFs, or design mockups for your project team.</p>
              </div>

              <label style={{ padding: '8px 18px', background: '#1a73e8', color: '#ffffff', borderRadius: '30px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Upload size={16} />
                {isUploadingFile ? 'Uploading...' : 'Upload Deliverable'}
                <input type="file" onChange={handleUploadWorkspaceFile} style={{ display: 'none' }} disabled={isUploadingFile} />
              </label>
            </div>

            {workspaceFiles.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <Paperclip size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>No Deliverables Attached Yet</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Upload project specifications, PDFs, or design mockups for your project team.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
                {workspaceFiles.map((f, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                      <FileCheck size={20} color="#1a73e8" />
                      <div style={{ overflow: 'hidden' }}>
                        <h5 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{f.name}</h5>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{f.size || 'Project Asset'}</span>
                      </div>
                    </div>
                    {f.url && (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button 
                          onClick={() => { setPreviewFile(f); setIsMediaPreviewOpen(true); }} 
                          style={{ padding: '6px 12px', background: '#1a73e8', color: '#ffffff', border: 'none', borderRadius: '20px', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          Preview In-App
                        </button>
                        <a href={f.url} download={f.name} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 10px', background: '#f1f5f9', color: '#475569', borderRadius: '20px', fontWeight: 700, fontSize: '0.75rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }} title="Download File">
                          <Download size={13} />
                        </a>
                        <button 
                          onClick={() => handleDeleteWorkspaceFile(idx)}
                          style={{ padding: '6px 8px', background: '#fef2f2', border: 'none', color: '#ef4444', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Remove Attachment"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ACTIVITY TIMELINE */}
        {workspaceTab === 'timeline' && (
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Real-time Project Audit Log</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #e2e8f0' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-27px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
                <h5 style={{ margin: '0 0 2px', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Project Requirement Published</h5>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{activeWorkspace.postedDate || 'Today'} • Verified by GigSphere AI</span>
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-27px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: '#1a73e8' }}></div>
                <h5 style={{ margin: '0 0 2px', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Escrow Payment Vault Created</h5>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Protected under GigSphere Smart Escrow</span>
              </div>
            </div>
          </div>
        )}

        {/* Add Milestone Modal */}
        {isMilestoneModalOpen && selectedProjectForMilestone && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1rem' }} onClick={() => setIsMilestoneModalOpen(false)}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '440px', width: '100%', padding: '1.75rem', color: '#0f172a', margin: 'auto' }} onClick={(e) => e.stopPropagation()}>
              {isSuccess ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 800 }}>Milestone Created!</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Added milestone for <strong>{selectedProjectForMilestone.title}</strong>.</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Create Milestone</h3>
                      <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.8rem' }}>Set deliverable for {selectedProjectForMilestone.title}</p>
                    </div>
                    <button onClick={() => setIsMilestoneModalOpen(false)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justify: 'center', color: '#64748b', cursor: 'pointer' }}>
                      <X size={16} />
                    </button>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    setIsProcessing(true);
                    setTimeout(() => {
                      setIsProcessing(false);
                      setIsSuccess(true);
                      
                      const addedMilestone = {
                        id: Date.now(),
                        title: newMilestone.title,
                        amount: Number(newMilestone.amount),
                        status: 'Pending',
                        dueDate: new Date(newMilestone.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                      };
                      setWorkspaceMilestones(prev => [...prev, addedMilestone]);

                      setTimeout(() => {
                        setIsMilestoneModalOpen(false);
                        setIsSuccess(false);
                        setNewMilestone({ title: '', amount: '', date: '' });
                      }, 1500);
                    }, 500);
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Milestone Title *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Initial Prototype & Architecture" 
                        value={newMilestone?.title || ''} 
                        onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                        required 
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Amount (₹) *</label>
                        <input 
                          type="number" 
                          placeholder="5000" 
                          value={newMilestone?.amount || ''} 
                          onChange={(e) => setNewMilestone({ ...newMilestone, amount: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                          required 
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Due Date *</label>
                        <input 
                          type="date" 
                          value={newMilestone?.date || ''} 
                          onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                          required 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button type="button" onClick={() => setIsMilestoneModalOpen(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: '40px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
                      <button type="submit" disabled={isProcessing} style={{ padding: '0.65rem 1.5rem', borderRadius: '40px', background: '#1a73e8', border: '1px solid #1a73e8', color: '#ffffff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
                        {isProcessing ? 'Creating...' : 'Create Milestone'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

        {/* Edit Project Popup Modal */}
        {isEditModalOpen && editingProject && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1rem' }} onClick={() => setIsEditModalOpen(false)}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '480px', width: '100%', padding: '1.75rem', color: '#0f172a', margin: 'auto' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e8f0fe', display: 'flex', alignItems: 'center', justify: 'center' }}>
                    <Edit size={20} color="#1a73e8" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Edit Project Details</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Update title, budget & deadline</span>
                  </div>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justify: 'center', color: '#64748b', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEditProject} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Project Title</label>
                  <input 
                    type="text" 
                    value={editingProject.title} 
                    onChange={(e) => setEditingProject({...editingProject, title: e.target.value})} 
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Budget (₹)</label>
                    <input 
                      type="number" 
                      value={editingProject.budget} 
                      onChange={(e) => setEditingProject({...editingProject, budget: e.target.value})} 
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Deadline Date</label>
                    <input 
                      type="date" 
                      value={editingProject.deadline} 
                      onChange={(e) => setEditingProject({...editingProject, deadline: e.target.value})} 
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Description</label>
                  <textarea 
                    value={editingProject.description} 
                    onChange={(e) => setEditingProject({...editingProject, description: e.target.value})} 
                    rows={3}
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: '40px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={isSavingEdit} style={{ padding: '0.65rem 1.5rem', borderRadius: '40px', background: '#1a73e8', border: '1px solid #1a73e8', color: '#ffffff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Save size={14} />
                    {isSavingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* In-App Media & Document Preview Modal */}
        <MediaPreviewModal 
          isOpen={isMediaPreviewOpen} 
          onClose={() => setIsMediaPreviewOpen(false)} 
          file={previewFile} 
        />
      </div>
    );
  }

  return (
    <div className="client-projects-page">
      {/* Header */}
      <div className="client-projects-header">
        <div className="client-projects-breadcrumbs">
          <span>Dashboard</span>
          <ChevronRight size={14} className="client-projects-breadcrumb-icon" />
          <span className="active">My Projects</span>
        </div>
        <div className="client-projects-header-content">
          <div>
            <h1 className="client-projects-title">My Projects</h1>
            <p className="client-projects-description">Create, manage, and track all your posted project requirements from one workspace.</p>
          </div>
          <Link to="/client/dashboard/create-project" className="client-projects-create-btn">
            + Create Project
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
          <div className="client-projects-stat-value">{projects.length}</div>
        </div>
        <div className="client-projects-stat-card">
          <div className="client-projects-stat-accent-bar"></div>
          <div className="client-projects-stat-header">
            <h3 className="client-projects-stat-label">Active Projects</h3>
            <div className="client-projects-stat-icon-container bg-brand">
              <Briefcase size={16} className="client-projects-stat-icon text-brand" />
            </div>
          </div>
          <div className="client-projects-stat-value">{projects.filter(p => p.status === 'In Progress' || p.status === 'Open').length}</div>
        </div>
        <div className="client-projects-stat-card">
          <div className="client-projects-stat-header">
            <h3 className="client-projects-stat-label">Completed Projects</h3>
            <div className="client-projects-stat-icon-container bg-green">
              <FileText size={16} className="client-projects-stat-icon text-green" />
            </div>
          </div>
          <div className="client-projects-stat-value">{projects.filter(p => p.status === 'Completed').length}</div>
        </div>
        <div className="client-projects-stat-card">
          <div className="client-projects-stat-header">
            <h3 className="client-projects-stat-label">Total Spent</h3>
            <div className="client-projects-stat-icon-container bg-blue">
              <CreditCard size={16} className="client-projects-stat-icon text-blue" />
            </div>
          </div>
          <div className="client-projects-stat-value">{formatINR(projects.filter(p => p.status === 'Completed').reduce((sum, p) => sum + (p.budget || p.maxBudget || 0), 0))}</div>
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
        </div>

        <div className="client-projects-toolbar-bottom">
          <div className="client-projects-search">
            <Search size={16} className="client-projects-search-icon" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="client-projects-search-input"
            />
          </div>
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
      ) : (
        <div className="client-projects-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px', marginTop: '20px' }}>
          {filteredProjects.map(project => (
            <div key={project.id || project._id} className="client-projects-card" style={{ padding: '18px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '12px', background: '#ffffff', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <StatusBadge status={project.status} />
                  {project.category && (
                    <span style={{ fontSize: '11px', fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: '20px' }}>
                      {project.category}
                    </span>
                  )}
                </div>
                
                <div className="client-projects-menu-container" style={{ position: 'relative' }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === (project.id || project._id) ? null : (project.id || project._id));
                    }}
                    className="client-projects-menu-btn"
                    style={{ padding: '6px', borderRadius: '50%', color: '#64748b', cursor: 'pointer' }}
                  >
                    <MoreVertical size={18} />
                  </button>
                  {menuOpen === (project.id || project._id) && (
                    <div className="client-projects-dropdown" style={{ position: 'absolute', right: 0, top: '32px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 99, minWidth: '150px', overflow: 'hidden' }}>
                      {getActions(project.status).map(action => (
                        <button 
                          key={action} 
                          className="client-projects-dropdown-item" 
                          onClick={(e) => handleActionClick(action, project, e)}
                          style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: action === 'Delete' ? '#dc2626' : '#0f172a', cursor: 'pointer' }}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{project.title}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.45 }}>
                  {project.description}
                </p>
              </div>

              {project.skills && project.skills.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {project.skills.map(skill => (
                    <span key={skill} style={{ fontSize: '11px', fontWeight: 700, background: '#f8fafc', color: '#1a73e8', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '12px' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: '#f8fafc', padding: '10px 14px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Budget</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#10b981' }}>{formatINR(project.budget || 0)}</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Proposals</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{project.proposals || 0} Bids</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Posted</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>{project.postedDate || 'Today'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Deadline</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1a73e8' }}>{formatDeadline(project.deadline, project.duration)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                <button 
                  onClick={() => handleActionClick('Workspace', project)}
                  style={{ flex: 1, padding: '7px 14px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Briefcase size={14} /> View Workspace
                </button>
                <button 
                  onClick={() => handleActionClick('Milestones', project)}
                  style={{ flex: 1, padding: '7px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '30px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Plus size={14} /> Add Milestone
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Project Popup Modal */}
      {isEditModalOpen && editingProject && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1rem' }} onClick={() => setIsEditModalOpen(false)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '480px', width: '100%', padding: '1.75rem', color: '#0f172a', margin: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e8f0fe', display: 'flex', alignItems: 'center', justify: 'center' }}>
                  <Edit size={20} color="#1a73e8" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Edit Project Details</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Update title, budget & deadline</span>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justify: 'center', color: '#64748b', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditProject} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Project Title</label>
                <input 
                  type="text" 
                  value={editingProject.title} 
                  onChange={(e) => setEditingProject({...editingProject, title: e.target.value})} 
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Budget (₹)</label>
                  <input 
                    type="number" 
                    value={editingProject.budget} 
                    onChange={(e) => setEditingProject({...editingProject, budget: e.target.value})} 
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Deadline Date</label>
                  <input 
                    type="date" 
                    value={editingProject.deadline} 
                    onChange={(e) => setEditingProject({...editingProject, deadline: e.target.value})} 
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Description</label>
                <textarea 
                  value={editingProject.description} 
                  onChange={(e) => setEditingProject({...editingProject, description: e.target.value})} 
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: '40px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSavingEdit} style={{ padding: '0.65rem 1.5rem', borderRadius: '40px', background: '#1a73e8', border: '1px solid #1a73e8', color: '#ffffff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Save size={14} />
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {isMilestoneModalOpen && selectedProjectForMilestone && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1rem' }} onClick={() => setIsMilestoneModalOpen(false)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '440px', width: '100%', padding: '1.75rem', color: '#0f172a', margin: 'auto' }} onClick={(e) => e.stopPropagation()}>
            {isSuccess ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 800 }}>Milestone Created!</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Added milestone for <strong>{selectedProjectForMilestone.title}</strong>.</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Create Milestone</h3>
                    <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.8rem' }}>Set deliverable for {selectedProjectForMilestone.title}</p>
                  </div>
                  <button onClick={() => setIsMilestoneModalOpen(false)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justify: 'center', color: '#64748b', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  setIsProcessing(true);
                  setTimeout(() => {
                    setIsProcessing(false);
                    setIsSuccess(true);
                    
                    const addedMilestone = {
                      id: Date.now(),
                      title: newMilestone.title,
                      amount: Number(newMilestone.amount),
                      status: 'Pending',
                      dueDate: new Date(newMilestone.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                    };
                    setWorkspaceMilestones(prev => [...prev, addedMilestone]);

                    setTimeout(() => {
                      setIsMilestoneModalOpen(false);
                      setIsSuccess(false);
                      setNewMilestone({ title: '', amount: '', date: '' });
                    }, 1500);
                  }, 500);
                }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Milestone Title *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Initial Prototype & Architecture" 
                      value={newMilestone?.title || ''} 
                      onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                      required 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Amount (₹) *</label>
                      <input 
                        type="number" 
                        placeholder="5000" 
                        value={newMilestone?.amount || ''} 
                        onChange={(e) => setNewMilestone({ ...newMilestone, amount: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                        required 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Due Date *</label>
                      <input 
                        type="date" 
                        value={newMilestone?.date || ''} 
                        onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                        required 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setIsMilestoneModalOpen(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: '40px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" disabled={isProcessing} style={{ padding: '0.65rem 1.5rem', borderRadius: '40px', background: '#1a73e8', border: '1px solid #1a73e8', color: '#ffffff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
                      {isProcessing ? 'Creating...' : 'Create Milestone'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* In-App Media & Document Preview Modal */}
      <MediaPreviewModal 
        isOpen={isMediaPreviewOpen} 
        onClose={() => setIsMediaPreviewOpen(false)} 
        file={previewFile} 
      />
    </div>
  );
}
