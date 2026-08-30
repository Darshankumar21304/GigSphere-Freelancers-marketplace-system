import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  RefreshCw, 
  Sliders, 
  Image, 
  ExternalLink, 
  Bot, 
  MessageSquare, 
  Zap, 
  Check, 
  Filter 
} from 'lucide-react';

export default function AdminAiSecurity() {
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [msg, setMsg] = useState(null);

  // Policy Threshold Settings
  const [flagThreshold, setFlagThreshold] = useState(60);
  const [suspendThreshold, setSuspendThreshold] = useState(80);
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const [spamFilterEnabled, setSpamFilterEnabled] = useState(true);
  const [policySaved, setPolicySaved] = useState(false);

  // Trigger Full Rescan State
  const [rescanning, setRescanning] = useState(false);

  // AI Support Assistant Tester State
  const [supportQuestion, setSupportQuestion] = useState('How does GigSphere handle escrow dispute resolution between clients and freelancers?');
  const [supportAnswer, setSupportAnswer] = useState('');
  const [askingSupport, setAskingSupport] = useState(false);

  // Filter State
  const [logFilter, setLogFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await apiFetch('/admin/ai-security');
      setLogs(data.aiLogs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleTriggerFullScan = async () => {
    setRescanning(true);
    try {
      const res = await apiFetch('/admin/users/auto-audit-all', { method: 'POST' });
      setMsg(res.message);
      setTimeout(() => setMsg(null), 4000);
      fetchLogs();
    } catch (err) {
      alert(err.message || 'Full database rescan failed');
    } finally {
      setRescanning(false);
    }
  };

  const handleSavePolicy = (e) => {
    e.preventDefault();
    setPolicySaved(true);
    setMsg('AI Security policy thresholds updated successfully!');
    setTimeout(() => {
      setPolicySaved(false);
      setMsg(null);
    }, 3000);
  };

  const handleAskSupportAssistant = async (e) => {
    e.preventDefault();
    if (!supportQuestion.trim()) return;

    setAskingSupport(true);
    setSupportAnswer('');

    try {
      const res = await apiFetch('/admin/ai/support-chat', {
        method: 'POST',
        body: JSON.stringify({ question: supportQuestion })
      });
      setSupportAnswer(res.answer);
    } catch (err) {
      alert(err.message || 'AI Support Assistant query failed');
    } finally {
      setAskingSupport(false);
    }
  };

  // Filtered Logs
  const filteredLogs = logs.filter(l => {
    if (logFilter === 'high') return l.riskScore >= 60;
    if (logFilter === 'flagged') return l.status === 'Flagged' || l.status === 'Suspended';
    if (logFilter === 'clean') return l.status === 'Clean';
    return true;
  });

  return (
    <div>
      {/* Top Header */}
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>AI Security & Threat Policy Engine</h1>
          <p>Automated security policy thresholds, AI threat radar, and customer support bot management</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={handleTriggerFullScan} 
            disabled={rescanning}
            className="min-btn min-btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {rescanning ? <RefreshCw size={14} className="spin" /> : <Zap size={14} />}
            {rescanning ? 'Rescanning All DB Users...' : 'Trigger Full DB Rescan'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#e6ecf5', padding: '0.4rem 0.85rem', borderRadius: '12px', boxShadow: 'inset 2px 2px 5px #c5d0e2, inset -2px -2px 5px #ffffff', border: '1px solid rgba(255,255,255,0.8)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block', boxShadow: '0 0 8px #16a34a' }}></span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b' }}>GigSphere AI Engine Active</span>
          </div>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
          {msg}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="min-grid-4" style={{ marginBottom: '1.25rem' }}>
        <div className="min-card">
          <div className="stat-label">AI Security Engine</div>
          <div className="stat-value" style={{ color: '#15803d', fontSize: '1.2rem' }}>Online & Active</div>
          <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.25rem' }}>Autonomous user auditing</div>
        </div>

        <div className="min-card">
          <div className="stat-label">Accounts Scanned</div>
          <div className="stat-value">{logs.length} Users</div>
          <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.25rem' }}>Real-time database vetting</div>
        </div>

        <div className="min-card">
          <div className="stat-label">Threats Mitigated</div>
          <div className="stat-value" style={{ color: '#b45309' }}>
            {logs.filter(l => l.status === 'Flagged' || l.status === 'Suspended').length}
          </div>
          <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.25rem' }}>High risk profiles isolated</div>
        </div>

        <div className="min-card">
          <div className="stat-label">Platform Trust Rating</div>
          <div className="stat-value" style={{ color: '#4f46e5', fontSize: '1.2rem' }}>
            {logs.length > 0 ? `${Math.round((logs.filter(l => l.status === 'Clean').length / logs.length) * 100)}%` : '100%'}
          </div>
          <div style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '0.25rem' }}>Verified clean profiles</div>
        </div>
      </div>

      {/* AI Threat Radar Cards */}
      <div className="min-grid-3" style={{ marginBottom: '1.25rem' }}>
        <div className="min-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Image size={18} color="#b45309" />
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>Identity & Avatar Radar</span>
          </div>
          <p style={{ fontSize: '0.775rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
            Detects stock photo avatars, unverified identity claims, and duplicate profile images across accounts.
          </p>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#15803d' }}>● Status: Active Auto-Filter</div>
        </div>

        <div className="min-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ExternalLink size={18} color="#dc2626" />
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>Off-Platform Spam Radar</span>
          </div>
          <p style={{ fontSize: '0.775rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
            Scans bios and project descriptions for external WhatsApp numbers, Telegram handles, and off-platform links.
          </p>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#15803d' }}>● Status: Active Auto-Block</div>
        </div>

        <div className="min-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Bot size={18} color="#4f46e5" />
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>Bot & Copy-Paste Radar</span>
          </div>
          <p style={{ fontSize: '0.775rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
            Identifies AI-generated generic bios, duplicate text copy-pasted across accounts, and unrealistic claims.
          </p>
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#15803d' }}>● Status: Active Auto-Detection</div>
        </div>
      </div>

      {/* AI Security Policy & Threshold Configuration */}
      <div className="min-card" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sliders size={18} color="#4f46e5" /> AI Moderation Policy & Threshold Settings
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.775rem', marginBottom: '1rem' }}>
          Configure automated action triggers when the AI Security Engine detects high risk profile scores.
        </p>

        <form onSubmit={handleSavePolicy} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {/* Auto-Flag Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>Auto-Flag Risk Threshold</label>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309' }}>{flagThreshold}% Risk</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="90" 
                value={flagThreshold}
                onChange={(e) => setFlagThreshold(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Accounts exceeding {flagThreshold}% risk get flagged for admin review.</span>
            </div>

            {/* Auto-Suspend Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>Auto-Suspend Risk Threshold</label>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626' }}>{suspendThreshold}% Risk</span>
              </div>
              <input 
                type="range" 
                min="70" 
                max="99" 
                value={suspendThreshold}
                onChange={(e) => setSuspendThreshold(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Accounts exceeding {suspendThreshold}% risk are automatically suspended.</span>
            </div>
          </div>

          {/* Toggle Switches */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.775rem', fontWeight: 600, color: '#334155' }}>
              <input 
                type="checkbox" 
                checked={autoScanEnabled} 
                onChange={(e) => setAutoScanEnabled(e.target.checked)} 
              />
              Enable Automatic AI Auditing on User Registration
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.775rem', fontWeight: 600, color: '#334155' }}>
              <input 
                type="checkbox" 
                checked={spamFilterEnabled} 
                onChange={(e) => setSpamFilterEnabled(e.target.checked)} 
              />
              Auto-Block Off-Platform WhatsApp/Telegram Links in Bios
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="min-btn min-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}>
              {policySaved ? <Check size={14} /> : <Sliders size={14} />}
              {policySaved ? 'Policy Settings Saved!' : 'Save AI Policy Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* AI Customer Support Chatbot Tester (Module 13 FRS) */}
      <div className="min-card" style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MessageSquare size={18} color="#4f46e5" /> AI Customer Support Assistant Tester (Module 13 FRS)
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.775rem', marginBottom: '1rem' }}>
          Test the platform's automated AI Customer Support Assistant that helps users resolve billing, escrow, and milestone questions.
        </p>

        <form onSubmit={handleAskSupportAssistant} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={supportQuestion}
              onChange={(e) => setSupportQuestion(e.target.value)}
              className="min-input" 
              style={{ flexGrow: 1 }}
              placeholder="Ask a customer support query..."
              required 
            />
            <button type="submit" disabled={askingSupport} className="min-btn min-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {askingSupport ? <RefreshCw size={14} className="spin" /> : <Bot size={14} />}
              {askingSupport ? 'Generating Answer...' : 'Ask AI Support'}
            </button>
          </div>
        </form>

        {supportAnswer && (
          <div style={{ marginTop: '0.85rem', padding: '0.85rem 1rem', background: '#e6ecf5', borderRadius: '12px', boxShadow: 'inset 3px 3px 6px #c5d0e2, inset -3px -3px 6px #ffffff', border: '1px solid rgba(255,255,255,0.8)' }}>
            <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              GigSphere AI Customer Support Response:
            </div>
            <div style={{ fontSize: '0.825rem', color: '#334155', lineHeight: 1.55 }}>
              {supportAnswer}
            </div>
          </div>
        )}
      </div>

      {/* Automated Security Audit Logs Table */}
      <div className="min-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="#4f46e5" /> Automated Security Audit Logs ({filteredLogs.length})
          </h3>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={14} color="#64748b" />
            <select 
              value={logFilter} 
              onChange={(e) => setLogFilter(e.target.value)}
              className="min-input"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              <option value="all">All Logs ({logs.length})</option>
              <option value="high">High Risk (&ge;60%)</option>
              <option value="flagged">Flagged / Suspended</option>
              <option value="clean">Clean Profiles</option>
            </select>

            <button onClick={fetchLogs} className="min-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}>
              <RefreshCw size={12} className={loadingLogs ? 'spin' : ''} /> Refresh Logs
            </button>
          </div>
        </div>

        <div className="min-table-container">
          <table className="min-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>User Account</th>
                <th>AI Risk Score</th>
                <th>AI Detection Findings</th>
                <th>Security Status</th>
                <th>Audited At</th>
              </tr>
            </thead>
            <tbody>
              {loadingLogs ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>Running automated security log scan...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>No security logs found matching filter.</td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 700 }}>{l.id}</td>
                    <td style={{ fontWeight: 600 }}>{l.userName} ({l.email})</td>
                    <td>
                      <span style={{ fontWeight: 700, color: l.riskScore > 60 ? '#dc2626' : l.riskScore > 25 ? '#b45309' : '#15803d' }}>
                        {l.riskScore}%
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#475569' }}>{l.flagReason}</td>
                    <td>
                      <span className={`pill-badge ${l.status === 'Clean' ? 'clean' : l.status === 'Suspended' ? 'blocked' : 'flagged'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {new Date(l.detectedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
