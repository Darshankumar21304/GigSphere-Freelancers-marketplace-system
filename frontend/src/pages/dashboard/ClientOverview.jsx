import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, Briefcase, CheckCircle, ShieldCheck, Plus, Sparkles, TrendingUp, FolderPlus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { formatINR } from '../../utils/currency';
import { getUserProfile } from '../../utils/authUtils';
import { apiFetch } from '../../utils/api';
import './Dashboard.css';
import './ClientDashboard.css';

export default function ClientOverview() {
  const [profileData, setProfileData] = useState({
    walletBalance: 0,
    escrowBalance: 0,
    activeProjectsCount: 0,
    completedProjectsCount: 0,
    payments: [],
    chartData: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const userProfile = getUserProfile();
  const userName = userProfile?.name || 'Valued Client';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // 1. Fetch wallet details (balances & transactions)
        const wallet = await apiFetch('/wallet').catch(() => ({ walletBalance: 0, escrowBalance: 0, transactions: [] }));
        
        // 2. Fetch projects count
        const projects = await apiFetch('/projects').catch(() => []);
        const activeCount = projects.filter(p => p.status === 'Open' || p.status === 'In Progress').length;
        const completedCount = projects.filter(p => p.status === 'Completed').length;

        // 3. Generate chart data from last 6 months transaction history
        const monthlyData = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const currentMonthIdx = new Date().getMonth();
        for (let i = 5; i >= 0; i--) {
          const mIdx = (currentMonthIdx - i + 12) % 12;
          monthlyData[months[mIdx]] = { name: months[mIdx], projectSpending: 0, milestonePayments: 0 };
        }

        if (wallet.transactions && Array.isArray(wallet.transactions)) {
          wallet.transactions.forEach(t => {
            const date = new Date(t.createdAt);
            const mName = months[date.getMonth()];
            if (monthlyData[mName]) {
              const amount = Math.abs(t.amount || 0);
              if (t.type === 'deposit') {
                monthlyData[mName].projectSpending += amount;
              } else if (t.type === 'escrow_fund' || t.type === 'escrow_release') {
                monthlyData[mName].milestonePayments += amount;
              }
            }
          });
        }

        setProfileData({
          walletBalance: wallet.walletBalance || 0,
          escrowBalance: wallet.escrowBalance || 0,
          activeProjectsCount: activeCount,
          completedProjectsCount: completedCount,
          payments: wallet.transactions || [],
          chartData: Object.values(monthlyData)
        });
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const kpiCards = [
    {
      title: 'Total Wallet Balance',
      value: formatINR(profileData.walletBalance),
      desc: 'Available for instant escrow funding.',
      icon: CreditCard,
      color: '#1a73e8',
      bg: '#e8f0fe'
    },
    {
      title: 'Escrow Vault Locked',
      value: formatINR(profileData.escrowBalance),
      desc: 'Secured funds locked for active milestones.',
      icon: ShieldCheck,
      color: '#10b981',
      bg: '#dcfce7'
    },
    {
      title: 'Active Projects',
      value: String(profileData.activeProjectsCount),
      desc: 'Projects currently accepting freelancer bids.',
      icon: Briefcase,
      color: '#a142f4',
      bg: '#f3e8fd'
    },
    {
      title: 'Completed Hirings',
      value: String(profileData.completedProjectsCount),
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
            {profileData.chartData.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', border: '1px dashed #cbd5e1', borderRadius: '16px', background: '#f8fafc', color: '#64748b' }}>
                <TrendingUp size={36} color="#1a73e8" style={{ marginBottom: '8px' }} />
                <h4 style={{ margin: '0 0 4px', color: '#0f172a', fontWeight: 800 }}>No Analytics Data Recorded</h4>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Analytics will generate automatically once you post a project and fund milestone escrow.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <AreaChart data={profileData.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            {profileData.payments.length === 0 ? (
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
                    <th>Transaction Details</th>
                    <th>Type</th>
                    <th>Reference / Method</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {profileData.payments.map((pay) => (
                    <tr key={pay._id || pay.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%', 
                            background: pay.type === 'deposit' ? '#e2fbe8' : pay.type === 'withdrawal' ? '#ffebe8' : '#e8f0fe',
                            color: pay.type === 'deposit' ? '#15803d' : pay.type === 'withdrawal' ? '#d92727' : '#1a73e8',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            {pay.type === 'deposit' ? <ArrowDownLeft size={16} /> : pay.type === 'withdrawal' ? <ArrowUpRight size={16} /> : <Briefcase size={16} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.85rem' }}>{pay.title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ref: {pay.razorpayPaymentId || pay.razorpayOrderId || pay._id || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: '700', color: '#475569', fontSize: '0.825rem', textTransform: 'capitalize' }}>{pay.type || 'payment'}</td>
                      <td style={{ color: '#64748b', fontSize: '0.825rem' }}>{pay.paymentMethod || 'Wallet Transfer'}</td>
                      <td style={{ 
                        fontWeight: '800', 
                        fontSize: '0.85rem',
                        color: pay.amount > 0 ? '#10b981' : '#f87171' 
                      }}>
                        {pay.amount > 0 ? '+' : ''}{formatINR(pay.amount)}
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.825rem' }}>
                        {new Date(pay.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: 800, 
                          padding: '3px 8px', 
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          background: pay.status === 'completed' ? '#dcfce7' : pay.status === 'pending' ? '#fef3c7' : '#f1f5f9',
                          color: pay.status === 'completed' ? '#15803d' : pay.status === 'pending' ? '#b45309' : '#64748b'
                        }}>
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
