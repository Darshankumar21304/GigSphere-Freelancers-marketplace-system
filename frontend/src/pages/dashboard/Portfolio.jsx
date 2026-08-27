import React, { useState, useEffect } from 'react';
import { 
  Plus, MapPin, Star, Eye, CheckCircle, 
  Image as ImageIcon, UploadCloud, Link as LinkIcon, Edit2, Trash2,
  X
} from 'lucide-react';
import { getUserProfile, getUserRole } from '../../utils/authUtils';
import './Portfolio.css';

const MOCK_PROFILE = {
  name: 'Alex Developer',
  title: 'Senior Full Stack Engineer',
  location: 'Remote, India',
  rating: 4.9,
  completedProjects: 34,
  portfolioViews: 1245,
  profileCompletion: 92,
  avatar: 'https://i.pravatar.cc/150?img=11'
};

const MOCK_PORTFOLIO = [
  {
    id: 'PORT-1',
    title: 'Fintech Dashboard UX/UI',
    description: 'A comprehensive financial dashboard allowing users to track their expenses, investments, and cryptocurrency portfolio in real time.',
    category: 'UI/UX Design',
    skills: ['Figma', 'UI Design', 'Prototyping'],
    completionDate: 'Sep 2023',
    clientName: 'Finova Corp',
    link: 'https://dribbble.com/alexdev',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'PORT-2',
    title: 'E-commerce React Application',
    description: 'Built a scalable e-commerce frontend using React, Redux, and Tailwind CSS. Integrated with Stripe for payments and Algolia for search.',
    category: 'Web Development',
    skills: ['React', 'Tailwind', 'Redux', 'Stripe'],
    completionDate: 'Jul 2023',
    clientName: 'Retail Giant',
    link: 'https://github.com/alexdev',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'PORT-3',
    title: 'Food Delivery Mobile App',
    description: 'Cross-platform mobile application built with React Native for a local food delivery startup. Features real-time GPS tracking and push notifications.',
    category: 'Mobile Apps',
    skills: ['React Native', 'Firebase', 'Google Maps API'],
    completionDate: 'Mar 2023',
    clientName: 'QuickBite',
    link: '',
    image: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=600&q=80'
  }
];

const CATEGORIES = ['All Projects', 'Web Development', 'Mobile Apps', 'UI/UX Design', 'Graphic Design'];

export default function Portfolio() {
  const profile = getUserProfile();
  const displayName = profile?.name || profile?.fullName || MOCK_PROFILE.name;
  
  const [projects, setProjects] = useState(MOCK_PORTFOLIO);
  const [activeTab, setActiveTab] = useState('All Projects');
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // New Project Form State
  const [newProject, setNewProject] = useState({
    title: '', description: '', category: 'Web Development', 
    skills: '', link: '', completionDate: ''
  });
  const [uploadedImage, setUploadedImage] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredProjects = projects.filter(p => {
    if (activeTab === 'All Projects') return true;
    return p.category === activeTab;
  });

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      setProjects(prev => prev.filter(p => p.id !== projectToDelete));
      setProjectToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create local URL for preview
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
    }
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.description) return; // simple validation

    const project = {
      id: `PORT-${Date.now()}`,
      title: newProject.title,
      description: newProject.description,
      category: newProject.category,
      skills: newProject.skills.split(',').map(s => s.trim()).filter(s => s),
      completionDate: newProject.completionDate,
      clientName: 'Private Client',
      link: newProject.link,
      image: uploadedImage || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80'
    };
    
    setProjects([project, ...projects]);
    setIsAddModalOpen(false);
    setNewProject({ title: '', description: '', category: 'Web Development', skills: '', link: '', completionDate: '' });
    setUploadedImage(null);
  };

  return (
    <div className="gigsphere-freelancer-portfolio">
      <div className="portfolio-container">
        
        {/* Header */}
        <div className="page-header">
          <div>
            <div className="breadcrumb">Dashboard / Portfolio</div>
            <h1 className="page-title">My Portfolio</h1>
            <p className="page-desc">Showcase your best work and demonstrate your skills to potential Clients.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={18} /> Add Portfolio Project
          </button>
        </div>

        {/* Profile Summary Card */}
        <div className="profile-card">
          <div className="profile-main">
            <img src={MOCK_PROFILE.avatar} alt="Profile" className="profile-image" />
            <div className="profile-info">
              <h2 className="freelancer-name">{displayName}</h2>
              <p className="professional-title">{MOCK_PROFILE.title}</p>
              <div className="freelancer-meta">
                <span className="freelancer-meta-item">
                  <MapPin size={14} /> {MOCK_PROFILE.location}
                </span>
                <span className="freelancer-meta-item rating">
                  <Star size={14} fill="currentColor" /> {MOCK_PROFILE.rating}
                </span>
              </div>
            </div>
          </div>
          <div className="profile-stats">
            <div className="stat-box">
              <span className="stat-value">{MOCK_PROFILE.completedProjects}</span>
              <span className="stat-label">Projects</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{MOCK_PROFILE.portfolioViews}</span>
              <span className="stat-label">Views</span>
            </div>
            <div className="completion-box">
              <div className="completion-header">
                <span>Profile Completeness</span>
                <span style={{color: 'var(--primary)'}}>{MOCK_PROFILE.profileCompletion}%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{width: `${MOCK_PROFILE.profileCompletion}%`}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="tabs-container">
          {CATEGORIES.map(tab => (
            <button 
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="portfolio-grid">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="portfolio-card">
                <div className="skeleton" style={{width: '100%', height: '200px', borderRadius: 0}}></div>
                <div style={{padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  <div className="skeleton" style={{width: '80%', height: '20px'}}></div>
                  <div className="skeleton" style={{width: '100%', height: '40px'}}></div>
                  <div className="skeleton" style={{width: '50%', height: '16px'}}></div>
                </div>
              </div>
            ))
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map(project => (
              <div key={project.id} className="portfolio-card">
                <div className="card-image-wrapper">
                  <img src={project.image} alt={project.title} className="card-image" />
                  <div className="card-overlay">
                    <button className="overlay-btn" title="View Project">
                      <Eye size={18} />
                    </button>
                    <button className="overlay-btn" title="Edit Project">
                      <Edit2 size={18} />
                    </button>
                    <button 
                      className="overlay-btn" 
                      title="Delete Project"
                      onClick={() => {
                        setProjectToDelete(project.id);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 size={18} color="#dc2626" />
                    </button>
                  </div>
                </div>
                
                <div className="card-content">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-desc">{project.description}</p>
                  <div className="skills-list">
                    {project.skills.map(skill => (
                      <span key={skill} className="skill-chip">{skill}</span>
                    ))}
                  </div>
                  
                  <div className="card-footer">
                    <div className="footer-item">
                      <CheckCircle size={14} /> Completed {project.completionDate}
                    </div>
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link footer-item">
                        <LinkIcon size={14} /> View Live
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <ImageIcon className="empty-icon" size={64} />
              <h3 className="empty-title">Build a portfolio that gets you hired</h3>
              <p className="empty-desc">
                Clients are 4x more likely to hire freelancers who showcase their past work. Add relevant projects, case studies, or concepts to demonstrate your expertise.
              </p>
              <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
                Add Your First Project
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h3 className="modal-title" style={{color: '#dc2626'}}>Delete Project</h3>
              <button className="close-btn" onClick={() => setIsDeleteModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this portfolio project? This action cannot be undone and it will be removed from your public profile.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add Portfolio Project</h3>
              <button className="close-btn" onClick={() => setIsAddModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddProject}>
              <div className="modal-body">
                
                <div className="form-group">
                  <label className="form-label">Project Title *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Modern E-commerce App"
                    value={newProject.title}
                    onChange={e => setNewProject({...newProject, title: e.target.value})}
                    required
                  />
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select 
                      className="form-select"
                      value={newProject.category}
                      onChange={e => setNewProject({...newProject, category: e.target.value})}
                    >
                      {CATEGORIES.slice(1).map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Completion Date</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Oct 2023"
                      value={newProject.completionDate}
                      onChange={e => setNewProject({...newProject, completionDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Project Description *</label>
                  <textarea 
                    className="form-textarea" 
                    placeholder="Describe the project, your role, and the impact..."
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Skills Used</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. React, Node.js, Figma (comma separated)"
                    value={newProject.skills}
                    onChange={e => setNewProject({...newProject, skills: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Project Link (Optional)</label>
                  <input 
                    type="url" 
                    className="form-input" 
                    placeholder="https://..."
                    value={newProject.link}
                    onChange={e => setNewProject({...newProject, link: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cover Image *</label>
                  <label className="upload-area" style={{padding: uploadedImage ? '10px' : '40px 24px'}}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{display: 'none'}} 
                      onChange={handleImageUpload}
                    />
                    {uploadedImage ? (
                      <img src={uploadedImage} alt="Preview" style={{width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px'}} />
                    ) : (
                      <>
                        <UploadCloud className="upload-icon" size={32} />
                        <p className="upload-text">Click or drag image to upload</p>
                        <p className="upload-subtext">SVG, PNG, JPG or GIF (max. 5MB)</p>
                      </>
                    )}
                  </label>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
