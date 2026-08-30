import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, CheckCircle, Clock, XCircle, Search, Filter, 
  MoreVertical, Eye, MessageSquare, Edit2, Trash2, ShieldCheck, FileSearch, Check, X,
  FolderPlus
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { apiFetch } from '../../utils/api';
import './MyProposals.css';

export default function MyProposals() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSubmittedProposals();
  }, []);

  const fetchSubmittedProposals = async () => {
    setIsLoading(true);
    try {
      const fetched = await apiFetch('/proposals/my-proposals').catch(() => []);
      if (Array.isArray(fetched)) {
        setProposals(fetched);
      } else {
        setProposals([]);
      }
    } catch (err) {
      console.error('Error fetching submitted proposals:', err);
      setProposals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProposals = proposals.filter(prop => {
    const matchesStatus = activeStatusFilter === 'All' || (prop.status || 'Pending').toLowerCase() === activeStatusFilter.toLowerCase();
    const title = prop.projectTitle || prop.project?.title || '';
    const client = prop.clientName || prop.client?.name || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || client.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusCount = (status) => {
    if (status === 'All') return proposals.length;
    return proposals.filter(p => (p.status || 'Pending').toLowerCase() === status.toLowerCase()).length;
  };

  return (
    <div className="my-proposals-container" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>My Submitted Proposals</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Track bid statuses, response rates, and client interviews for submitted proposals.</p>
        </div>

        <button 
          onClick={() => navigate('/explore')}
          style={{ padding: '0.65rem 1.4rem', borderRadius: '40px', background: '#1a73e8', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
        >
          Browse Open Marketplace Gigs
        </button>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Total Bids Submitted</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{proposals.length}</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justify: 'center' }}>
            <FileText size={20} />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Pending Review</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{getStatusCount('Pending')}</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justify: 'center' }}>
            <Clock size={20} />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Shortlisted</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{getStatusCount('Shortlisted')}</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f3e8fd', color: '#a142f4', display: 'flex', alignItems: 'center', justify: 'center' }}>
            <FileSearch size={20} />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Accepted & Hired</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{getStatusCount('Accepted')}</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#dcfce7', color: '#10b981', display: 'flex', alignItems: 'center', justify: 'center' }}>
            <CheckCircle size={20} />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Pending', 'Shortlisted', 'Accepted', 'Declined'].map(st => (
            <button 
              key={st}
              onClick={() => setActiveStatusFilter(st)}
              style={{ padding: '6px 16px', borderRadius: '30px', border: activeStatusFilter === st ? '1px solid #1a73e8' : '1px solid #cbd5e1', background: activeStatusFilter === st ? '#e8f0fe' : '#f8fafc', color: activeStatusFilter === st ? '#1a73e8' : '#475569', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
            >
              {st} ({getStatusCount(st)})
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search proposals..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #cbd5e1', borderRadius: '30px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* List / Clean Zero State Container */}
      {filteredProposals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', color: '#64748b' }}>
          <FolderPlus size={48} color="#1a73e8" style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 6px', color: '#0f172a', fontWeight: 800, fontSize: '1.15rem' }}>No Submitted Proposals Found</h3>
          <p style={{ margin: '0 0 20px', fontSize: '0.875rem', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
            You haven't submitted any proposals yet. Explore open client requirements in the marketplace to send your first proposal.
          </p>
          <button 
            onClick={() => navigate('/explore')}
            style={{ padding: '0.65rem 1.4rem', borderRadius: '40px', background: '#1a73e8', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            Explore Gigs Marketplace
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredProposals.map(prop => (
            <div key={prop._id || prop.id} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{prop.projectTitle || 'Project Proposal'}</h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Client: {prop.clientName || 'Client'}</span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981' }}>{formatINR(prop.bidAmount || 0)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
