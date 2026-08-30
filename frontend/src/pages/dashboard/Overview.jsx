import React from 'react';
import { DollarSign, ShoppingBag, CheckCircle, Clock, Sparkles, FolderPlus, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { formatINR } from '../../utils/currency';
import { getUserProfile } from '../../utils/authUtils';
import './Dashboard.css';

export default function Overview() {
  const userProfile = getUserProfile();
  const userName = userProfile?.name || 'Valued Freelancer';

  const userEarnings = userProfile?.totalEarnings || 0;
  const activeProjectsCount = userProfile?.activeProjectsCount || 0;
  const completedProjectsCount = userProfile?.completedProjectsCount || 0;
  const pendingClearance = userProfile?.pendingClearance || 0;

  const chartData = userProfile?.chartData || [];
  const recentProjects = userProfile?.projects || [];

  const stats = [
    { label: 'Total Earnings', value: formatINR(userEarnings), icon: DollarSign, color: '#10b981', bg: '#dcfce7' },
    { label: 'Active Projects', value: String(activeProjectsCount), icon: ShoppingBag, color: '#1a73e8', bg: '#e8f0fe' },
    { label: 'Completed Projects', value: String(completedProjectsCount), icon: CheckCircle, color: '#a142f4', bg: '#f3e8fd' },
    { label: 'Pending Clearance', value: formatINR(pendingClearance), icon: Clock, color: '#f59e0b', bg: '#fef3c7' },
  ];

  return (
    <div className="client-dashboard-container">
      <div className="overview-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.85rem', background: '#e8f0fe', color: '#1a73e8', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            <Sparkles size={13} /> Verified Freelancer Pro
          </div>
          <h1 className="overview-title">Welcome back, {userName}!</h1>
          <p className="overview-subtitle">Here's your earnings summary, active project contracts, and proposals.</p>
        </div>
        <Link to="/explore" className="pill-btn pill-dark" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem', borderRadius: '40px', background: '#0f172a', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>
          <Search size={16} /> Browse Open Jobs
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="kpi-card">
            <div className="kpi-icon-wrapper" style={{ backgroundColor: stat.bg }}>
              <stat.icon size={22} color={stat.color} />
            </div>
            <div>
              <p className="kpi-label">{stat.label}</p>
              <p className="kpi-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Chart Panel */}
        <div className="dashboard-panel" style={{ gridColumn: '1 / -1' }}>
          <h2 className="panel-title">Earnings Analytics</h2>
          <div style={{ width: '100%', height: '280px', minWidth: 0, minHeight: '280px' }}>
            {chartData.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', border: '1px dashed #cbd5e1', borderRadius: '16px', background: '#f8fafc', color: '#64748b' }}>
                <DollarSign size={36} color="#10b981" style={{ marginBottom: '8px' }} />
                <h4 style={{ margin: '0 0 4px', color: '#0f172a', fontWeight: 800 }}>No Earnings Recorded Yet</h4>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Submit proposals to open client jobs to start earning on GigSphere.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.7}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => formatINR(val)} />
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }} />
                  <Area type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Projects Overview */}
        <div className="dashboard-panel" style={{ gridColumn: '1 / -1' }}>
          <h2 className="panel-title">Active Contracts & Projects</h2>
          <div className="table-container">
            {recentProjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '16px', background: '#f8fafc' }}>
                <FolderPlus size={36} color="#1a73e8" style={{ marginBottom: '10px' }} />
                <h4 style={{ margin: '0 0 6px', color: '#0f172a', fontWeight: 800, fontSize: '1.05rem' }}>No Active Contracts</h4>
                <p style={{ margin: '0 0 16px', fontSize: '0.875rem' }}>Apply for freelance gigs to get hired and receive milestone funds into your wallet.</p>
                <Link to="/explore" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.2rem', borderRadius: '30px', background: '#0f172a', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>
                  <Search size={15} /> Find Freelance Work
                </Link>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Project Name</th>
                    <th>Contract Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects.map((proj, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="client-cell">
                          <img src={proj.clientAvatar || 'https://i.pravatar.cc/150'} className="client-avatar" alt="" />
                          <span className="client-name">{proj.clientName}</span>
                        </div>
                      </td>
                      <td style={{ color: '#0f172a', fontWeight: '600' }}>{proj.title}</td>
                      <td style={{ fontWeight: '700', color: '#0f172a' }}>{formatINR(proj.budget)}</td>
                      <td>
                        <span className={`status-badge ${proj.status === 'Completed' ? 'status-completed' : 'status-progress'}`}>
                          {proj.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
