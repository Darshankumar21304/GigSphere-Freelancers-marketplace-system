import React, { useState, useEffect } from 'react';
import { 
  Star, MessageCircle, ShieldCheck, Search,
  ChevronLeft, ChevronRight, MessageSquare, Award
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import './Reviews.css';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [activeRatingFilter, setActiveRatingFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const fetched = await apiFetch('/reviews').catch(() => []);
      if (Array.isArray(fetched)) {
        setReviews(fetched);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReviews = reviews.filter(rev => {
    if (activeRatingFilter === 'all') return true;
    return rev.rating === parseInt(activeRatingFilter);
  });

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  return (
    <div className="reviews-container" style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>Client Reviews & Rating Summary</h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Review ratings and feedback submitted for completed contracts.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Overall Rating</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {avgRating} <Star size={20} fill="#f59e0b" color="#f59e0b" />
            </div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justify: 'center' }}>
            <Award size={20} />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Total Reviews</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{reviews.length}</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#e8f0fe', color: '#1a73e8', display: 'flex', alignItems: 'center', justify: 'center' }}>
            <MessageSquare size={20} />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>Satisfaction Score</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>100%</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#dcfce7', color: '#10b981', display: 'flex', alignItems: 'center', justify: 'center' }}>
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      {/* List / Clean Zero State */}
      {filteredReviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '16px', color: '#64748b' }}>
          <Star size={48} color="#f59e0b" style={{ marginBottom: '12px' }} />
          <h3 style={{ margin: '0 0 6px', color: '#0f172a', fontWeight: 800, fontSize: '1.15rem' }}>No Reviews Submitted Yet</h3>
          <p style={{ margin: '0', fontSize: '0.875rem', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
            When contracts are marked complete and clients submit ratings & feedback, they will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredReviews.map(rev => (
            <div key={rev._id || rev.id} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{rev.clientName || 'Client'}</h4>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < rev.rating ? '#f59e0b' : '#e2e8f0'} color={i < rev.rating ? '#f59e0b' : '#e2e8f0'} />
                  ))}
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569' }}>{rev.text || rev.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
