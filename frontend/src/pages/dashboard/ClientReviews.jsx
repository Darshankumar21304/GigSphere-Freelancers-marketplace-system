import React, { useState, useEffect } from 'react';
import { 
  Star, MessageCircle, Search, Shield,
  ChevronLeft, ChevronRight, MessageSquare
} from 'lucide-react';
import './Reviews.css'; // Reusing existing Reviews CSS

const MOCK_FREELANCER_REVIEWS = [
  {
    id: 'REV-1',
    freelancerName: 'Sarah Jenkins',
    freelancerAvatar: 'https://i.pravatar.cc/150?img=9',
    role: 'Full Stack Developer',
    rating: 5,
    date: 'Oct 24, 2023',
    projectTitle: 'E-commerce React Application',
    text: 'Sarah is an absolute professional. She delivered the React application ahead of schedule and the code quality was fantastic. Highly recommend!',
    skills: ['React', 'Redux', 'Tailwind CSS'],
    status: 'Published'
  },
  {
    id: 'REV-2',
    freelancerName: 'David Lee',
    freelancerAvatar: 'https://i.pravatar.cc/150?img=12',
    role: 'UI/UX Designer',
    rating: 4,
    date: 'Sep 12, 2023',
    projectTitle: 'Corporate Website Redesign',
    text: 'Good work overall. There were a few minor bugs in the initial delivery, but they were fixed very quickly. Communication was great.',
    skills: ['Figma', 'UI/UX Design', 'Web Design'],
    status: 'Published'
  }
];

export default function ClientReviews() {
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('All Reviews');
  const [sortOption, setSortOption] = useState('Newest');
  const [isLoading, setIsLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  
  // Submit Review Modal state
  const [showModal, setShowModal] = useState(false);
  const [myProjects, setMyProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const tabs = ['All Reviews', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];

  const parseReview = (rev) => {
    return {
      id: rev._id || rev.id,
      freelancerName: rev.freelancer_id?.name || `${rev.freelancer_id?.firstName || ''} ${rev.freelancer_id?.lastName || ''}`.trim() || rev.freelancerName || 'Freelancer Specialist',
      freelancerAvatar: rev.freelancer_id?.avatar || rev.freelancerAvatar || '',
      role: rev.freelancer_id?.title || (rev.freelancer_id?.role === 'freelancer' ? 'Freelancer Specialist' : '') || rev.role || 'Specialist',
      rating: rev.rating,
      date: rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (rev.date || 'Today'),
      timestamp: rev.createdAt ? new Date(rev.createdAt).getTime() : Date.now(),
      projectTitle: rev.projectTitle || 'Project Delivery',
      text: rev.comment || rev.text || '',
      skills: rev.skills || ['Delivery'],
      status: 'Published'
    };
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const data = await apiFetch('/reviews');
      if (Array.isArray(data)) {
        setReviews(data.map(parseReview));
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching client reviews:', error);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openSubmitModal = async () => {
    setShowModal(true);
    setRating(5);
    setComment('');
    setSelectedProjectId('');
    setLoadingProjects(true);
    try {
      const projectsData = await apiFetch('/projects/my').catch(() => []);
      setMyProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (err) {
      console.error('Error fetching projects for review:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const selectedProj = myProjects.find(p => p._id === selectedProjectId);
      const res = await apiFetch('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          projectId: selectedProjectId,
          projectTitle: selectedProj ? selectedProj.title : undefined,
          rating,
          comment: comment.trim()
        })
      });

      setMsg(res.message || 'Review submitted successfully!');
      setTimeout(() => setMsg(null), 4000);
      setShowModal(false);
      fetchReviews();
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const totalReviews = reviews.length;
  const overallRating = totalReviews > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1) : '0.0';
  
  const distribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const filteredReviews = reviews.filter(r => {
    if (activeTab === 'All Reviews') return true;
    return r.rating === parseInt(activeTab.charAt(0));
  }).sort((a, b) => {
    if (sortOption === 'Highest Rated') return b.rating - a.rating;
    if (sortOption === 'Lowest Rated') return a.rating - b.rating;
    if (sortOption === 'Oldest') return (a.timestamp || 0) - (b.timestamp || 0);
    return (b.timestamp || 0) - (a.timestamp || 0); // Newest
  });

  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage) || 1;
  const displayedReviews = filteredReviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage);

  const StarVisualizer = ({ rating }) => {
    return (
      <div className="stars-small">
        {[1, 2, 3, 4, 5].map(star => (
          <Star key={star} size={14} fill={star <= rating ? "currentColor" : "none"} stroke={star <= rating ? "none" : "currentColor"} />
        ))}
      </div>
    );
  };

  return (
    <div className="gigsphere-freelancer-reviews">
      <div className="reviews-container">
        
        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="breadcrumb">Dashboard / Reviews</div>
            <h1 className="page-title">Reviews Left For Freelancers</h1>
            <p className="page-desc">Manage the feedback you've given to freelancers and track your hiring satisfaction.</p>
          </div>

          <button onClick={openSubmitModal} style={{ padding: '0.65rem 1.4rem', borderRadius: '40px', background: '#0f172a', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={18} fill="#f59e0b" color="#f59e0b" /> Write a Review
          </button>
        </div>

        {msg && (
          <div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
            {msg}
          </div>
        )}

        <div className="dashboard-content">
          
          {/* Sidebar Section */}
          <div className="sidebar-section">
            
            {/* Rating Summary Card */}
            <div className="card">
              <div className="summary-header">
                <div className="overall-rating">
                  {overallRating} <span className="overall-max">/ 5</span>
                </div>
                <div className="stars-large">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} size={24} fill={star <= Math.round(overallRating) ? "currentColor" : "none"} stroke={star <= Math.round(overallRating) ? "none" : "currentColor"} />
                  ))}
                </div>
                <div className="total-reviews">{totalReviews} Reviews Given</div>
              </div>

              <div className="distribution-list">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = distribution[stars];
                  const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  return (
                    <div key={stars} className="dist-row">
                      <div className="dist-label">{stars} Stars</div>
                      <div className="dist-bar-container">
                        <div className="dist-bar-fill" style={{width: `${percent}%`}}></div>
                      </div>
                      <div className="dist-count">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>

          {/* Main Section */}
          <div className="main-section">
            
            {/* Filters */}
            <div className="filters-container">
              <div className="tabs-container">
                {tabs.map(tab => (
                  <button 
                    key={tab}
                    className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <select 
                className="custom-select"
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
              >
                <option>Newest</option>
                <option>Oldest</option>
                <option>Highest Rated</option>
                <option>Lowest Rated</option>
              </select>
            </div>

            {/* Reviews List */}
            <div className="reviews-list">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="card">
                    <div className="skeleton" style={{width: '200px', height: '48px', marginBottom: '16px'}}></div>
                    <div className="skeleton" style={{width: '100%', height: '80px', marginBottom: '12px'}}></div>
                    <div className="skeleton" style={{width: '60%', height: '24px'}}></div>
                  </div>
                ))
              ) : displayedReviews.length > 0 ? (
                displayedReviews.map(review => (
                  <div key={review.id} className="card review-card">
                    
                    <div className="review-header">
                      <div className="client-info">
                        <img src={review.freelancerAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(review.freelancerName) + '&background=1a73e8&color=fff'} alt={review.freelancerName} className="client-avatar" />
                        <div className="client-name-group">
                          <h3 className="client-name">
                            {review.freelancerName}
                          </h3>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{review.role}</span>
                          <div className="review-meta">
                            <StarVisualizer rating={review.rating} />
                            <span className="review-date">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="skill-chip" style={{ backgroundColor: '#10b981', color: 'white' }}>{review.status}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="project-title">{review.projectTitle}</h4>
                      <p className="review-text">{review.text}</p>
                    </div>
                    
                    <div className="review-meta">
                      {review.skills.map(skill => (
                         <span key={skill} className="skill-chip">{skill}</span>
                      ))}
                    </div>

                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <MessageCircle className="empty-icon" size={48} />
                  <h3 className="empty-title">No Reviews Found</h3>
                  <p className="empty-desc">
                    {activeTab === 'All Reviews' 
                      ? 'You have not left any reviews yet. Complete projects to review freelancers!'
                      : `You don't have any reviews matching '${activeTab}'.`}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredReviews.length > reviewsPerPage && (
              <div className="pagination">
                <button 
                  className="page-btn" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button 
                    key={i} 
                    className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button 
                  className="page-btn" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Submit Review Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justify: 'center', zIndex: 99999, padding: '1rem' }} onClick={() => setShowModal(false)}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', maxWidth: '500px', width: '100%', padding: '1.75rem', color: '#0f172a', margin: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fffbeb', display: 'flex', alignItems: 'center', justify: 'center' }}>
                  <Star size={20} color="#d97706" fill="#f59e0b" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Submit Freelancer Review</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Rate & review project delivery</span>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justify: 'center', color: '#64748b', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Select Completed Project *</label>
                {loadingProjects ? (
                  <div style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.85rem', color: '#64748b' }}>Loading projects...</div>
                ) : (
                  <select 
                    value={selectedProjectId} 
                    onChange={(e) => setSelectedProjectId(e.target.value)} 
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', background: '#fff' }}
                    required
                  >
                    <option value="">— Select project —</option>
                    {myProjects.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.title} {p.budget ? `(₹${Number(p.budget).toLocaleString()})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Rating (1 to 5 Stars) *</label>
                <div style={{ display: 'flex', gap: '6px', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star 
                      key={s} 
                      size={28} 
                      onClick={() => setRating(s)} 
                      fill={s <= rating ? "#f59e0b" : "none"} 
                      color={s <= rating ? "#f59e0b" : "#cbd5e1"} 
                      style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
                    />
                  ))}
                  <span style={{ marginLeft: '10px', fontSize: '1rem', fontWeight: 800, color: '#0f172a', alignSelf: 'center' }}>{rating} / 5</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Review Feedback & Comments *</label>
                <textarea 
                  rows={4} 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  placeholder="Share details about freelancer performance, code quality, communication, and overall delivery..."
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: '40px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ padding: '0.65rem 1.5rem', borderRadius: '40px', background: '#0f172a', border: '1px solid #0f172a', color: '#ffffff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}>
                  {submitting ? 'Publishing...' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
