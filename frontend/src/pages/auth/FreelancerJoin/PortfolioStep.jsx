import React, { useState } from 'react';
import { Image as ImageIcon, Link, Plus, Trash2 } from 'lucide-react';

export default function PortfolioStep({ formData, updateFormData, nextStep, prevStep }) {
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', description: '', url: '' });

  const portfolio = formData.portfolio || [];

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.title && newItem.description) {
      updateFormData({ portfolio: [...portfolio, newItem] });
      setNewItem({ title: '', description: '', url: '' });
      setShowForm(false);
    }
  };

  const handleRemoveItem = (index) => {
    const newPortfolio = portfolio.filter((_, i) => i !== index);
    updateFormData({ portfolio: newPortfolio });
  };

  return (
    <div className="step-content animate-fade-in">
      <h2 className="step-title">Showcase your work</h2>
      <p className="step-description">Adding portfolio items increases your chances of getting hired by 3x.</p>

      {portfolio.length > 0 && (
        <div className="portfolio-grid">
          {portfolio.map((item, index) => (
            <div key={index} className="portfolio-card glass">
              <div className="portfolio-card-img">
                <ImageIcon size={48} className="placeholder-icon" />
              </div>
              <div className="portfolio-card-content">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="portfolio-link"><Link size={14}/> {item.url}</a>}
                <button type="button" className="remove-btn" onClick={() => handleRemoveItem(index)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showForm && portfolio.length < 5 && (
        <button type="button" className="add-portfolio-btn dashed-border" onClick={() => setShowForm(true)}>
          <Plus size={24} />
          <span>Add Project</span>
        </button>
      )}

      {showForm && (
        <form onSubmit={handleAddItem} className="portfolio-form glass">
          <h4>New Project</h4>
          <div className="form-group">
            <input 
              type="text" 
              placeholder="Project Title" 
              value={newItem.title}
              onChange={(e) => setNewItem({...newItem, title: e.target.value})}
              required
              className="standard-input"
            />
          </div>
          <div className="form-group">
            <textarea 
              placeholder="Project Description" 
              value={newItem.description}
              onChange={(e) => setNewItem({...newItem, description: e.target.value})}
              required
              className="standard-input"
              rows="3"
            ></textarea>
          </div>
          <div className="form-group">
            <input 
              type="url" 
              placeholder="Project URL (optional)" 
              value={newItem.url}
              onChange={(e) => setNewItem({...newItem, url: e.target.value})}
              className="standard-input"
            />
          </div>
          <div className="portfolio-form-actions">
            <button type="button" className="btn btn-text" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Project</button>
          </div>
        </form>
      )}

      <div className="step-actions split mt-4">
        <button type="button" className="btn btn-outline back-button" onClick={prevStep}>
          Back
        </button>
        <button type="button" className="btn btn-primary next-button" onClick={nextStep}>
          {portfolio.length > 0 ? 'Continue' : 'Skip for now'}
        </button>
      </div>
    </div>
  );
}
