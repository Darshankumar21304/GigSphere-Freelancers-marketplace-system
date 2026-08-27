import React, { useState, useEffect } from 'react';
import { Download, ArrowUpRight, ArrowDownLeft, DollarSign, Briefcase, Clock } from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { apiFetch } from '../../utils/api';
import './Wallet.css';

export default function Wallet() {
  const [walletData, setWalletData] = useState({
    balances: { available: 0, pending: 0, escrow: 0 },
    transactions: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const data = await apiFetch('/wallet');
      setWalletData(data);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (walletData.balances.available <= 0) {
      alert('Insufficient funds to withdraw');
      return;
    }
    
    // Simplistic approach for demo: withdraw a set amount or prompt
    const amountStr = prompt(`Enter amount to withdraw (Max: ${walletData.balances.available}):`);
    const amount = Number(amountStr);
    
    if (isNaN(amount) || amount <= 0 || amount > walletData.balances.available) {
      if (amountStr !== null) alert('Invalid amount');
      return;
    }

    setIsWithdrawing(true);
    try {
      await apiFetch('/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount })
      });
      alert('Withdrawal requested successfully');
      fetchWalletData(); // refresh
    } catch (error) {
      console.error('Withdrawal failed:', error);
      alert('Withdrawal failed: ' + error.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="wallet-page animate-fade-in-up">
      <div className="wallet-header">
        <div>
          <h1 className="wallet-title">Wallet & Earnings</h1>
          <p className="wallet-subtitle">Manage your funds, withdrawals, and view transaction history.</p>
        </div>
        <div className="wallet-actions">
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Download CSV
          </button>
        </div>
      </div>

      <div className="wallet-balances">
        <div className="balance-card hover-lift">
          <div className="balance-label"><DollarSign size={16} /> Available Balance</div>
          <div className="balance-amount">{isLoading ? '...' : formatINR(walletData.balances.available)}</div>
          <button 
            className="btn hover-glow" 
            onClick={handleWithdraw}
            disabled={isWithdrawing || walletData.balances.available <= 0}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', width: '100%', border: 'none', transition: 'all 0.3s' }}
          >
            {isWithdrawing ? 'Processing...' : 'Withdraw Funds'}
          </button>
        </div>
        
        <div className="balance-card light hover-lift">
          <div className="balance-label"><Clock size={16} /> Pending Clearance</div>
          <div className="balance-amount">{isLoading ? '...' : formatINR(walletData.balances.pending)}</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Processing transactions</p>
        </div>

        <div className="balance-card light hover-lift">
          <div className="balance-label"><Briefcase size={16} /> In Escrow</div>
          <div className="balance-amount">{isLoading ? '...' : formatINR(walletData.balances.escrow)}</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Secured for active milestones</p>
        </div>
      </div>

      <div className="transaction-history">
        <div className="history-header">
          <h2 className="history-title">Recent Transactions</h2>
          <select className="date-filter">
            <option>All Transactions</option>
            <option>Earnings</option>
            <option>Withdrawals</option>
          </select>
        </div>

        <div className="history-list">
          {isLoading ? (
            <div style={{padding: '20px', textAlign: 'center'}}>Loading transactions...</div>
          ) : walletData.transactions.length === 0 ? (
            <div style={{padding: '20px', textAlign: 'center', color: 'var(--text-muted)'}}>No recent transactions.</div>
          ) : (
            walletData.transactions.map(tx => (
              <div key={tx._id} className="history-item">
                <div className="history-info">
                  <div className={`history-icon ${tx.type}`}>
                    {(tx.type === 'earning' || tx.type === 'refund') ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                  </div>
                  <div className="history-details">
                    <h4>{tx.title}</h4>
                    <p>{new Date(tx.createdAt).toLocaleDateString()} • {tx.status}</p>
                  </div>
                </div>
                <div className={`history-amount ${(tx.type === 'earning' || tx.type === 'refund') ? 'positive' : 'negative'}`}>
                  {(tx.type === 'earning' || tx.type === 'refund') ? '+' : ''}{tx.amount < 0 ? `-${formatINR(Math.abs(tx.amount))}` : formatINR(tx.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

