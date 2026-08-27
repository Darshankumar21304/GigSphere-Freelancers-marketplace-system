import React from 'react';
import { DollarSign, ShoppingBag, CheckCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINR } from '../../utils/currency';
import './Dashboard.css';

const chartData = [
  { name: 'Jan', earnings: 40000 },
  { name: 'Feb', earnings: 30000 },
  { name: 'Mar', earnings: 20000 },
  { name: 'Apr', earnings: 27800 },
  { name: 'May', earnings: 18900 },
  { name: 'Jun', earnings: 23900 },
  { name: 'Jul', earnings: 34900 },
];

export default function Overview() {
  const stats = [
    { label: 'Total Earnings', value: formatINR(1245000), icon: DollarSign, color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Active Projects', value: '8', icon: ShoppingBag, color: 'var(--primary)', bg: 'rgba(37, 99, 235, 0.1)' },
    { label: 'Completed Projects', value: '142', icon: CheckCircle, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    { label: 'Pending Clearance', value: formatINR(84000), icon: Clock, color: 'var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' },
  ];

  return (
    <div>
      <div className="overview-header">
        <div>
          <h1 className="overview-title">Dashboard Overview</h1>
          <p className="overview-subtitle">Welcome back, Sarah! Here's what's happening with your business today.</p>
        </div>
        <select className="date-filter">
          <option>Last 30 Days</option>
          <option>This Year</option>
          <option>All Time</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="kpi-card">
            <div className="kpi-icon-wrapper" style={{ backgroundColor: stat.bg }}>
              <stat.icon size={28} color={stat.color} />
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
        <div className="dashboard-panel">
          <h2 className="panel-title">Earnings Overview</h2>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => formatINR(val)} />
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Area type="monotone" dataKey="earnings" stroke="var(--primary)" fillOpacity={1} fill="url(#colorEarnings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* To Do List */}
        <div className="dashboard-panel">
          <h2 className="panel-title">To-Do List</h2>
          <ul className="todo-list">
            <li className="todo-item">
              <input type="checkbox" className="todo-checkbox" />
              <div>
                <p className="todo-title">Deliver Order #1209</p>
                <p className="todo-meta urgent">Due in 5 hours</p>
              </div>
            </li>
            <li className="todo-item">
              <input type="checkbox" className="todo-checkbox" />
              <div>
                <p className="todo-title">Reply to John Doe</p>
                <p className="todo-meta">Unread message</p>
              </div>
            </li>
            <li className="todo-item">
              <input type="checkbox" className="todo-checkbox" />
              <div>
                <p className="todo-title">Update Profile Portfolio</p>
                <p className="todo-meta">Optional</p>
              </div>
            </li>
            <li className="todo-item">
              <input type="checkbox" className="todo-checkbox" />
              <div>
                <p className="todo-title">Review new proposal</p>
                <p className="todo-meta">Client: Acme Corp</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Recent Projects Overview */}
        <div className="dashboard-panel" style={{ gridColumn: '1 / -1' }}>
          <h2 className="panel-title">Recent Projects</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Project</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((item) => (
                  <tr key={item}>
                    <td>
                      <div className="client-cell">
                        <img src={`https://i.pravatar.cc/150?img=${item + 20}`} className="client-avatar" alt="" />
                        <span className="client-name">Client {item}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>Logo Design for Startup</td>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{formatINR(15000)}</td>
                    <td>
                      <span className={`status-badge ${item === 1 ? 'status-completed' : 'status-progress'}`}>
                        {item === 1 ? 'Completed' : 'In Progress'}
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
