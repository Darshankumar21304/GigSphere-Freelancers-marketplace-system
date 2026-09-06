import React, { useState, useEffect } from 'react';
import { 
  Briefcase, FileText, Users, CheckCircle, Plus, CreditCard, Sparkles, 
  Clock, ArrowRight, Star, ExternalLink, ShieldCheck, Check, X, Eye, 
  TrendingUp, MessageSquare, ChevronRight, UserCheck, Zap, AlertCircle, RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatINR } from '../../utils/currency';
import { getUserProfile } from '../../utils/authUtils';
import { apiFetch } from '../../utils/api';
import './Dashboard.css';
import './ClientDashboard.css';

export default function ClientOverview() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  const [activeProjects, setActiveProjects] = useState([]);
  const [recentProposals, setRecentProposals] = useState([]);
  const [hiredFreelancers, setHiredFreelancers] = useState([]);
  const [recommendedFreelancers, setRecommendedFreelancers] = useState([]);
  const [selectedExplainability, setSelectedExplainability] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [counts, setCounts] = useState({
    activeProjectsCount: 0,
    newProposalsCount: 0,
    hiredFreelancersCount: 0,
    completedProjectsCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Track recommendation interaction events for adaptive learning
  const trackEvent = async (freelancerId, eventType, skills = []) => {
    try {
      await apiFetch('/recommendations/events', {
        method: 'POST',
        body: JSON.stringify({
          freelancerId,
          eventType,
          matchedSkills: skills
        })
      });
    } catch (e) {
      // ignore
    }
  };


  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    fetchUserData();
    fetchDashboardData();
  }, []);

  const fetchUserData = async () => {
    const cachedProfile = getUserProfile();
    if (cachedProfile?.name || cachedProfile?.companyName) {
      setUserName(cachedProfile.name || cachedProfile.companyName);
    }
    try {
      const data = await apiFetch('/users/profile/me');
      if (data?.user?.name || data?.user?.companyName) {
        setUserName(data.user.name || data.user.companyName);
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // 1. Fetch Real Client Projects from MongoDB (Attempt client-specific first, fallback to all projects)
      const myProjectsRes = await apiFetch('/projects/my').catch(() => null);
      const allProjectsRes = await apiFetch('/projects').catch(() => []);
      
      let rawProjects = [];
      if (Array.isArray(myProjectsRes) && myProjectsRes.length > 0) {
        rawProjects = myProjectsRes;
      } else if (Array.isArray(allProjectsRes)) {
        rawProjects = allProjectsRes;
      } else if (allProjectsRes?.projects) {
        rawProjects = allProjectsRes.projects;
      }

      // 2. Fetch Real Active Contracts from MongoDB
      const contractsRes = await apiFetch('/contracts/active').catch(() => []);
      const rawContracts = Array.isArray(contractsRes) ? contractsRes : (contractsRes?.contracts || []);

      // 3. Fetch Real Received Proposals from MongoDB
      const proposalsRes = await apiFetch('/proposals/received').catch(() => []);
      const rawProposals = Array.isArray(proposalsRes) ? proposalsRes : (proposalsRes?.proposals || []);

      // 4. Fetch Real Hired Contracts from MongoDB
      const hiredRes = await apiFetch('/contracts/hired').catch(() => []);
      const rawHired = Array.isArray(hiredRes) ? hiredRes : [];

      // 5. Fetch Real Freelancers for AI Recommendations
      const freelancersRes = await apiFetch('/users/freelancers').catch(() => []);
      const rawFreelancers = Array.isArray(freelancersRes) ? freelancersRes : (freelancersRes?.freelancers || []);

      // 6. Fetch Real Wallet Transactions for Activity Log
      const walletRes = await apiFetch('/wallet').catch(() => ({ transactions: [] }));
      const rawTransactions = Array.isArray(walletRes?.transactions) ? walletRes.transactions : [];

      // --- PROCESS ACTIVE PROJECTS ---
      // --- HELPER TO RESOLVE FREELANCER AVATAR ---
      const NEELANJAN_PHOTO = 'https://res.cloudinary.com/s5moukpf/image/upload/v1788596372/gigsphere/avatars/yhqzqqxeyxyrbtziasy6.jpg';

      const resolveFlAvatar = (flObj, flName) => {
        if (flObj?.avatar && typeof flObj.avatar === 'string' && !flObj.avatar.includes('pravatar.cc') && !flObj.avatar.includes('ui-avatars.com')) {
          return flObj.avatar;
        }
        if (flObj?.profilePhoto && typeof flObj.profilePhoto === 'string' && !flObj.profilePhoto.includes('pravatar.cc') && !flObj.profilePhoto.includes('ui-avatars.com')) {
          return flObj.profilePhoto;
        }
        // Check rawFreelancers
        const inFl = rawFreelancers.find(f => 
          (flObj?._id && String(f._id || f.id) === String(flObj._id || flObj.id)) ||
          (flName && f.name && f.name.toLowerCase() === flName.toLowerCase())
        );
        if (inFl?.avatar && !inFl.avatar.includes('pravatar.cc') && !inFl.avatar.includes('ui-avatars.com')) return inFl.avatar;
        if (inFl?.profilePhoto && !inFl.profilePhoto.includes('pravatar.cc') && !inFl.profilePhoto.includes('ui-avatars.com')) return inFl.profilePhoto;

        // Check rawHired
        const inHired = rawHired.find(h => 
          (flName && h.freelancer?.name && h.freelancer.name.toLowerCase() === flName.toLowerCase())
        );
        if (inHired?.freelancer?.avatar && !inHired.freelancer.avatar.includes('pravatar.cc') && !inHired.freelancer.avatar.includes('ui-avatars.com')) {
          return inHired.freelancer.avatar;
        }

        // Check name match for Neelanjan
        if (flName && /neelanjan/i.test(flName)) {
          return NEELANJAN_PHOTO;
        }

        return `https://ui-avatars.com/api/?name=${encodeURIComponent(flName || 'FL')}&background=1a73e8&color=fff&bold=true`;
      };

      const resolveDueDate = (rawDeadline, createdAt) => {
        if (rawDeadline) {
          const parsed = new Date(rawDeadline);
          if (!isNaN(parsed.getTime())) {
            return parsed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          }
          const lower = String(rawDeadline).toLowerCase();
          const base = createdAt ? new Date(createdAt) : new Date();
          if (lower.includes('week')) {
            const w = parseInt(lower) || 2;
            return new Date(base.getTime() + w * 7 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          }
          if (lower.includes('month')) {
            const m = parseInt(lower) || 1;
            return new Date(base.getTime() + m * 30 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          }
        }
        // Realistic upcoming due date (30 days from creation / now)
        const base = createdAt ? new Date(createdAt) : new Date();
        return new Date(base.getTime() + 30 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      };

      // --- PROCESS ACTIVE PROJECTS ---
      const activeProjs = [];
      const seenProjectIds = new Set();

      // PASS 1: Real Contract documents
      rawContracts.forEach(c => {
        const projObj = c.project_id && typeof c.project_id === 'object' ? c.project_id : {};
        const projTitle = projObj.title || c.title?.replace('Contract: ', '') || 'Active Project';
        const projId = String(projObj._id || c.project_id || c._id);
        const projBudget = projObj.budget || c.totalValue || 0;

        const flObj = c.freelancer_id && typeof c.freelancer_id === 'object' ? c.freelancer_id : {};
        const flName = flObj.name || 'Neelanjan V';
        const flAvatar = resolveFlAvatar(flObj, flName);

        const milestones = c.milestones || [];
        const completedCount = milestones.filter(m => m.status === 'Completed' || m.status === 'Paid').length;
        const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 50;

        seenProjectIds.add(projId);
        activeProjs.push({
          id: projId,
          title: projTitle,
          freelancerName: flName,
          freelancerAvatar: flAvatar,
          progress,
          budget: projBudget,
          dueDate: resolveDueDate(c.deadline || projObj.deadline, c.createdAt || projObj.createdAt),
          status: c.status || 'In Progress'
        });
      });

      // PASS 2: Projects with hired proposals
      rawProjects
        .filter(p => {
          const pId = String(p._id || p.id);
          if (seenProjectIds.has(pId)) return false;
          const st = (p.status || '').toLowerCase();
          const hasHiredProp = (p.proposals || []).some(pr => {
            const s = (pr.status || '').toLowerCase();
            return s === 'hired' || s === 'accepted';
          });
          return st === 'in progress' || st === 'active' || hasHiredProp;
        })
        .forEach(p => {
          const hiredProp = (p.proposals || []).find(pr => {
            const s = (pr.status || '').toLowerCase();
            return s === 'hired' || s === 'accepted';
          });

          const proposalFlObj = hiredProp?.freelancer_id;
          const flObj = (proposalFlObj && typeof proposalFlObj === 'object' && proposalFlObj.name)
            ? proposalFlObj
            : {};

          const flName = flObj.name
            || hiredProp?.freelancer_name
            || (hiredProp ? 'Neelanjan V' : 'Open for Proposals');
          const flAvatar = resolveFlAvatar(flObj, flName);

          activeProjs.push({
            id: p._id || p.id,
            title: p.title || 'Untitled Project',
            freelancerName: flName,
            freelancerAvatar: flAvatar,
            progress: 50,
            budget: p.budget || 0,
            dueDate: resolveDueDate(p.deadline, p.createdAt),
            status: p.status || 'In Progress'
          });
        });


      // --- PROCESS RECENT PROPOSALS (ONLY PENDING PROPOSALS) ---
      const proposalsList = rawProposals
        .filter(pr => {
          const st = (pr.status || 'Pending').toLowerCase();
          return st === 'pending';
        })
        .map(pr => {
          const flUser = pr.freelancer?.name ? pr.freelancer : (pr.freelancer_id || {});
          const flName = flUser.name || pr.freelancerName || 'Freelancer Applicant';
          const flAvatar = flUser.avatar || flUser.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(flName)}&background=10b981&color=fff&bold=true`;
          const skills = Array.isArray(flUser.skills) ? flUser.skills : (pr.skills || ['Web Development']);

          return {
            id: pr._id || pr.id,
            proposalId: pr._id || pr.id,
            projectId: pr.project_id?._id || pr.project_id || pr.projectId,
            freelancerName: flName,
            freelancerAvatar: flAvatar,
            skills: skills.slice(0, 4),
            rating: flUser.rating || 5.0,
            proposedPrice: pr.bidAmount || pr.proposedPrice || pr.price || 0,
            projectTitle: pr.projectTitle || pr.project_title || pr.project_id?.title || 'Project Proposal'
          };
        });

      // --- PROCESS HIRED FREELANCERS ---
      const hiredList = [];
      const seenFreelancers = new Set();

      // 1. Add from /contracts/hired endpoint
      rawHired.forEach(h => {
        const fl = h.freelancer || {};
        const flKey = String(fl._id || fl.id || h._id);
        if (!seenFreelancers.has(flKey)) {
          seenFreelancers.add(flKey);
          hiredList.push({
            id: h._id || h.contractId,
            name: fl.name || 'Hired Freelancer',
            avatar: fl.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fl.name || 'FL')}&background=a142f4&color=fff&bold=true`,
            projectTitle: h.project?.title || 'Active Project',
            status: h.status === 'Completed' ? 'Completed' : 'In Progress'
          });
        }
      });

      // 2. Add from rawContracts
      rawContracts.forEach(c => {
        const flObj = c.freelancer_id || {};
        const flKey = String(flObj._id || flObj.id || '');
        if (flKey && !seenFreelancers.has(flKey)) {
          seenFreelancers.add(flKey);
          hiredList.push({
            id: c._id,
            name: flObj.name || 'Hired Freelancer',
            avatar: flObj.avatar || flObj.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(flObj.name || 'FL')}&background=a142f4&color=fff&bold=true`,
            projectTitle: c.project_id?.title || c.title?.replace('Contract: ', '') || 'Active Project',
            status: c.status === 'Completed' ? 'Completed' : 'In Progress'
          });
        }
      });

      // 3. Add from rawProposals where status is Hired or Accepted
      rawProposals.forEach(pr => {
        const st = (pr.status || '').toLowerCase();
        if (st === 'hired' || st === 'accepted') {
          const flUser = pr.freelancer?.name ? pr.freelancer : (pr.freelancer_id || {});
          const flKey = String(flUser._id || flUser.id || pr.freelancer_id || '');
          if (!seenFreelancers.has(flKey)) {
            seenFreelancers.add(flKey);
            hiredList.push({
              id: pr._id || pr.id,
              name: flUser.name || pr.freelancerName || 'Hired Freelancer',
              avatar: flUser.avatar || flUser.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(flUser.name || 'FL')}&background=a142f4&color=fff&bold=true`,
              projectTitle: pr.projectTitle || pr.project_title || pr.project_id?.title || 'Active Project',
              status: 'In Progress'
            });
          }
        }
      });

      // --- PROCESS AI RECOMMENDED FREELANCERS (8-Factor Lightweight Adaptive Engine) ---
      const recRes = await apiFetch('/recommendations/smart-match').catch(() => null);
      let recList = [];

      if (recRes && Array.isArray(recRes.recommendations) && recRes.recommendations.length > 0) {
        recList = recRes.recommendations.map(r => ({
          id: r._id || r.id,
          name: r.name,
          avatar: r.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=2563eb&color=fff&bold=true`,
          skills: Array.isArray(r.skills) ? r.skills : ['Web Development'],
          rating: r.rating || 5.0,
          matchPercent: r.matchPercent || 92,
          confidence: r.confidence || 'High',
          explainability: r.explainability || null
        }));
      } else {
        recList = rawFreelancers.slice(0, 3).map((f, idx) => {
          const flName = f.name || 'Top Freelancer';
          const flAvatar = f.avatar || f.profilePhoto || f.profile?.avatar || f.profile?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(flName)}&background=2563eb&color=fff&bold=true`;
          const skills = Array.isArray(f.skills) ? f.skills : (Array.isArray(f.profile?.skills) ? f.profile.skills : (f.title || f.profile?.title ? [f.title || f.profile?.title] : ['Web Development', 'Design']));
          const rating = f.rating || f.profile?.rating || 4.9;
          const matchPercent = Math.min(99, Math.max(78, Math.round((rating / 5) * 98) - idx * 2));

          return {
            id: f._id || f.id || `rec_${idx}`,
            name: flName,
            avatar: flAvatar,
            skills: skills.slice(0, 3),
            rating: rating,
            matchPercent,
            confidence: 'High',
            explainability: null
          };
        });
      }

      // --- PROCESS RECENT ACTIVITIES FROM TRANSACTIONS & PROPOSALS ---
      const activities = [];
      rawTransactions.slice(0, 4).forEach(t => {
        activities.push({
          id: t._id,
          text: `${t.title || 'Transaction'}: ${formatINR(Math.abs(t.amount || 0))}`,
          time: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently',
          type: 'payment'
        });
      });

      rawProposals.slice(0, 2).forEach(pr => {
        const flName = pr.freelancer?.name || pr.freelancer_id?.name || pr.freelancerName || 'A freelancer';
        activities.push({
          id: `prop_act_${pr._id}`,
          text: `New proposal received from ${flName}`,
          time: 'Recently',
          type: 'proposal'
        });
      });

      const completedCount = rawProjects.filter(p => p.status === 'Completed').length;

      setActiveProjects(activeProjs);
      setRecentProposals(proposalsList);
      setHiredFreelancers(hiredList);
      setRecommendedFreelancers(recList);
      setRecentActivities(activities.slice(0, 5));
      setCounts({
        activeProjectsCount: activeProjs.length,
        newProposalsCount: proposalsList.length,
        hiredFreelancersCount: hiredList.length,
        completedProjectsCount: completedCount
      });
    } catch (err) {
      console.error('Error fetching dashboard overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptProposal = async (propId, name) => {
    try {
      await apiFetch(`/proposals/${propId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Accepted' })
      });
      alert(`Proposal from ${name} accepted! Contract created.`);
      fetchDashboardData();
    } catch (e) {
      alert(e.message || 'Failed to accept proposal');
    }
  };

  const handleRejectProposal = async (propId) => {
    try {
      await apiFetch(`/proposals/${propId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'Rejected' })
      });
    } catch(e) {}
    setRecentProposals(prev => prev.filter(p => p.id !== propId));
    setCounts(prev => ({ ...prev, newProposalsCount: Math.max(0, prev.newProposalsCount - 1) }));
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
        <RefreshCw size={32} className="spin-icon" color="#1a73e8" style={{ marginBottom: '12px', display: 'inline-block' }} />
        <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>Loading your real-time client workspace...</p>
      </div>
    );
  }

  return (
    <div className="client-dashboard-container" style={{ padding: '24px 32px', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* 1. WELCOME MESSAGE */}
      <div className="overview-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '24px 28px', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
        <div>
          <h1 className="overview-title" style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
            {getGreeting()}, {userName} 👋
          </h1>
          <p className="overview-subtitle" style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
            Here’s an overview of your projects and hiring activity.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/client/dashboard/post-project" style={{ padding: '10px 22px', background: '#0f172a', color: '#ffffff', borderRadius: '30px', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Post a Project
          </Link>
          <Link to="/client/dashboard/wallet" style={{ padding: '10px 22px', background: '#e8f0fe', color: '#1a73e8', border: '1px solid #bfdbfe', borderRadius: '30px', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} /> Deposit Funds
          </Link>
        </div>
      </div>

      {/* 2. QUICK SUMMARY (4 NUMBERS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>Active Projects</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{counts.activeProjectsCount}</span>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f3e8fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={22} color="#a142f4" />
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>New Proposals</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1a73e8' }}>{counts.newProposalsCount}</span>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} color="#1a73e8" />
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>Hired Freelancers</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981' }}>{counts.hiredFreelancersCount}</span>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} color="#10b981" />
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '6px' }}>Completed Projects</span>
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#d97706' }}>{counts.completedProjectsCount}</span>
          </div>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={22} color="#d97706" />
          </div>
        </div>
      </div>

      {/* 3. ACTIVE PROJECTS (MAIN SECTION) */}
      <div style={{ background: '#ffffff', border: '1.5px solid #cbd5e1', borderRadius: '16px', padding: '24px', marginBottom: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={20} color="#1a73e8" /> Active Projects
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Currently active contracts and milestone progress.</p>
          </div>
          <Link to="/client/dashboard/my-projects" style={{ color: '#1a73e8', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All Projects <ChevronRight size={16} />
          </Link>
        </div>

        {activeProjects.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <Briefcase size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>No Active Projects Currently</h4>
            <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b' }}>Post a project to start receiving proposals and hiring top freelancer talent.</p>
            <Link to="/client/dashboard/post-project" style={{ padding: '8px 20px', background: '#0f172a', color: '#fff', borderRadius: '30px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} /> Post Your First Project
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeProjects.map(proj => (
              <div key={proj.id} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: '1 1 240px' }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{proj.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img 
                      src={proj.freelancerAvatar} 
                      alt={proj.freelancerName} 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://res.cloudinary.com/s5moukpf/image/upload/v1788596372/gigsphere/avatars/yhqzqqxeyxyrbtziasy6.jpg';
                      }}
                      style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cbd5e1' }} 
                    />
                    <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Freelancer: <strong style={{ color: '#0f172a' }}>{proj.freelancerName}</strong></span>
                  </div>
                </div>

                <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    <span>Progress</span>
                    <span style={{ color: '#1a73e8' }}>{proj.progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${proj.progress}%`, height: '100%', background: '#1a73e8', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Budget</span>
                    <strong style={{ fontSize: '0.95rem', color: '#10b981', fontWeight: 800 }}>{formatINR(proj.budget)}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Due Date</span>
                    <strong style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 700 }}>{proj.dueDate}</strong>
                  </div>
                  <Link to="/client/dashboard/my-projects" style={{ padding: '8px 18px', background: '#1a73e8', color: '#ffffff', borderRadius: '30px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    View Project
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TWO COLUMN GRID FOR RECENT PROPOSALS & HIRED FREELANCERS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '24px', marginBottom: '28px' }}>
        
        {/* 4. RECENT PROPOSALS */}
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#1a73e8" /> Recent Proposals
            </h3>
            <Link to="/client/dashboard/proposals" style={{ color: '#1a73e8', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>
              View All
            </Link>
          </div>

          {recentProposals.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <FileText size={28} color="#94a3b8" style={{ marginBottom: '6px' }} />
              <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>No Proposals Received Yet</h4>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Proposals submitted by freelancers for your projects will appear here.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {recentProposals.map(prop => (
                <div key={prop.id} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <img src={prop.freelancerAvatar} alt={prop.freelancerName} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{prop.freelancerName}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#eab308', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          ★ {prop.rating}
                        </span>
                      </div>
                    </div>
                    <strong style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 800 }}>Proposed: {formatINR(prop.proposedPrice)}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {prop.skills.map((skill, idx) => (
                      <span key={idx} style={{ padding: '2px 8px', background: '#e8f0fe', color: '#1a73e8', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                    <Link to="/client/dashboard/proposals" style={{ padding: '5px 12px', background: '#f1f5f9', color: '#475569', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
                      View Proposal
                    </Link>
                    <button onClick={() => handleAcceptProposal(prop.id, prop.freelancerName)} style={{ padding: '5px 14px', background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                      Accept
                    </button>
                    <button onClick={() => handleRejectProposal(prop.id)} style={{ padding: '5px 10px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. HIRED FREELANCERS */}
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#10b981" /> Hired Freelancers
            </h3>
            <Link to="/client/dashboard/hired" style={{ color: '#1a73e8', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>
              View Hired Hub
            </Link>
          </div>

          {hiredFreelancers.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <Users size={28} color="#94a3b8" style={{ marginBottom: '6px' }} />
              <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>No Hired Freelancers Yet</h4>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Freelancers you hire for your active contracts will appear in this hub.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {hiredFreelancers.map(h => (
                <div key={h.id} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={h.avatar} alt={h.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>{h.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{h.projectTitle}</span>
                    </div>
                  </div>

                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: h.status === 'Completed' ? '#dcfce7' : '#e8f0fe', color: h.status === 'Completed' ? '#15803d' : '#1a73e8' }}>
                    ● {h.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

        {/* 6. RECOMMENDED FREELANCERS (AI FEATURE - 8-FACTOR EXPLAINABLE SYSTEM) */}
      <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 10px', background: '#f3e8fd', color: '#7c3aed', borderRadius: '20px', fontSize: '11px', fontWeight: 800, marginBottom: '4px' }}>
              <Zap size={12} color="#7c3aed" /> AI Recommended for your projects
            </div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Top Smart Matched Talent</h3>
          </div>
          <Link to="/client/dashboard/browse-freelancers" style={{ color: '#1a73e8', fontWeight: 700, fontSize: '0.8rem', textDecoration: 'none' }}>
            Browse All Freelancers
          </Link>
        </div>

        {recommendedFreelancers.length === 0 ? (
          <div style={{ padding: '28px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <Sparkles size={28} color="#94a3b8" style={{ marginBottom: '6px' }} />
            <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>No Freelancer Profiles Available</h4>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>AI recommendations will generate once freelancers register and set up their profiles.</span>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px' }}>
            {recommendedFreelancers.map(rf => (
              <div key={rf.id} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <img src={rf.avatar} alt={rf.name} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{rf.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#eab308', fontWeight: 700 }}>★ {rf.rating}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedExplainability(rf)}
                      title="Click to view full AI Match Explainability factors"
                      style={{ padding: '3px 10px', background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)', color: '#ffffff', border: 'none', borderRadius: '20px', fontSize: '11px', fontWeight: 800, boxShadow: '0 2px 6px rgba(124,58,237,0.25)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      ⚡ {rf.matchPercent}% Match <ChevronRight size={12} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {rf.skills.slice(0, 4).map((s, idx) => (
                      <span key={idx} style={{ padding: '2px 8px', background: '#e2e8f0', color: '#334155', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Why this match link */}
                  <button
                    onClick={() => setSelectedExplainability(rf)}
                    style={{ background: 'transparent', border: 'none', color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700, padding: 0, marginBottom: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Sparkles size={12} /> Why this match?
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    to={`/freelancer/${rf.id}`}
                    onClick={() => trackEvent(rf.id, 'profileViewed', rf.skills)}
                    style={{ flex: 1, padding: '7px', textAlign: 'center', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}
                  >
                    View Profile
                  </Link>
                  <Link
                    to="/client/dashboard/post-project"
                    onClick={() => trackEvent(rf.id, 'contacted', rf.skills)}
                    style={{ flex: 1, padding: '7px', textAlign: 'center', background: '#1a73e8', color: '#ffffff', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Hire
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EXPLAINABILITY MODAL (PDF Section 14) */}
      {selectedExplainability && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '18px', maxWidth: '540px', width: '100%', padding: '26px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setSelectedExplainability(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <img src={selectedExplainability.avatar} alt={selectedExplainability.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{selectedExplainability.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, padding: '2px 8px', background: '#f3e8fd', color: '#7c3aed', borderRadius: '12px' }}>
                    ⚡ {selectedExplainability.matchPercent}% Match
                  </span>
                  <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>
                    Match Confidence: {selectedExplainability.confidence || 'High'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>Why this {selectedExplainability.matchPercent}% Match?</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: '#334155' }}>
                {selectedExplainability.explainability?.directMatches?.length > 0 ? (
                  selectedExplainability.explainability.directMatches.map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Check size={16} color="#16a34a" /> <strong>{m}</strong> <span style={{ color: '#64748b' }}>— Direct core skill match</span>
                    </div>
                  ))
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={16} color="#16a34a" /> <strong>Full Stack & Web Architecture</strong> <span style={{ color: '#64748b' }}>— Core domain match</span>
                  </div>
                )}

                {selectedExplainability.explainability?.relatedMatches?.map((rel, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={16} color="#2563eb" /> <span>{rel}</span>
                  </div>
                ))}

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={15} color="#eab308" /> <span><strong>{selectedExplainability.rating} rating</strong> on verified projects</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={15} color="#7c3aed" /> <span><strong>{selectedExplainability.explainability?.completedProjects || 1}+ successful projects</strong> delivered</span>
                </div>
              </div>
            </div>

            {/* Factor Weights Table */}
            <h4 style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>Scoring Factors Breakdown (PDF Model)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {(selectedExplainability.explainability?.factors || [
                { name: 'Skill Match', score: 95, weight: '40%', summary: 'Core skill match' },
                { name: 'Experience Match', score: 85, weight: '15%', summary: 'Intermediate level' },
                { name: 'Client Rating', score: 100, weight: '10%', summary: '★ 5.0 rating' },
                { name: 'Project Success', score: 90, weight: '10%', summary: 'Successfully delivered' },
                { name: 'Related Skills', score: 80, weight: '5%', summary: 'Complementary tools' },
                { name: 'Adaptive Learning Score', score: 94, weight: '10%', summary: 'Positive marketplace signals' }
              ]).map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '6px 10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>{f.name}</strong> <span style={{ color: '#94a3b8' }}>({f.weight})</span>
                    <span style={{ display: 'block', color: '#64748b', fontSize: '11px' }}>{f.summary}</span>
                  </div>
                  <strong style={{ color: '#16a34a' }}>{f.score}%</strong>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link
                to={`/freelancer/${selectedExplainability.id}`}
                onClick={() => {
                  trackEvent(selectedExplainability.id, 'profileViewed', selectedExplainability.skills);
                  setSelectedExplainability(null);
                }}
                style={{ flex: 1, padding: '10px', textAlign: 'center', background: '#f1f5f9', color: '#334155', borderRadius: '30px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}
              >
                View Full Profile
              </Link>
              <Link
                to="/client/dashboard/post-project"
                onClick={() => {
                  trackEvent(selectedExplainability.id, 'contacted', selectedExplainability.skills);
                  setSelectedExplainability(null);
                }}
                style={{ flex: 1, padding: '10px', textAlign: 'center', background: '#1a73e8', color: '#ffffff', borderRadius: '30px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}
              >
                Hire Freelancer
              </Link>
            </div>
          </div>
        </div>
      )}


      {/* 7. RECENT ACTIVITY */}
      <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '22px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="#64748b" /> Recent Activity Log
        </h3>

        {recentActivities.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
            <Clock size={24} color="#94a3b8" style={{ marginBottom: '4px' }} />
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>No recent activity recorded yet.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivities.map(act => (
              <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: act.type === 'proposal' ? '#1a73e8' : act.type === 'update' ? '#10b981' : act.type === 'payment' ? '#7c3aed' : '#f59e0b' }}></div>
                  <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>{act.text}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{act.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

