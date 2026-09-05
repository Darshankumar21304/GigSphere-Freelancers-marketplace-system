import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, Search, Filter, Briefcase, ChevronDown, CheckCircle,
  MoreVertical, Eye, MessageSquare, User, Check, X, ShieldCheck,
  Star, MapPin, Clock, Calendar, FileText, FolderPlus, Sparkles
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { apiFetch } from '../../utils/api';
import FreelancerProfileModal from '../../components/FreelancerProfileModal';
import { getCleanAvatar } from '../../utils/avatarUtils';
import './ReceivedProposals.css';

export default function ReceivedProposals() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [projectsList, setProjectsList] = useState([{ id: 'all', title: 'All Projects' }]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [activeTab, setActiveTab] = useState('All Proposals');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest First');
  const [isLoading, setIsLoading] = useState(true);

  // Profile Modal State
  const [selectedFreelancerForModal, setSelectedFreelancerForModal] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentProposalIdForModal, setCurrentProposalIdForModal] = useState(null);

  const tabs = ['All Proposals', 'New', 'Under Review', 'Shortlisted', 'Hired', 'Rejected', 'Withdrawn'];

  useEffect(() => {
    fetchProposalsAndProjects();
  }, []);

  const fetchProposalsAndProjects = async () => {
    setIsLoading(true);
    try {
      // Fetch client projects & proposals safely
      const fetchedProjects = await apiFetch('/projects').catch(() => []);
      if (Array.isArray(fetchedProjects) && fetchedProjects.length > 0) {
        setProjectsList([
          { id: 'all', title: 'All Projects' },
          ...fetchedProjects.map(p => ({ id: p._id || p.id, title: p.title, budget: p.budget || p.maxBudget }))
        ]);
      }

      const fetchedProposals = await apiFetch('/proposals/received').catch(() => []);
      if (Array.isArray(fetchedProposals)) {
        setProposals(fetchedProposals);
      } else {
        setProposals([]);
      }
    } catch (err) {
      console.error('Error fetching received proposals:', err);
      setProposals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (proposalId, newStatus) => {
    try {
      const res = await apiFetch(`/proposals/${proposalId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });

      setProposals(prev => prev.map(p => (p._id === proposalId || p.id === proposalId) ? { ...p, status: newStatus } : p));
      
      if (newStatus === 'Hired' || newStatus === 'Accepted') {
        alert('Freelancer hired successfully! Active contract created in database.');
        navigate('/client/dashboard/hired');
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert(`Status update error: ${err.message || 'Failed to update status'}`);
    }
  };

  // Filter proposals dynamically
  const filteredProposals = proposals.filter(p => {
    const matchesProject = selectedProject === 'all' || String(p.projectId || p.project_id) === String(selectedProject);
    
    let matchesTab = true;
    if (activeTab !== 'All Proposals') {
      const statusLower = (p.status || 'Pending').toLowerCase();
      const tabLower = activeTab.toLowerCase();
      if (tabLower === 'new') {
        matchesTab = statusLower === 'new' || statusLower === 'pending';
      } else if (tabLower === 'under review') {
        matchesTab = statusLower === 'under review' || statusLower === 'in review';
      } else {
        matchesTab = statusLower === tabLower;
      }
    }

    const freelancerName = p.freelancer?.name || p.freelancerName || '';
    const projectTitle = p.projectTitle || p.project?.title || p.project_title || '';
    const coverText = p.coverLetter || p.proposalText || '';

    const matchesSearch = freelancerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          coverText.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesProject && matchesTab && matchesSearch;
  });

  const getTabCount = (tabName) => {
    if (tabName === 'All Proposals') return proposals.length;
    const tabLower = tabName.toLowerCase();
    return proposals.filter(p => {
      const statusLower = (p.status || 'Pending').toLowerCase();
      if (tabLower === 'new') return statusLower === 'new' || statusLower === 'pending';
      if (tabLower === 'under review') return statusLower === 'under review' || statusLower === 'in review';
      return statusLower === tabLower;
    }).length;
  };

  return (
    <div className="received-proposals-container">
      {/* Header */}
      <div className="rp-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', background: '#e8f0fe', color: '#1a73e8', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            <Sparkles size={13} /> Project Talent Review
          </div>
          <h1 className="rp-title">Received Proposals</h1>
          <p className="rp-subtitle">Review proposals, compare freelancer bids, and hire talent for your projects.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="rp-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Total Proposals</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{proposals.length}</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justify: 'center' }}>
            <FileText size={20} />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>New Bids</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{getTabCount('New')}</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justify: 'center' }}>
            <Clock size={20} />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Shortlisted</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{getTabCount('Shortlisted')}</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f3e8fd', color: '#a142f4', display: 'flex', alignItems: 'center', justify: 'center' }}>
            <Star size={20} />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Hired</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{getTabCount('Hired')}</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#dcfce7', color: '#10b981', display: 'flex', alignItems: 'center', justify: 'center' }}>
            <CheckCircle size={20} />
          </div>
        </div>
      </div>

      {/* Project Selector & Search Filter Bar */}
      <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569' }}>Viewing Proposals For:</label>
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: '30px', border: '1px solid #cbd5e1', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', outline: 'none', background: '#f8fafc', cursor: 'pointer' }}
            >
              {projectsList.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search by freelancer or proposal..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #cbd5e1', borderRadius: '30px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Tab Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ padding: '6px 16px', borderRadius: '30px', border: activeTab === tab ? '1px solid #1a73e8' : '1px solid #cbd5e1', background: activeTab === tab ? '#e8f0fe' : '#f8fafc', color: activeTab === tab ? '#1a73e8' : '#475569', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              {tab} ({getTabCount(tab)})
            </button>
          ))}
        </div>
      </div>

      {/* Proposals List / Clean Zero State */}
      {filteredProposals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', color: '#64748b' }}>
          <FolderPlus size={44} color="#1a73e8" style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 6px', color: '#0f172a', fontWeight: 800, fontSize: '1.15rem' }}>No Proposals Received Yet</h3>
          <p style={{ margin: '0 0 20px', fontSize: '0.875rem', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
            When freelancers browse your open project requirements and submit proposals, they will appear here for your review.
          </p>
          <button 
            onClick={() => navigate('/client/dashboard/post-project')}
            style={{ padding: '0.65rem 1.4rem', borderRadius: '40px', background: '#0f172a', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            Post a New Project Requirement
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredProposals.map(prop => (
            <div key={prop._id || prop.id} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div 
                  onClick={() => {
                    setSelectedFreelancerForModal(prop.freelancer);
                    setCurrentProposalIdForModal(prop._id || prop.id);
                    setIsProfileModalOpen(true);
                  }}
                  style={{ display: 'flex', gap: '14px', alignItems: 'center', cursor: 'pointer' }}
                  title="Click to view freelancer portfolio, gigs & history popup"
                >
                  <img src={getCleanAvatar(prop.freelancer?.avatar || prop.freelancer?.profilePhoto, prop.freelancer?.name || prop.freelancerName)} alt="Freelancer" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #1a73e8' }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: '0 0 2px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                        {prop.freelancer?.name || prop.freelancerName || 'Freelancer'}
                      </h4>
                      <span style={{ padding: '2px 8px', borderRadius: '12px', background: '#e8f0fe', color: '#1a73e8', fontSize: '0.72rem', fontWeight: 800 }}>
                        View Portfolio & Gigs
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{prop.freelancer?.title || 'Professional'}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>{formatINR(prop.bidAmount || prop.budget)}</div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Bid Amount</span>
                </div>
              </div>

              {/* Freelancer Skill Badges */}
              {(() => {
                const rawSkills = Array.isArray(prop.freelancer?.skills) ? prop.freelancer.skills : [];
                const parsedSkills = rawSkills.flatMap(s => typeof s === 'string' ? s.split(',').map(x => x.trim()) : s).filter(Boolean);
                if (parsedSkills.length === 0) return null;
                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {parsedSkills.slice(0, 6).map((sk, idx) => (
                      <span key={idx} style={{ padding: '3px 10px', borderRadius: '20px', background: '#f1f5f9', color: '#334155', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #e2e8f0' }}>
                        {sk}
                      </span>
                    ))}
                    {parsedSkills.length > 6 && (
                      <span style={{ padding: '3px 8px', borderRadius: '20px', background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>
                        +{parsedSkills.length - 6} more
                      </span>
                    )}
                  </div>
                );
              })()}

              <p style={{ fontSize: '0.875rem', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                {prop.coverLetter || prop.proposalText}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  {(prop.status === 'Hired' || prop.status === 'Accepted') ? (
                    <>
                      <span style={{ padding: '6px 16px', borderRadius: '30px', background: '#dcfce7', color: '#10b981', fontWeight: 800, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={16} /> Freelancer Hired
                      </span>
                      <button 
                        onClick={() => navigate('/client/dashboard/hired')}
                        style={{ padding: '6px 16px', borderRadius: '30px', background: '#0f172a', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        View Active Contract
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleUpdateStatus(prop._id || prop.id, 'Hired')}
                        style={{ padding: '6px 16px', borderRadius: '30px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        Hire Freelancer
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(prop._id || prop.id, 'Shortlisted')}
                        style={{ padding: '6px 16px', borderRadius: '30px', background: prop.status === 'Shortlisted' ? '#e8f0fe' : '#f8fafc', color: prop.status === 'Shortlisted' ? '#1a73e8' : '#0f172a', border: '1px solid #cbd5e1', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        {prop.status === 'Shortlisted' ? 'Shortlisted ★' : 'Shortlist'}
                      </button>
                    </>
                  )}
                </div>

                <button 
                  onClick={() => {
                    const flId = prop.freelancer?.id || prop.freelancer?._id || prop.freelancer_id?._id || prop.freelancer_id;
                    navigate('/client/dashboard/chat', {
                      state: {
                        partnerId: typeof flId === 'object' ? (flId._id || flId.id) : flId,
                        name: prop.freelancerName || prop.freelancer?.name,
                        avatar: prop.freelancer?.avatar,
                        title: prop.projectTitle || prop.project_title
                      }
                    });
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '30px', background: '#e8f0fe', color: '#1a73e8', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  <MessageSquare size={14} /> Send Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Freelancer Portfolio & Gigs Modal Popup */}
      <FreelancerProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        freelancer={selectedFreelancerForModal}
        onHire={(fl) => {
          if (currentProposalIdForModal) {
            handleUpdateStatus(currentProposalIdForModal, 'Hired');
            setIsProfileModalOpen(false);
          }
        }}
        onShortlist={(fl) => {
          if (currentProposalIdForModal) {
            handleUpdateStatus(currentProposalIdForModal, 'Shortlisted');
            setIsProfileModalOpen(false);
          }
        }}
        onMessage={(fl) => {
          setIsProfileModalOpen(false);
          const flId = fl?.id || fl?._id || fl?.user_id || fl?.freelancer_id;
          navigate('/client/dashboard/chat', {
            state: {
              partnerId: typeof flId === 'object' ? (flId._id || flId.id) : flId,
              name: fl?.name || fl?.freelancerName,
              avatar: fl?.avatar || fl?.profilePhoto,
              title: fl?.title
            }
          });
        }}
      />
    </div>
  );
}
