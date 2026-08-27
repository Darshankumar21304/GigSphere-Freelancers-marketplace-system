import React, { useState } from 'react';
import { 
  Download, Plus, CheckCircle, Clock, Calendar, 
  CreditCard, ShieldCheck, Search, Filter, FileText, 
  ArrowUpRight, AlertCircle, CheckSquare
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import './Dashboard.css';
import './ClientDashboard.css';

const allPayments = [
  { 
    id: 'PAY-301', 
    freelancer: 'Alex Smith', 
    role: 'Senior UI/UX Designer', 
    avatar: 'https://i.pravatar.cc/150?u=alex', 
    project: 'Modern E-commerce Website Design', 
    milestone: 'Homepage Development & Design System', 
    amount: 35000, 
    date: 'Jul 24, 2026', 
    status: 'Released', 
    statusClass: 'released',
    invoice: 'INV-1021-A'
  },
  { 
    id: 'PAY-302', 
    freelancer: 'Sneha Gupta', 
    role: 'Mobile App Developer (Flutter)', 
    avatar: 'https://i.pravatar.cc/150?u=sneha', 
    project: 'Food Delivery App MVP', 
    milestone: 'UI Wireframes & Architecture Setup', 
    amount: 80000, 
    date: 'Jul 15, 2026', 
    status: 'Released', 
    statusClass: 'released',
    invoice: 'INV-1030-A'
  },
  { 
    id: 'PAY-303', 
    freelancer: 'Sneha Gupta', 
    role: 'Mobile App Developer (Flutter)', 
    avatar: 'https://i.pravatar.cc/150?u=sneha', 
    project: 'Food Delivery App MVP', 
    milestone: 'Final Testing & Bug Fixes', 
    amount: 40000, 
    date: 'Jul 20, 2026', 
    status: 'Pending Approval', 
    statusClass: 'pending',
    invoice: 'INV-1030-B'
  },
  { 
    id: 'PAY-304', 
    freelancer: 'Priya Sharma', 
    role: 'Full Stack Node.js Developer', 
    avatar: 'https://i.pravatar.cc/150?u=priya', 
    project: 'Custom Payment Gateway Integration', 
    milestone: 'API Integration & Security Hardening', 
    amount: 45000, 
    date: 'Sep 26, 2025', 
    status: 'Released', 
    statusClass: 'released',
    invoice: 'INV-1018-A'
  },
  { 
    id: 'PAY-305', 
    freelancer: 'Alex Smith', 
    role: 'Senior UI/UX Designer', 
    avatar: 'https://i.pravatar.cc/150?u=alex', 
    project: 'Modern E-commerce Website Design', 
    milestone: 'Product Page Wireframes & Mobile UI', 
    amount: 25000, 
    date: 'Aug 10, 2026', 
    status: 'Escrow Funded', 
    statusClass: 'escrow',
    invoice: 'INV-1021-B'
  },
  { 
    id: 'PAY-306', 
    freelancer: 'Alex Smith', 
    role: 'Senior UI/UX Designer', 
    avatar: 'https://i.pravatar.cc/150?u=alex', 
    project: 'Modern E-commerce Website Design', 
    milestone: 'Checkout Flow Optimization', 
    amount: 25000, 
    date: 'Aug 30, 2026', 
    status: 'Upcoming', 
    statusClass: 'upcoming',
    invoice: 'INV-1021-C'
  },
  { 
    id: 'PAY-307', 
    freelancer: 'Rahul Verma', 
    role: 'SEO & Content Strategist', 
    avatar: 'https://i.pravatar.cc/150?u=rahul', 
    project: 'SEO Content Writing for Tech Blog', 
    milestone: 'Keyword Research & Competitor Audit', 
    amount: 10000, 
    date: 'Aug 20, 2026', 
    status: 'Upcoming', 
    statusClass: 'upcoming',
    invoice: 'INV-1022-A'
  }
];

export default function ClientSpending() {
  const [filter, setFilter] = useState('All Payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentsList, setPaymentsList] = useState(allPayments);

  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Visa ending in 4242');
  const [upiId, setUpiId] = useState('');

  // Budget calculations
  const budgetAllocated = 270000;
  const budgetUsed = 160000;
  const budgetRemaining = budgetAllocated - budgetUsed;
  const usedPercentage = Math.round((budgetUsed / budgetAllocated) * 100);
  const pendingPercentage = Math.round((65000 / budgetAllocated) * 100);

  const openReleaseModal = (pay) => {
    setSelectedMilestone(pay);
    setIsReleaseModalOpen(true);
    setIsSuccess(false);
  };

  const confirmRelease = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setPaymentsList(prev => prev.map(p => {
        if (p.id === selectedMilestone.id) {
          return { ...p, status: 'Released', statusClass: 'released', date: 'Just now' };
        }
        return p;
      }));
      setTimeout(() => {
        setIsReleaseModalOpen(false);
        setIsSuccess(false);
      }, 2000);
    }, 1500);
  };

  const confirmAddPaymentMethod = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsAddPaymentModalOpen(false);
        setIsSuccess(false);
      }, 2000);
    }, 1500);
  };

  const filteredPayments = paymentsList.filter(p => {
    const matchesFilter = filter === 'All Payments' || 
      (filter === 'Released' && p.status === 'Released') ||
      (filter === 'Pending Approval' && p.status === 'Pending Approval') ||
      (filter === 'Escrow Funded' && p.status === 'Escrow Funded') ||
      (filter === 'Upcoming' && p.status === 'Upcoming');
    
    const matchesSearch = p.freelancer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.milestone.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="client-dashboard-container">
      {/* Header */}
      <div className="overview-header">
        <div>
          <h1 className="overview-title">Spending & Payment Analytics</h1>
          <p className="overview-subtitle">Manage project investments, release milestone payments, and track transaction history.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Download CSV
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => { setIsAddPaymentModalOpen(true); setIsSuccess(false); }}>
            <Plus size={18} /> Add Payment Method
          </button>
        </div>
      </div>

      {/* Payment Status Summary Cards */}
      <div className="payment-status-grid">
        <div className="payment-status-card released">
          <div className="payment-status-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <CheckCircle size={26} />
          </div>
          <div className="payment-status-content">
            <span className="payment-status-label">Released Payments</span>
            <span className="payment-status-value">{formatINR(160000)}</span>
            <span className="payment-status-sub">Total funds released to hired freelancers</span>
          </div>
        </div>

        <div className="payment-status-card pending">
          <div className="payment-status-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <Clock size={26} />
          </div>
          <div className="payment-status-content">
            <span className="payment-status-label">Pending Payments</span>
            <span className="payment-status-value">{formatINR(65000)}</span>
            <span className="payment-status-sub">Awaiting milestone verification and approval</span>
          </div>
        </div>

        <div className="payment-status-card upcoming">
          <div className="payment-status-icon" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }}>
            <Calendar size={26} />
          </div>
          <div className="payment-status-content">
            <span className="payment-status-label">Upcoming Milestone Payments</span>
            <span className="payment-status-value">{formatINR(110000)}</span>
            <span className="payment-status-sub">Scheduled for ongoing project milestones</span>
          </div>
        </div>
      </div>



      {/* Recent Payments Section */}
      <div className="recent-payments-section">
        <div className="recent-payments-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="recent-payments-title">Recent Payments & Milestone History</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Detailed breakdown of all freelancer payments, escrow funding, and released milestones.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search freelancer, project..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '8px 12px 8px 36px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', outline: 'none' }}
              />
            </div>

            <select 
              className="date-filter" 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All Payments">All Payments</option>
              <option value="Released">Released</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Escrow Funded">Escrow Funded</option>
              <option value="Upcoming">Upcoming</option>
            </select>
          </div>
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
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length > 0 ? (
                filteredPayments.map((pay) => (
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
                        {pay.status === 'Upcoming' && <Calendar size={14} />}
                        {pay.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {pay.status === 'Pending Approval' ? (
                        <button 
                          onClick={() => openReleaseModal(pay)}
                          className="btn btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <CheckSquare size={14} /> Release Payment
                        </button>
                      ) : (
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onClick={() => alert(`Viewing receipt for ${pay.invoice}`)}
                        >
                          <FileText size={14} /> Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    No payment records found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {isAddPaymentModalOpen && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-content">
            {isSuccess ? (
              <div className="payment-success-container">
                <div className="success-icon-circle"><CheckCircle size={40} /></div>
                <h3>Payment Method Added!</h3>
                <p>Your card has been securely linked to your account.</p>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="payment-modal-title">Add Payment Method</h3>
                  <p className="payment-modal-desc">Securely link a credit or debit card for future milestone payments.</p>
                </div>
                <form onSubmit={confirmAddPaymentMethod} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="card-input-group">
                    <label className="card-input-label">Name on Card</label>
                    <input type="text" required placeholder="John Doe" className="card-input-field" />
                  </div>
                  <div className="card-input-group">
                    <label className="card-input-label">Card Number</label>
                    <div style={{ position: 'relative' }}>
                      <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                      <input type="text" required placeholder="0000 0000 0000 0000" className="card-input-field" style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div className="card-row">
                    <div className="card-input-group">
                      <label className="card-input-label">Expiry Date</label>
                      <input type="text" required placeholder="MM/YY" className="card-input-field" />
                    </div>
                    <div className="card-input-group">
                      <label className="card-input-label">CVV</label>
                      <input type="password" required placeholder="123" className="card-input-field" />
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn btn-outline" onClick={() => setIsAddPaymentModalOpen(false)} disabled={isProcessing}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                      {isProcessing ? 'Processing...' : 'Save Card'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Release Payment Modal */}
      {isReleaseModalOpen && selectedMilestone && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-content">
            {isSuccess ? (
              <div className="payment-success-container">
                <div className="success-icon-circle"><CheckCircle size={40} /></div>
                <h3>Payment Released!</h3>
                <p>Funds have been successfully transferred to {selectedMilestone.freelancer}.</p>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="payment-modal-title">Checkout & Release</h3>
                  <p className="payment-modal-desc">Review the milestone details before releasing funds.</p>
                </div>
                
                <div className="invoice-summary-card">
                  <div className="invoice-summary-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Freelancer</span>
                    <span style={{ fontWeight: '500' }}>{selectedMilestone.freelancer}</span>
                  </div>
                  <div className="invoice-summary-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Project</span>
                    <span style={{ fontWeight: '500', textAlign: 'right' }}>{selectedMilestone.project}</span>
                  </div>
                  <div className="invoice-summary-row">
                    <span style={{ color: 'var(--text-secondary)' }}>Milestone</span>
                    <span style={{ fontWeight: '500', textAlign: 'right' }}>{selectedMilestone.milestone}</span>
                  </div>
                  <div className="invoice-summary-row total">
                    <span>Total Amount</span>
                    <span style={{ color: 'var(--success)' }}>{formatINR(selectedMilestone.amount)}</span>
                  </div>
                </div>

                <div className="card-input-group">
                  <label className="card-input-label">Pay With</label>
                  <select 
                    className="card-input-field" 
                    style={{ width: '100%', boxSizing: 'border-box' }}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Visa ending in 4242">Visa ending in 4242</option>
                    <option value="Mastercard ending in 8899">Mastercard ending in 8899</option>
                    <option value="Wallet Balance">Wallet Balance ({formatINR(120000)})</option>
                    <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                  </select>
                </div>

                {paymentMethod === 'UPI' && (
                  <div className="card-input-group" style={{ marginTop: '16px' }}>
                    <label className="card-input-label">Enter UPI ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. yourname@upi" 
                      className="card-input-field" 
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                )}

                <div className="modal-actions">
                  <button className="btn btn-outline" onClick={() => setIsReleaseModalOpen(false)} disabled={isProcessing}>Cancel</button>
                  <button className="btn btn-primary" onClick={confirmRelease} disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : `Pay ${formatINR(selectedMilestone.amount)}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
