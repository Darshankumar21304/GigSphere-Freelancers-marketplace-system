import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiFetch } from '../utils/api';
import { getCleanAvatar } from '../utils/avatarUtils';
import { 
  Filter, 
  Search,
  MapPin,
  Star,
  CheckCircle,
  LayoutGrid,
  List,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  X,
  Users
} from 'lucide-react';
import './BrowseProjects.css'; // Reusing the same CSS for consistent layout
import AuthModal from '../components/AuthModal';
import FreelancerProfileModal from '../components/FreelancerProfileModal';

const MOCK_SKILLS = [
  'All Skills',
  'React',
  'Node.js',
  'UI/UX Design',
  'Graphic Design',
  'Digital Marketing',
  'Content Writing',
  'Data Science'
];

export default function Freelancers() {
  const navigate = useNavigate();
  const [freelancers, setFreelancers] = useState([]);
  const [activeSkill, setActiveSkill] = useState('All Skills');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Fetch freelancers from backend
  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const data = await apiFetch('/users/freelancers');
        setFreelancers(data);
      } catch (error) {
        console.error('Error fetching freelancers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFreelancers();
  }, []);

  const handleOpenProfile = (fl) => {
    const profileData = fl.profile || {};
    setSelectedFreelancer({
      ...fl,
      ...profileData,
      _id: fl._id || fl.id,
      name: fl.name,
      title: profileData.title || fl.title || 'Freelance Specialist',
      bio: profileData.bio || fl.bio || 'Ready to work on amazing projects.',
      skills: profileData.skills || fl.skills || [],
      hourlyRate: profileData.hourlyRate || fl.hourlyRate || 1500,
      avatar: fl.profilePhoto || fl.avatar,
      rating: fl.rating || profileData.rating || 5.0,
      numReviews: fl.numReviews || fl.reviewCount || 1,
      portfolioItems: profileData.portfolioItems || [],
      workExperience: profileData.workExperience || [],
      certifications: profileData.certifications || []
    });
    setIsProfileModalOpen(true);
  };

  const handleOpenAuth = () => {
    setShowAuthModal(true);
  };



  const toggleSave = (e, id) => {
    e.preventDefault();
  };

  const SidebarContent = () => (
    <>
      <div className="drawer-header lg:hidden">
        <h2 className="filter-title" style={{marginBottom: 0}}>Filters</h2>
        <button className="close-drawer-btn" onClick={() => setIsFilterOpen(false)}>
          <X size={24} />
        </button>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Category</h3>
        <div className="custom-select-wrapper">
          <select className="custom-select">
            <option>All Categories</option>
            <option>Development & IT</option>
            <option>Design & Creative</option>
            <option>Sales & Marketing</option>
            <option>Writing & Translation</option>
          </select>
        </div>
      </div>
      
      <div className="filter-section">
        <h3 className="filter-title">Hourly Rate</h3>
        {['Any Rate', 'Under ₹500/hr', '₹500 - ₹1000/hr', '₹1000+/hr'].map(rate => (
          <label key={rate} className="custom-radio">
            <input type="radio" name="hourlyRate" defaultChecked={rate === 'Any Rate'} />
            {rate}
          </label>
        ))}
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Job Success</h3>
        {['Any Job Success', '90% & Up', '80% & Up'].map(success => (
          <label key={success} className="custom-radio">
            <input type="radio" name="jobSuccess" defaultChecked={success === 'Any Job Success'} />
            {success}
          </label>
        ))}
      </div>

      <div className="filter-section">
        <h3 className="filter-title">English Level</h3>
        {['Any Level', 'Basic', 'Conversational', 'Fluent', 'Native/Bilingual'].map(level => (
          <label key={level} className="custom-checkbox">
            <input type="checkbox" />
            {level}
          </label>
        ))}
      </div>

      <div className="filter-actions">
        <button className="btn-clear" onClick={() => {}}>Clear All</button>
        <button className="btn-apply" onClick={() => setIsFilterOpen(false)}>Apply Filters</button>
      </div>
    </>
  );

  return (
    <div className="gigsphere-freelancer-browse-projects">
      <div className="browse-container">
        
        <div className="page-header">
          <div>
            <div className="breadcrumb">Dashboard / Browse Freelancers</div>
            <h1 className="page-title">Browse Freelancers</h1>
            <p className="page-description">Find the perfect talent for your next project.</p>
          </div>
          <button className="saved-projects-btn">
            <Bookmark size={18} />
            Saved Freelancers
          </button>
        </div>

        <div className="search-section">
          <div className="search-input-group">
            <div className="search-wrapper">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search by name, skill, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="search-btn">Search Talent</button>
            <button className="mobile-filter-btn" onClick={() => setIsFilterOpen(true)}>
              <Filter size={20} />
              Filters
            </button>
          </div>
          
          <div className="category-chips">
            {MOCK_SKILLS.map(skill => (
               <button 
                key={skill} 
                className={`chip ${activeSkill === skill ? 'active' : ''}`}
                onClick={() => setActiveSkill(skill)}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="content-layout">
          
          <aside className="filter-sidebar">
            <SidebarContent />
          </aside>

          <div className={`filter-drawer-overlay ${isFilterOpen ? 'open' : ''}`} onClick={() => setIsFilterOpen(false)}>
            <div className="filter-drawer" onClick={e => e.stopPropagation()}>
              <SidebarContent />
            </div>
          </div>

          <main className="results-area">
            
            <div className="results-toolbar">
              <div className="results-count">
                Showing <strong>{freelancers.length}</strong> freelancers found
              </div>
              
              <div className="toolbar-actions">
                <div className="sort-dropdown">
                  Sort By: 
                  <div className="custom-select-wrapper" style={{display: 'inline-block', width: '160px'}}>
                    <select className="custom-select" style={{padding: '8px 12px'}}>
                      <option>Best Match</option>
                      <option>Highest Rated</option>
                      <option>Hourly Rate: Low to High</option>
                    </select>
                  </div>
                </div>
                
                <div className="view-toggle">
                  <button 
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} 
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button 
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} 
                    onClick={() => setViewMode('list')}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className={`projects-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="project-card" style={{height: '350px'}}>
                    <div className="skeleton" style={{width: '60%', height: '24px', marginBottom: '16px'}}></div>
                    <div className="skeleton" style={{width: '40%', height: '16px', marginBottom: '24px'}}></div>
                    <div className="skeleton" style={{width: '100%', height: '80px', marginBottom: '24px'}}></div>
                    <div className="skeleton" style={{width: '100%', height: '100%', flex: 1}}></div>
                  </div>
                ))}
              </div>
            ) : freelancers.length > 0 ? (
              <>
                <div className={`projects-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                  {freelancers.map(freelancer => (
                    <div key={freelancer._id} className="project-card">
                      
                      <div className="card-header" style={{alignItems: 'center'}}>
                        <div style={{display: 'flex', gap: '16px', alignItems: 'center', cursor: 'pointer'}} onClick={() => handleOpenProfile(freelancer)}>
                          <img src={getCleanAvatar(freelancer.avatar || freelancer.profilePhoto, freelancer.name)} alt={freelancer.name} style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover'}} />
                          <div>
                            <div style={{textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px'}}>
                              <h3 className="project-title" style={{marginBottom: 0}}>{freelancer.name}</h3>
                              {freelancer.kycStatus === 'Verified' && (
                                <CheckCircle size={14} color="#10b981" fill="#dcfce7" title="Verified Freelancer" />
                              )}
                            </div>
                            <p style={{margin: 0, fontSize: '14px', color: 'var(--text-main)', fontWeight: 500, marginTop: '4px'}}>{(freelancer.profile && freelancer.profile.title) || 'Freelancer'}</p>
                            <div className="client-info" style={{marginTop: '4px'}}>
                              <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                                <MapPin size={14} /> Remote
                              </span>
                            </div>
                          </div>
                        </div>
                        <button 
                          className={`bookmark-icon-btn ${freelancer.saved ? 'saved' : ''}`}
                          onClick={(e) => toggleSave(e, freelancer._id)}
                        >
                          <Bookmark size={22} fill={freelancer.saved ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      <div className="project-meta-grid" style={{gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '12px'}}>
                        <div className="meta-item">
                          <span className="meta-label">Rate</span>
                          <span className="meta-value">{(freelancer.profile && freelancer.profile.hourlyRate) || 'Negotiable'}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Success</span>
                          <span className="meta-value">100%</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Earned</span>
                          <span className="meta-value">New</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Rating</span>
                          <span className="meta-value" style={{display: 'flex', alignItems: 'center', gap: '2px'}}>
                            <Star size={12} fill="#eab308" color="#eab308" /> 5.0
                          </span>
                        </div>
                      </div>

                      <p className="project-desc">{(freelancer.profile && freelancer.profile.bio) || 'Ready to work on amazing projects.'}</p>
                      
                      <div className="skills-container">
                        {(() => {
                          const rawSkills = freelancer.profile?.skills || freelancer.skills;
                          const skillsArr = Array.isArray(rawSkills) 
                            ? rawSkills 
                            : (typeof rawSkills === 'string' ? rawSkills.split(',').map(s => s.trim()).filter(Boolean) : []);
                          return skillsArr.length > 0 ? (
                            skillsArr.map((skill, idx) => (
                              <span key={idx} className="skill-chip">{skill}</span>
                            ))
                          ) : (
                            <span className="skill-chip">General</span>
                          );
                        })()}
                      </div>

                      <div className="card-footer">
                        <div className="card-actions" style={{width: '100%', justifyContent: 'flex-end'}}>
                          <button 
                            type="button" 
                            className="btn-secondary" 
                            onClick={() => handleOpenProfile(freelancer)}
                          >
                            View Profile
                          </button>
                          <button 
                            type="button" 
                            className="btn-primary" 
                            onClick={handleOpenAuth}
                          >
                            Hire Talent
                          </button>
                        </div>
                      </div>
                      
                    </div>
                  ))}
                </div>

                <div className="pagination">
                  <button className="page-btn" disabled><ChevronLeft size={18} /></button>
                  <button className="page-btn active">1</button>
                  <button className="page-btn">2</button>
                  <button className="page-btn">3</button>
                  <span style={{color: 'var(--text-muted)'}}>...</span>
                  <button className="page-btn">8</button>
                  <button className="page-btn"><ChevronRight size={18} /></button>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <Users className="empty-icon" />
                <h3 className="empty-title">No freelancers found</h3>
                <p className="empty-desc">We couldn't find any talent matching your current filters and search query. Try adjusting your criteria.</p>
                <button className="btn-secondary" onClick={() => {
                  setSearchQuery('');
                  setActiveSkill('All Skills');
                }}>Clear All Filters</button>
              </div>
            )}
            
          </main>
        </div>
      </div>

      {/* Freelancer Profile Modal */}
      <FreelancerProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        freelancer={selectedFreelancer}
        onHire={() => {
          setIsProfileModalOpen(false);
          setShowAuthModal(true);
        }}
        onMessage={() => {
          setIsProfileModalOpen(false);
          setShowAuthModal(true);
        }}
        onShortlist={() => {
          setIsProfileModalOpen(false);
          setShowAuthModal(true);
        }}
      />

      {/* Interactive Login / Register Auth Modal Popup */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
