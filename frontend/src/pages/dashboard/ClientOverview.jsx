import React from 'react';
import { CreditCard, Clock, Briefcase, CheckCircle, ArrowUpRight, DollarSign, Calendar, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatINR } from '../../utils/currency';
import './Dashboard.css';
import './ClientDashboard.css';

const spendingChartData = [
  { name: 'Jan', projectSpending: 20000, milestonePayments: 15000, completedPayments: 5000 },
  { name: 'Feb', projectSpending: 25000, milestonePayments: 15000, completedPayments: 10000 },
  { name: 'Mar', projectSpending: 35000, milestonePayments: 20000, completedPayments: 15000 },
  { name: 'Apr', projectSpending: 40000, milestonePayments: 25000, completedPayments: 15000 },
  { name: 'May', projectSpending: 45000, milestonePayments: 25000, completedPayments: 20000 },
  { name: 'Jun', projectSpending: 55000, milestonePayments: 30000, completedPayments: 25000 },
  { name: 'Jul', projectSpending: 60000, milestonePayments: 35000, completedPayments: 25000 },
];

const recentPayments = [
  { id: 'PAY-301', freelancer: 'Alex Smith', role: 'Senior UI/UX Designer', avatar: 'https://i.pravatar.cc/150?u=alex', project: 'Modern E-commerce Website Design', milestone: 'Homepage Development', amount: 35000, date: 'Jul 24, 2026', status: 'Released', statusClass: 'released' },
  { id: 'PAY-302', freelancer: 'Sneha Gupta', role: 'Mobile App Developer (Flutter)', avatar: 'https://i.pravatar.cc/150?u=sneha', project: 'Food Delivery App MVP', milestone: 'UI Wireframes & Architecture', amount: 80000, date: 'Jul 15, 2026', status: 'Released', statusClass: 'released' },
  { id: 'PAY-303', freelancer: 'Sneha Gupta', role: 'Mobile App Developer (Flutter)', avatar: 'https://i.pravatar.cc/150?u=sneha', project: 'Food Delivery App MVP', milestone: 'Final Testing & Bug Fixes', amount: 40000, date: 'Jul 20, 2026', status: 'Pending Approval', statusClass: 'pending' },
  { id: 'PAY-304', freelancer: 'Priya Sharma', role: 'Full Stack Node.js Developer', avatar: 'https://i.pravatar.cc/150?u=priya', project: 'Custom Payment Gateway Integration', milestone: 'API Integration & Security', amount: 45000, date: 'Sep 26, 2025', status: 'Released', statusClass: 'released' },
  { id: 'PAY-305', freelancer: 'Alex Smith', role: 'Senior UI/UX Designer', avatar: 'https://i.pravatar.cc/150?u=alex', project: 'Modern E-commerce Website Design', milestone: 'Product Page Wireframes', amount: 25000, date: 'Aug 10, 2026', status: 'Escrow Funded', statusClass: 'escrow' },
];

export default function ClientOverview() {
  const kpiCards = [
    {
      title: 'Total Spending',
      value: formatINR(160000),
      desc: 'Total amount spent on completed and active projects.',
      icon: CreditCard,
      color: 'var(--primary)',
      bg: 'rgba(37, 99, 235, 0.1)'
    },
    {
      title: 'Pending Payments',
      value: formatINR(65000),
      desc: 'Amount waiting for milestone approval or payment release.',
      icon: Clock,
      color: 'var(--warning)',
      bg: 'rgba(245, 158, 11, 0.1)'
    },
    {
      title: 'Active Project Budget',
      value: formatINR(225000),
      desc: 'Budget currently allocated to active projects.',
      icon: Briefcase,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)'
    },
    {
      title: 'Completed Projects',
      value: '12',
      desc: 'Total successfully completed client projects.',
      icon: CheckCircle,
      color: 'var(--success)',
      bg: 'rgba(16, 185, 129, 0.1)'
    }
  ];

  // Budget calculations
  const budgetAllocated = 270000;
  const budgetUsed = 160000;
  const budgetRemaining = budgetAllocated - budgetUsed;
  const usedPercentage = Math.round((budgetUsed / budgetAllocated) * 100);
  const pendingPercentage = Math.round((65000 / budgetAllocated) * 100);

  return (
    <div className="client-dashboard-container">
      {/* Header */}
      <div className="overview-header">
        <div>
          <h1 className="overview-title">Client Workspace Overview</h1>
          <p className="overview-subtitle">Manage your active project budgets, milestone payments, and freelancer hiring.</p>
        </div>
        <select className="date-filter">
          <option>Last 30 Days</option>
          <option>This Year</option>
          <option>All Time</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="client-kpi-grid">
        {kpiCards.map((card, idx) => (
          <div key={idx} className="client-kpi-card">
            <div className="client-kpi-header">
              <span className="client-kpi-title">{card.title}</span>
              <div className="client-kpi-icon-wrapper" style={{ backgroundColor: card.bg }}>
                <card.icon size={22} color={card.color} />
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
              <h2 className="panel-title">Monthly Spending</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Monthly project spending, milestone payments, and completed payments.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.875rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: '600' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'inline-block' }}></span>
                Project Spending
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: '600' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)', display: 'inline-block' }}></span>
                Milestone Payments
              </span>
            </div>
          </div>
          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendingChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="colorMilestones" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => formatINR(val)} />
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <Tooltip 
                  formatter={(value, name) => [
                    formatINR(value), 
                    name === 'projectSpending' ? 'Monthly Project Spending' : 'Milestone Payments'
                  ]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} 
                />
                <Area type="monotone" dataKey="projectSpending" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorSpending)" />
                <Area type="monotone" dataKey="milestonePayments" stroke="var(--success)" strokeWidth={2} fillOpacity={1} fill="url(#colorMilestones)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Payments Section */}
        <div className="recent-payments-section" style={{ gridColumn: '1 / -1' }}>
          <div className="recent-payments-header">
            <div>
              <h2 className="recent-payments-title">Recent Payments</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                Latest transactions and milestone approvals across your active projects.
              </p>
            </div>
            <a href="/client/dashboard/wallet" className="btn btn-outline" style={{ fontSize: '0.875rem', padding: '8px 16px', textDecoration: 'none' }}>
              View All Payments
            </a>
          </div>

          <div className="payments-table-container">
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
                {recentPayments.slice(0, 4).map((pay) => (
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
                    <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{pay.project}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{pay.milestone}</td>
                    <td className="payment-amount">{formatINR(pay.amount)}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{pay.date}</td>
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
          </div>
        </div>
      </div>
    </div>
  );
}
