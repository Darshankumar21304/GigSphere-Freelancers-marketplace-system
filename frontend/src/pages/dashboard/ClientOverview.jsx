import React from 'react';
import { CreditCard, Clock, Briefcase, CheckCircle, ShieldCheck, Plus, Sparkles, TrendingUp, FolderPlus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { formatINR } from '../../utils/currency';
import { getUserProfile } from '../../utils/authUtils';
import './Dashboard.css';
import './ClientDashboard.css';

export default function ClientOverview() {
  const userProfile = getUserProfile();
  const userName = userProfile?.name || 'Valued Client';

  // Real user data only (0 hardcoded bogus payments or fake projects)
  const userPayments = userProfile?.payments || [];
  const chartData = userProfile?.chartData || [];

  const kpiCards = [
    {
      title: 'Total Wallet Balance',
      value: formatINR(userProfile?.walletBalance || 0),
      desc: 'Available for instant escrow funding.',
      icon: CreditCard,
      color: '#1a73e8',
      bg: '#e8f0fe'
    },
    {
      title: 'Escrow Vault Locked',
      value: formatINR(userProfile?.escrowBalance || 0),
      desc: 'Secured funds locked for active milestones.',
      icon: ShieldCheck,
      color: '#10b981',
      bg: '#dcfce7'
    },
    {
      title: 'Active Projects',
      value: String(userProfile?.activeProjectsCount || 0),
      desc: 'Projects currently accepting freelancer bids.',
      icon: Briefcase,
      color: '#a142f4',
      bg: '#f3e8fd'
    },
    {
      title: 'Completed Hirings',
      value: String(userProfile?.completedProjectsCount || 0),
      desc: 'Successfully delivered client projects.',
      icon: CheckCircle,
      color: '#f59e0b',
      bg: '#fef3c7'
    }
  ];

  return (
    <div className="client-dashboard-container">
      {/* Header */}
      <div className="overview-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.85rem', background: '#e8f0fe', color: '#1a73e8', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            <Sparkles size={13} /> Verified Client Account
          </div>
          <h1 className="overview-title">Welcome, {userName}!</h1>
          <p className="overview-subtitle">Manage your project budgets, milestone payments, and freelancer hiring.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/client/dashboard/post-project" className="pill-btn pill-dark" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem', borderRadius: '40px', background: '#0f172a', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>
            <Plus size={16} /> Post a Project
          </Link>
          <Link to="/client/dashboard/wallet" className="pill-btn pill-light" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem', borderRadius: '40px', background: '#e8f0fe', color: '#1a73e8', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem', border: '1px solid #bfdbfe' }}>
            <CreditCard size={16} /> Deposit Funds
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="client-kpi-grid">
        {kpiCards.map((card, idx) => (
          <div key={idx} className="client-kpi-card">
            <div className="client-kpi-header">
              <span className="client-kpi-title">{card.title}</span>
              <div className="client-kpi-icon-wrapper" style={{ backgroundColor: card.bg }}>
                <card.icon size={20} color={card.color} />
              </div>
            </div>
            <p className="client-kpi-value">{card.value}</p>
            <p className="client-kpi-desc">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Spending Analytics Chart */}
        <div className="dashboard-panel" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 className="panel-title" style={{ margin: 0 }}>Monthly Escrow Analytics</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                Track project spending and secured milestone payments over time.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1a73e8', fontWeight: '700' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#1a73e8', display: 'inline-block' }}></span>
                Project Spending
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: '700' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                Milestone Payments
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: '280px', minWidth: 0, minHeight: '280px' }}>
            {chartData.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', border: '1px dashed #cbd5e1', borderRadius: '16px', background: '#f8fafc', color: '#64748b' }}>
                <TrendingUp size={36} color="#1a73e8" style={{ marginBottom: '8px' }} />
                <h4 style={{ margin: '0 0 4px', color: '#0f172a', fontWeight: 800 }}>No Analytics Data Recorded</h4>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Analytics will generate automatically once you post a project and fund milestone escrow.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.7}/>
                      <stop offset="95%" stopColor="#1a73e8" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="colorMilestones" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.7}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => formatINR(val)} />
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatINR(value), 
                      name === 'projectSpending' ? 'Monthly Project Spending' : 'Milestone Payments'
                    ]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' }} 
                  />
                  <Area type="monotone" dataKey="projectSpending" stroke="#1a73e8" strokeWidth={2} fillOpacity={1} fill="url(#colorSpending)" />
                  <Area type="monotone" dataKey="milestonePayments" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMilestones)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Transactions Section */}
        <div className="recent-payments-section" style={{ gridColumn: '1 / -1' }}>
          <div className="recent-payments-header">
            <div>
              <h2 className="recent-payments-title">Recent Transactions & Milestones</h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                Latest transactions and milestone approvals across your active contracts.
              </p>
            </div>
            <Link to="/client/dashboard/wallet" className="pill-btn" style={{ fontSize: '0.85rem', padding: '6px 16px', textDecoration: 'none', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', borderRadius: '30px', fontWeight: 700 }}>
              View Wallet Vault
            </Link>
          </div>

          <div className="payments-table-container">
            {userPayments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '16px', background: '#f8fafc' }}>
                <FolderPlus size={38} color="#1a73e8" style={{ marginBottom: '10px' }} />
                <h4 style={{ margin: '0 0 6px', color: '#0f172a', fontWeight: 800, fontSize: '1.05rem' }}>No Transactions Yet</h4>
                <p style={{ margin: '0 0 16px', fontSize: '0.875rem' }}>Post your first project or deposit funds into your Escrow Vault to get started.</p>
                <Link to="/client/dashboard/post-project" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.2rem', borderRadius: '30px', background: '#0f172a', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem' }}>
                  <Plus size={15} /> Create Your First Project
                </Link>
              </div>
            ) : (
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>Freelancer Name</th>
                    <th>Project Name</th>
                    <th>Milestone Name</th>
                    <th>Payment Amount</th>
                    <th>Payment Date</th>
                    <th>Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userPayments.map((pay) => (
                    <tr key={pay.id}>
                      <td>
                        <div className="freelancer-cell">
                          <img src={pay.avatar} alt={pay.freelancer} className="freelancer-avatar-small" />
                          <div>
                            <div className="freelancer-info-name">{pay.freelancer}</div>
                            <div className="freelancer-info-role">{pay.role}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: '600', color: '#0f172a' }}>{pay.project}</td>
                      <td style={{ color: '#64748b' }}>{pay.milestone}</td>
                      <td className="payment-amount">{formatINR(pay.amount)}</td>
                      <td style={{ color: '#64748b' }}>{pay.date}</td>
                      <td>
                        <span className={`payment-status-badge ${pay.statusClass}`}>
                          {pay.status === 'Released' && <CheckCircle size={14} />}
                          {pay.status === 'Pending Approval' && <Clock size={14} />}
                          {pay.status === 'Escrow Funded' && <ShieldCheck size={14} />}
                          {pay.status}
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
