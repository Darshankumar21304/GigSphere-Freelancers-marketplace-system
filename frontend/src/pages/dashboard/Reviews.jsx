import React, { useState, useEffect } from 'react';
import {
  Star, MessageSquare, ShieldCheck, Award, TrendingUp, ThumbsUp, Search
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import './Reviews.css';

const StarRow = ({ rating, size = 16 }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={size} fill={i < rating ? '#f59e0b' : '#e2e8f0'} color={i < rating ? '#f59e0b' : '#e2e8f0'} />
    ))}
  </div>
);

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [activeRatingFilter, setActiveRatingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const fetched = await apiFetch('/reviews').catch(() => []);
      setReviews(Array.isArray(fetched) ? fetched : []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Real calculated metrics
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews)
    : 0;

  const satisfactionScore = totalReviews > 0
    ? Math.round((reviews.filter(r => r.rating >= 4).length / totalReviews) * 100)
    : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: totalReviews > 0 ? Math.round((reviews.filter(r => r.rating === star).length / totalReviews) * 100) : 0
  }));

  const filteredReviews = reviews.filter(rev => {
    const matchRating = activeRatingFilter === 'all' || rev.rating === parseInt(activeRatingFilter);
    const clientName = rev.reviewer_id?.companyName || rev.reviewer_id?.name || '';
    const matchSearch = !searchQuery || clientName.toLowerCase().includes(searchQuery.toLowerCase())
      || (rev.comment || '').toLowerCase().includes(searchQuery.toLowerCase())
      || (rev.projectTitle || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchRating && matchSearch;
  });

  const kpiCardStyle = {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px',
    padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    transition: 'transform 0.3s, box-shadow 0.3s'
  };

  const iconCircle = (bg, color) => ({
    width: '48px', height: '48px', borderRadius: '50%',
    background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color
  });

  return (
    <div className="reviews-container" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
          Client Reviews & Reputation
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
          Authentic reviews submitted by clients for completed contracts.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={kpiCardStyle}>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Overall Rating</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {totalReviews > 0 ? avgRating.toFixed(1) : '—'}
              {totalReviews > 0 && <Star size={20} fill="#f59e0b" color="#f59e0b" />}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
              {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </div>
          </div>
          <div style={iconCircle('linear-gradient(135deg, #fef3c7, #fde68a)', '#d97706')}>
            <Award size={22} />
          </div>
        </div>

        <div style={kpiCardStyle}>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Total Reviews</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{totalReviews}</div>
          </div>
          <div style={iconCircle('linear-gradient(135deg, #e8f0fe, #c7d7fd)', '#1a73e8')}>
            <MessageSquare size={22} />
          </div>
        </div>

        <div style={kpiCardStyle}>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Satisfaction Score</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: satisfactionScore >= 80 ? '#10b981' : satisfactionScore >= 60 ? '#f59e0b' : '#ef4444', marginTop: '4px' }}>
              {totalReviews > 0 ? `${satisfactionScore}%` : '—'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>4+ star reviews</div>
          </div>
          <div style={iconCircle('linear-gradient(135deg, #dcfce7, #bbf7d0)', '#10b981')}>
            <ThumbsUp size={22} />
          </div>
        </div>

        <div style={kpiCardStyle}>
          <div>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>5-Star Reviews</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>
              {ratingBreakdown.find(r => r.star === 5)?.count || 0}
            </div>
          </div>
          <div style={iconCircle('linear-gradient(135deg, #f3e8fd, #e9d5ff)', '#a142f4')}>
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* Rating Breakdown Chart */}
      {totalReviews > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>Rating Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ratingBreakdown.map(({ star, count, pct }) => (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '60px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>{star}</span>
                  <Star size={13} fill="#f59e0b" color="#f59e0b" />
                </div>
                <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: star >= 4 ? '#10b981' : star === 3 ? '#f59e0b' : '#ef4444', borderRadius: '999px', transition: 'width 0.8s ease' }} />
                </div>
                <span style={{ minWidth: '40px', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{count} ({pct}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by client or keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '999px', border: '1px solid #e2e8f0', fontSize: '0.875rem', background: '#f8fafc', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', '5', '4', '3', '2', '1'].map(f => (
            <button key={f} onClick={() => setActiveRatingFilter(f)} style={{
              padding: '7px 14px', borderRadius: '999px', border: '1px solid',
              borderColor: activeRatingFilter === f ? '#1a73e8' : '#e2e8f0',
              background: activeRatingFilter === f ? '#1a73e8' : '#f8fafc',
              color: activeRatingFilter === f ? '#fff' : '#64748b',
              fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
            }}>
              {f === 'all' ? 'All' : `${f}★`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', border: '2px dashed #e2e8f0', borderRadius: '20px', color: '#64748b' }}>
          <Star size={48} color="#f59e0b" style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 6px', color: '#0f172a', fontWeight: 800, fontSize: '1.15rem' }}>
            {searchQuery || activeRatingFilter !== 'all' ? 'No reviews match your filters' : 'No Reviews Yet'}
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
            When clients submit reviews for completed contracts, they'll appear here with full rating breakdowns.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredReviews.map(rev => {
            const clientName = rev.reviewer_id?.companyName || rev.reviewer_id?.name ||
              `${rev.reviewer_id?.firstName || ''} ${rev.reviewer_id?.lastName || ''}`.trim() || 'Client';
            const avatar = rev.reviewer_id?.avatar
              ? (rev.reviewer_id.avatar.startsWith('http') ? rev.reviewer_id.avatar : `http://localhost:5001${rev.reviewer_id.avatar}`)
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=1a73e8&color=fff`;

            return (
              <div key={rev._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', transition: 'box-shadow 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={avatar} alt={clientName} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                    <div>
                      <h4 style={{ margin: '0 0 2px', fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{clientName}</h4>
                      {rev.projectTitle && (
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#1a73e8', fontWeight: 600 }}>
                          Project: {rev.projectTitle}
                        </p>
                      )}
                      <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                        {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <StarRow rating={rev.rating} />
                </div>

                {(rev.comment || rev.text) && (
                  <p style={{ margin: '14px 0 0', fontSize: '0.9rem', color: '#475569', lineHeight: 1.7, fontStyle: 'italic', borderLeft: '3px solid #e2e8f0', paddingLeft: '16px' }}>
                    "{rev.comment || rev.text}"
                  </p>
                )}

                {rev.response?.text && (
                  <div style={{ marginTop: '12px', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.825rem' }}>
                    <span style={{ fontWeight: 800, color: '#1a73e8', display: 'block', marginBottom: '2px' }}>Freelancer Response:</span>
                    <p style={{ margin: 0, color: '#334155', fontStyle: 'normal' }}>{rev.response.text}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
