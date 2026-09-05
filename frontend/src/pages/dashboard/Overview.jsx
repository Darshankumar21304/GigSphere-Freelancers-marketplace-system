import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, CheckCircle, Clock, Sparkles, Search, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { formatINR } from '../../utils/currency';
import { getUserProfile } from '../../utils/authUtils';
import { apiFetch } from '../../utils/api';
import FreelancerAIInsights from '../../components/FreelancerAIInsights';
import './Dashboard.css';

export default function Overview() {
  const userProfile = getUserProfile();
  const userName = userProfile?.name || 'Freelancer';

  const [contractData, setContractData] = useState({
    totalEarnings: 0,
    activeContracts: 0,
    completedContracts: 0,
    chartData: [],
    contracts: []
  });
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [contractsRes, walletRes] = await Promise.allSettled([
          apiFetch('/projects/my-contracts'),
          apiFetch('/wallet/balance')
        ]);

        if (contractsRes.status === 'fulfilled' && contractsRes.value) {
          setContractData(contractsRes.value);
        }
        if (walletRes.status === 'fulfilled' && walletRes.value) {
          setWalletBalance(walletRes.value.walletBalance || walletRes.value.balance || 0);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: 'Total Earnings',
      value: isLoading ? '...' : formatINR(contractData.totalEarnings),
      icon: DollarSign,
      color: '#10b981',
      bg: 'linear-gradient(135deg, #dcfce7, #bbf7d0)'
    },
    {
      label: 'Active Contracts',
      value: isLoading ? '...' : String(contractData.activeContracts),
      icon: ShoppingBag,
      color: '#1a73e8',
      bg: 'linear-gradient(135deg, #e8f0fe, #c7d7fd)'
    },
    {
      label: 'Completed',
      value: isLoading ? '...' : String(contractData.completedContracts),
      icon: CheckCircle,
      color: '#a142f4',
      bg: 'linear-gradient(135deg, #f3e8fd, #e9d5ff)'
    },
    {
      label: 'Wallet Balance',
      value: isLoading ? '...' : formatINR(walletBalance),
      icon: TrendingUp,
      color: '#f59e0b',
      bg: 'linear-gradient(135deg, #fef3c7, #fde68a)'
    }
  ];

  const recentContracts = contractData.contracts?.slice(0, 5) || [];

  return (
    <div className="client-dashboard-container">
      <div className="overview-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.85rem', background: 'linear-gradient(135deg, #e8f0fe, #c7d7fd)', color: '#1a73e8', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            <Sparkles size={13} /> Verified Freelancer Pro
          </div>
          <h1 className="overview-title">Welcome back, {userName}!</h1>
          <p className="overview-subtitle">Here's your earnings summary, active contract status, and AI insights.</p>
        </div>
        <Link to="/freelancer/dashboard/browse-projects" className="pill-btn pill-dark" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem', borderRadius: '40px', background: '#0f172a', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>
          <Search size={16} /> Browse Open Jobs
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="kpi-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="kpi-icon-wrapper" style={{ background: stat.bg }}>
              <stat.icon size={22} color={stat.color} />
            </div>
            <div>
              <p className="kpi-label">{stat.label}</p>
              <p className="kpi-value" style={{ color: isLoading ? '#94a3b8' : '#0f172a' }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Earnings Chart */}
        <div className="dashboard-panel" style={{ gridColumn: '1 / -1' }}>
          <h2 className="panel-title">Earnings Analytics (Last 6 Months)</h2>
          <div style={{ width: '100%', height: '280px', minWidth: 0 }}>
            {contractData.chartData.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', border: '1px dashed #cbd5e1', borderRadius: '16px', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', color: '#64748b' }}>
                <DollarSign size={36} color="#10b981" style={{ marginBottom: '8px' }} />
                <h4 style={{ margin: '0 0 4px', color: '#0f172a', fontWeight: 800 }}>No Completed Contracts Yet</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', textAlign: 'center', maxWidth: '360px' }}>Submit proposals to open client jobs to start earning. Completed contract earnings will appear here.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={contractData.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => formatINR(val)} />
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }}
                    formatter={(val) => [formatINR(val), 'Earnings']}
                  />
                  <Area type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEarnings)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Contracts Table */}
        <div className="dashboard-panel" style={{ gridColumn: '1 / -1' }}>
          <h2 className="panel-title">Active & Recent Contracts</h2>
          <div className="table-container">
            {recentContracts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '16px', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)' }}>
                <ShoppingBag size={36} color="#1a73e8" style={{ marginBottom: '10px' }} />
                <h4 style={{ margin: '0 0 6px', color: '#0f172a', fontWeight: 800 }}>No Active Contracts</h4>
                <p style={{ margin: '0 0 16px', fontSize: '0.875rem' }}>Apply for freelance gigs to get hired and receive milestone payments into your wallet.</p>
                <Link to="/freelancer/dashboard/browse-projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.2rem', borderRadius: '30px', background: '#0f172a', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>
                  <Search size={15} /> Find Freelance Work
                </Link>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Project</th>
                    <th>Contract Value</th>
                    <th>Status</th>
                    <th>Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {recentContracts.map((contract, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="client-cell">
                          <img
                            src={contract.client_id?.avatar || contract.client_id?.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(contract.client_id?.companyName || contract.client_id?.name || 'Client')}&background=1a73e8&color=fff`}
                            className="client-avatar"
                            alt=""
                          />
                          <span className="client-name">{contract.client_id?.companyName || contract.client_id?.name || 'Client'}</span>
                        </div>
                      </td>
                      <td style={{ color: '#0f172a', fontWeight: 600 }}>{contract.title || contract.project_id?.title || 'Project'}</td>
                      <td style={{ fontWeight: 700, color: '#10b981' }}>{formatINR(contract.totalValue)}</td>
                      <td>
                        <span className={`status-badge ${contract.status === 'Completed' ? 'status-completed' : contract.status === 'Cancelled' ? 'status-cancelled' : 'status-progress'}`}>
                          {contract.status}
                        </span>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        {contract.deadline ? new Date(contract.deadline).toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* AI Insights Widget */}
        <div className="dashboard-panel" style={{ gridColumn: '1 / -1' }}>
          <FreelancerAIInsights />
        </div>
      </div>
    </div>
  );
}
