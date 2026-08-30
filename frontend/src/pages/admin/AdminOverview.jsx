import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { formatINR } from '../../utils/currency';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle,
  ShieldAlert
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiFetch('/admin/stats');
      setStats(data.stats);
      setRevenueData(data.revenueData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', color: '#64748b' }}>Loading operational statistics...</div>;
  }

  return (
    <div>
      <div className="admin-header">
        <h1>Operational Analytics</h1>
        <p>Real-time platform metrics, revenue tracking, and account statistics</p>
      </div>

      {/* KPI Minimal Grid */}
      <div className="min-grid-4">
        <div className="min-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats?.totalUsers || 0}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
            {stats?.totalClients} Clients • {stats?.totalFreelancers} Freelancers
          </div>
        </div>

        <div className="min-card">
          <div className="stat-label">Platform GMV</div>
          <div className="stat-value">{formatINR(stats?.totalVolume || 0)}</div>
          <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={14} /> 10% Platform Fee Calculated
          </div>
        </div>

        <div className="min-card">
          <div className="stat-label">Active Listings</div>
          <div className="stat-value">{(stats?.totalProjects || 0) + (stats?.totalGigs || 0)}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
            {stats?.totalProjects} Projects • {stats?.totalGigs} Service Gigs
          </div>
        </div>

        <div className="min-card">
          <div className="stat-label">Active Disputes</div>
          <div className="stat-value">{stats?.activeDisputes || 0}</div>
          <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.5rem' }}>
            Requires admin resolution
          </div>
        </div>
      </div>

      {/* Revenue Growth Chart */}
      <div className="min-card" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 700 }}>Platform Revenue & Financial Growth</h3>
        <div style={{ width: '100%', height: 220, minHeight: 220 }}>
          <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip formatter={(value) => [formatINR(value), 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Status Summary */}
      <div className="min-card">
        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 700 }}>System Health & Security Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 0.85rem', background: '#e6ecf5', borderRadius: '10px', boxShadow: 'inset 2px 2px 5px #c5d0e2, inset -2px -2px 5px #ffffff' }}>
            <CheckCircle color="#15803d" size={18} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>Database Integrity</div>
              <div style={{ fontSize: '0.725rem', color: '#64748b' }}>MongoDB Connection Active</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.65rem 0.85rem', background: '#e6ecf5', borderRadius: '10px', boxShadow: 'inset 2px 2px 5px #c5d0e2, inset -2px -2px 5px #ffffff' }}>
            <ShieldAlert color="#b45309" size={18} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>Blocked Accounts</div>
              <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{stats?.blockedUsers || 0} Accounts Suspended</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
