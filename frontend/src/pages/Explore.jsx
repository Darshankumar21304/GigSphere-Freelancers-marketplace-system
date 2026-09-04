import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserRole, isAuthenticated } from '../utils/authUtils';
import AuthModal from '../components/AuthModal';
import { apiFetch } from '../utils/api';
import { 
  Filter, 
  Search,
  MapPin,
  Star,
  CheckCircle,
  LayoutGrid,
  List,
  Clock,
  Users,
  Bookmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Briefcase
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import './BrowseProjects.css';

const MOCK_CATEGORIES = [
  'All Projects',
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Digital Marketing',
  'Content Writing',
  'Data Science'
];

export default function Explore() {
  const navigate = useNavigate();
  const role = getUserRole();
  const isAuth = isAuthenticated();

  const [projects, setProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All Projects');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sortBy, setSortBy] = useState('Best Match');
  
  const [filters, setFilters] = useState({
    skill: '',
    budgetRange: 'Any Budget',
    projectType: 'Any Type',
    experienceLevels: [],
    durations: [],
    clientRating: 'Any Rating'
  });

  const [proposalProject, setProposalProject] = useState(null);
  const [proposalForm, setProposalForm] = useState({ bidAmount: '', coverLetter: '', deliveryTime: '1 to 2 weeks' });
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    if (!proposalProject) return;
    setIsSubmittingProposal(true);
    try {
      await apiFetch(`/projects/${proposalProject._id}/proposals`, {
        method: 'POST',
        body: JSON.stringify(proposalForm)
      });
      alert('Proposal submitted successfully!');
      setProposalProject(null);
      setProposalForm({ bidAmount: '', coverLetter: '', deliveryTime: '1 to 2 weeks' });
    } catch (err) {
      console.error('Failed to submit proposal:', err);
      alert('Failed to submit proposal: ' + err.message);
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  // Fetch projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await apiFetch('/projects');
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const toggleSave = (e, id) => {
    e.preventDefault();
    if (!isAuth) {
      setShowAuthModal(true);
      return;
    }
    setProjects(projects.map(p => p._id === id ? { ...p, saved: !p.saved } : p));
  };

  const handleProposeClick = (project) => {
    if (!isAuth) {
      setShowAuthModal(true);
      return;
    }
    if (role === 'client') {
      alert('Clients cannot submit proposals. Please log in as a freelancer.');
      return;
    }
    setProposalProject(project);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCheckboxChange = (key, value) => {
    setFilters(prev => {
      const current = prev[key];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory('All Projects');
    setFilters({
      skill: '',
      budgetRange: 'Any Budget',
      projectType: 'Any Type',
      experienceLevels: [],
      durations: [],
      clientRating: 'Any Rating'
    });
  };

  const filteredProjects = projects.filter(p => {
    if (activeCategory !== 'All Projects' && p.category !== activeCategory) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = p.title && p.title.toLowerCase().includes(q);
      const descMatch = p.description && p.description.toLowerCase().includes(q);
      const skillsMatch = p.skills && p.skills.some(s => s.toLowerCase().includes(q));
      if (!titleMatch && !descMatch && !skillsMatch) {
        return false;
      }
    }

    if (filters.skill && p.skills && !p.skills.includes(filters.skill)) return false;
    if (filters.projectType !== 'Any Type' && p.budgetType !== filters.projectType) return false;
    if (filters.experienceLevels.length > 0 && p.experienceLevel && !filters.experienceLevels.includes(p.experienceLevel)) return false;
    if (filters.durations.length > 0 && p.duration && !filters.durations.includes(p.duration)) return false;
    
    // Default client rating to handle missing data gracefully
    const rating = (p.client_id && p.client_id.rating) || 5.0; 
    if (filters.clientRating === '4.5 & up' && rating < 4.5) return false;
    if (filters.clientRating === '4.0 & up' && rating < 4.0) return false;

    if (filters.budgetRange !== 'Any Budget') {
      const budgetNum = parseInt(p.budget, 10) || 0;
      if (filters.budgetRange === 'Under ₹10,000' && budgetNum >= 10000) return false;
      if (filters.budgetRange === '₹10,000 - ₹50,000' && (budgetNum < 10000 || budgetNum > 50000)) return false;
      if (filters.budgetRange === '₹50,000 - ₹1,00,000' && (budgetNum < 50000 || budgetNum > 100000)) return false;
      if (filters.budgetRange === 'Over ₹1,00,000' && budgetNum <= 100000) return false;
    }

    return true;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'Newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'Highest Budget') return (parseInt(b.budget) || 0) - (parseInt(a.budget) || 0);
    return 0;
  });

  const SidebarContent = () => (
    <>
      <div className="drawer-header lg:hidden">
        <h2 className="filter-title" style={{marginBottom: 0}}>Filters</h2>
        <button className="close-drawer-btn" onClick={() => setIsFilterOpen(false)}>
          <X size={24} />
        </button>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Project Category</h3>
        <div className="custom-select-wrapper">
          <select className="custom-select" value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}>
            {MOCK_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="filter-section">
        <h3 className="filter-title">Skills</h3>
        <div className="custom-select-wrapper">
          <select className="custom-select" value={filters.skill} onChange={(e) => handleFilterChange('skill', e.target.value)}>
            <option value="">Select a skill...</option>
            <option value="React">React</option>
            <option value="Node.js">Node.js</option>
            <option value="UI/UX">UI/UX</option>
            <option value="Python">Python</option>
            <option value="TypeScript">TypeScript</option>
          </select>
        </div>
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Budget Range</h3>
        {['Any Budget', '₹10k - ₹50k', '₹50k - ₹1L', '₹1L+'].map(budget => (
          <label key={budget} className="custom-radio">
            <input type="radio" name="budgetRange" checked={filters.budgetRange === budget} onChange={() => handleFilterChange('budgetRange', budget)} />
            {budget}
          </label>
        ))}
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Project Type</h3>
        {['Any Type', 'Fixed Price', 'Hourly'].map(type => (
          <label key={type} className="custom-radio">
            <input type="radio" name="projectType" checked={filters.projectType === type} onChange={() => handleFilterChange('projectType', type)} />
            {type}
          </label>
        ))}
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Experience Level</h3>
        {['Entry Level', 'Intermediate', 'Expert'].map(level => (
          <label key={level} className="custom-checkbox">
            <input type="checkbox" checked={filters.experienceLevels.includes(level)} onChange={() => handleCheckboxChange('experienceLevels', level)} />
            {level}
          </label>
        ))}
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Project Duration</h3>
        {['Less than 1 month', '1 to 3 months', '3 to 6 months', 'More than 6 months'].map(dur => (
          <label key={dur} className="custom-checkbox">
            <input type="checkbox" checked={filters.durations.includes(dur)} onChange={() => handleCheckboxChange('durations', dur)} />
            {dur}
          </label>
        ))}
      </div>
      
      <div className="filter-section">
        <h3 className="filter-title">Client Rating</h3>
        {['4.5 & up', '4.0 & up', 'Any Rating'].map((rating, i) => (
          <label key={rating} className="custom-radio">
            <input type="radio" name="clientRating" checked={filters.clientRating === rating} onChange={() => handleFilterChange('clientRating', rating)} />
            <div style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
              {i < 2 ? <Star size={14} fill="#eab308" color="#eab308" /> : null}
              {rating}
            </div>
          </label>
        ))}
      </div>

      <div className="filter-section">
        <h3 className="filter-title">Posted Date</h3>
        {['Any Time', 'Last 24 Hours', 'Last 7 Days', 'Last 14 Days'].map(time => (
          <label key={time} className="custom-radio">
            <input type="radio" name="postedDate" defaultChecked={time === 'Any Time'} />
            {time}
          </label>
        ))}
      </div>

      <div className="filter-actions">
        <button className="btn-clear" onClick={clearFilters}>Clear All</button>
        <button className="btn-apply" onClick={() => setIsFilterOpen(false)}>Apply Filters</button>
      </div>
    </>
  );

  return (
    <div className="gigsphere-freelancer-browse-projects">
      <div className="browse-container">
        
        {/* Header */}
        <div className="page-header">
          <div>
            <div className="breadcrumb">Dashboard / Browse Projects</div>
            <h1 className="page-title">Browse Projects</h1>
            <p className="page-description">Discover projects that match your skills and experience.</p>
          </div>
          <button className="saved-projects-btn" onClick={() => {
            if (!isAuth) {
              setShowAuthModal(true);
            } else {
              // Handle saved projects view (not implemented yet but auth check works)
            }
          }}>
            <Bookmark size={18} />
            Saved Projects
          </button>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-input-group">
            <div className="search-wrapper">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search by project title, skill, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="search-btn">Search Projects</button>
            <button className="mobile-filter-btn" onClick={() => setIsFilterOpen(true)}>
              <Filter size={20} />
              Filters
            </button>
          </div>
          
          {/* Category Chips */}
          <div className="category-chips">
            {MOCK_CATEGORIES.map(cat => (
              <button 
                key={cat} 
                className={`chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="content-layout">
          
          {/* Desktop Sidebar Filter */}
          <aside className="filter-sidebar">
            <SidebarContent />
          </aside>

          {/* Mobile Drawer Filter */}
          <div className={`filter-drawer-overlay ${isFilterOpen ? 'open' : ''}`} onClick={() => setIsFilterOpen(false)}>
            <div className="filter-drawer" onClick={e => e.stopPropagation()}>
              <SidebarContent />
            </div>
          </div>

          {/* Main Results */}
          <main className="results-area">
            
            <div className="results-toolbar">
              <div className="results-count">
                Showing <strong>{filteredProjects.length}</strong> projects found
              </div>
              
              <div className="toolbar-actions">
                <div className="sort-dropdown">
                  Sort By: 
                  <div className="custom-select-wrapper" style={{display: 'inline-block', width: '160px'}}>
                    <select className="custom-select" style={{padding: '8px 12px'}} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option>Best Match</option>
                      <option>Newest</option>
                      <option>Highest Budget</option>
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
            ) : sortedProjects.length > 0 ? (
              <>
                <div className={`projects-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                  {sortedProjects.map(project => (
                    <div key={project.id || project._id} className="project-card">
                      
                      <div className="card-header">
                        <div style={{ flex: 1 }}>
                          <Link to={`/gig/${project._id}`} style={{textDecoration: 'none'}}>
                            <h3 className="project-title">{project.title}</h3>
                          </Link>
                          
                          <div className="client-info">
                            <span style={{fontWeight: 600, color: 'var(--text-main)'}}>
                              {project.client_id ? (project.client_id.companyName || project.client_id.name) : 'Unknown Client'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: 500, fontSize: '13px' }}>
                              <CheckCircle size={14} /> Verified
                            </span>
                          </div>
                        </div>
                        <button 
                          className={`bookmark-icon-btn ${project.saved ? 'saved' : ''}`}
                          onClick={(e) => toggleSave(e, project._id)}
                        >
                          <Bookmark size={22} fill={project.saved ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      <div className="project-meta-grid" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', margin: '16px 0' }}>
                        <div className="meta-item">
                          <span className="meta-label">{project.budgetType || 'Fixed Price'}</span>
                          <span className="meta-value" style={{ color: '#10b981', fontSize: '16px' }}>
                            {project.budget ? formatINR(project.budget) : 'Open Budget'}
                          </span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Experience</span>
                          <span className="meta-value">{project.experienceLevel || 'Intermediate'}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Duration</span>
                          <span className="meta-value">{project.duration || 'Not specified'}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Posted</span>
                          <span className="meta-value">{new Date(project.createdAt).toLocaleDateString() || 'Recently'}</span>
                        </div>
                      </div>

                      <p className="project-desc" style={{ color: '#475569', fontSize: '15px' }}>{project.description}</p>
                      
                      <div className="skills-container">
                        {project.skills && project.skills.map(skill => (
                          <span key={skill} className="skill-chip">{skill}</span>
                        ))}
                      </div>

                      <div className="card-footer" style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                        <div className="footer-stats">
                          <div className="stat-item" style={{ fontSize: '14px', color: '#64748b' }}>
                            <Users size={16} /> {project.proposals ? project.proposals.length : 0} Proposals
                          </div>
                        </div>
                        <div className="card-actions">
                          <button 
                            className="btn-secondary" 
                            onClick={(e) => {
                              if (!isAuth) {
                                e.preventDefault();
                                setShowAuthModal(true);
                              } else {
                                navigate(`/gig/${project._id}`);
                              }
                            }}
                          >
                            View Project
                          </button>
                          {role !== 'client' && (
                            <button className="btn-primary" onClick={() => handleProposeClick(project)}>Submit Proposal</button>
                          )}
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
                <Briefcase className="empty-icon" />
                <h3 className="empty-title">No projects found</h3>
                <p className="empty-desc">We couldn't find any projects matching your current filters and search query. Try adjusting your criteria.</p>
                <button className="btn-secondary" onClick={clearFilters}>Clear All Filters</button>
              </div>
            )}
            
          </main>
        </div>
      </div>

      {/* Submit Proposal Modal */}
      {proposalProject && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '550px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Submit Proposal</h2>
              <button onClick={() => setProposalProject(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
              Submitting for: <strong>{proposalProject.title}</strong>
            </p>

            <form onSubmit={handleProposalSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Bid Amount (₹)</label>
                <input 
                  type="number" 
                  required
                  placeholder="e.g. 25000"
                  value={proposalForm.bidAmount}
                  onChange={(e) => setProposalForm({ ...proposalForm, bidAmount: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Estimated Delivery Time</label>
                <select 
                  value={proposalForm.deliveryTime}
                  onChange={(e) => setProposalForm({ ...proposalForm, deliveryTime: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                >
                  <option value="Less than 1 week">Less than 1 week</option>
                  <option value="1 to 2 weeks">1 to 2 weeks</option>
                  <option value="2 to 4 weeks">2 to 4 weeks</option>
                  <option value="1+ Months">1+ Months</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Cover Letter / Pitch</label>
                <textarea 
                  required
                  rows="4"
                  placeholder="Describe your relevant experience and why you are the best fit for this project..."
                  value={proposalForm.coverLetter}
                  onChange={(e) => setProposalForm({ ...proposalForm, coverLetter: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #d1d5db', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setProposalProject(null)}
                  style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingProposal}
                  style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: 'var(--primary, #2563eb)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  {isSubmittingProposal ? 'Submitting...' : 'Send Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Login Popup Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}
