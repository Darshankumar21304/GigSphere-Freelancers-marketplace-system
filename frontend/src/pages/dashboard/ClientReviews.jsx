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
  
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const tabs = ['All Reviews', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'];

  const parseReview = (rev) => {
    return {
      id: rev._id || rev.id,
      freelancerName: rev.freelancer_id?.name || `${rev.freelancer_id?.firstName || ''} ${rev.freelancer_id?.lastName || ''}`.trim() || rev.freelancerName || 'Freelancer',
      freelancerAvatar: rev.freelancer_id?.avatar || rev.freelancerAvatar || '',
      role: rev.freelancer_id?.title || (rev.freelancer_id?.role === 'freelancer' ? 'Freelancer Specialist' : '') || rev.role || 'Professional',
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
        <div className="page-header">
          <div className="breadcrumb">Dashboard / Reviews</div>
          <h1 className="page-title">Reviews Left For Freelancers</h1>
          <p className="page-desc">Manage the feedback you've given to freelancers and track your hiring satisfaction.</p>
        </div>

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
                        <img src={review.freelancerAvatar} alt={review.freelancerName} className="client-avatar" />
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
                        <span className="skill-chip" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>{review.status}</span>
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
    </div>
  );
}
