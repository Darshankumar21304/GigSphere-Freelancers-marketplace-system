import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Filter, List, Grid, MoreVertical, 
  MapPin, Star, ShieldCheck, Clock, Calendar, 
  CheckCircle, Briefcase, CreditCard, ChevronRight,
  MessageSquare, User, FileText, CheckSquare, 
  XOctagon, Navigation, UserCheck
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { apiFetch } from '../../utils/api';
import './HiredFreelancers.css';

export default function HiredFreelancers() {
  const navigate = useNavigate();
  const [hiredFreelancers, setHiredFreelancers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHiredContracts();
  }, []);

  const fetchHiredContracts = async () => {
    setIsLoading(true);
    try {
      const fetchedContracts = await apiFetch('/contracts/hired').catch(() => []);
      if (Array.isArray(fetchedContracts)) {
        setHiredFreelancers(fetchedContracts);
      } else {
        setHiredFreelancers([]);
      }
    } catch (err) {
      console.error('Error fetching hired contracts:', err);
      setHiredFreelancers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFreelancers = hiredFreelancers.filter(item => {
    const name = item.freelancer?.name || item.freelancerName || '';
    const title = item.project?.title || item.projectTitle || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="hired-freelancers-container" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>Hired Freelancers & Active Contracts</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Manage ongoing active project contracts, milestone deliverables, and payments.</p>
        </div>

        <button 
          onClick={() => navigate('/client/dashboard/proposals')}
          style={{ padding: '0.65rem 1.4rem', borderRadius: '40px', background: '#0f172a', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
        >
          View Received Proposals
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Total Hired Freelancers</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{hiredFreelancers.length}</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justify: 'center' }}>
            <UserCheck size={20} />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Active Contracts</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
              {hiredFreelancers.filter(c => (c.status || 'Active') === 'Active').length}
            </div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#dcfce7', color: '#10b981', display: 'flex', alignItems: 'center', justify: 'center' }}>
            <CheckCircle size={20} />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Completed Projects</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
              {hiredFreelancers.filter(c => c.status === 'Completed').length}
            </div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justify: 'center' }}>
            <Briefcase size={20} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search by freelancer or project title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid #cbd5e1', borderRadius: '30px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* List / Clean Zero State */}
      {filteredFreelancers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', color: '#64748b' }}>
          <UserCheck size={48} color="#1a73e8" style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 6px', color: '#0f172a', fontWeight: 800, fontSize: '1.15rem' }}>No Hired Freelancers Yet</h3>
          <p style={{ margin: '0 0 20px', fontSize: '0.875rem', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
            When you accept a proposal and hire a freelancer for your project requirement, their active contract details and milestone progress will appear here.
          </p>
          <button 
            onClick={() => navigate('/client/dashboard/proposals')}
            style={{ padding: '0.65rem 1.4rem', borderRadius: '40px', background: '#1a73e8', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
          >
            Review Project Proposals
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {filteredFreelancers.map(item => (
            <div key={item._id || item.id} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <img src={item.freelancer?.avatar || 'https://i.pravatar.cc/150?img=12'} alt="Freelancer" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ margin: '0 0 2px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{item.freelancer?.name || 'Freelancer'}</h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.project?.title || 'Active Contract'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10b981' }}>{formatINR(item.contract?.amountPaid || item.amount || 0)} Paid</span>
                <button 
                  onClick={() => navigate('/client/dashboard/chat')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '30px', background: '#e8f0fe', color: '#1a73e8', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  <MessageSquare size={14} /> Send Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
