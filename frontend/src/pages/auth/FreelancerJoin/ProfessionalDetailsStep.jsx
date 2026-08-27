import React, { useState } from 'react';
import { Briefcase, BookOpen, Layers, X } from 'lucide-react';

export default function ProfessionalDetailsStep({ formData, updateFormData, nextStep, prevStep }) {
  const [skillInput, setSkillInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleSkillAdd = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim();
      const currentSkills = formData.skills || [];
      if (!currentSkills.includes(newSkill)) {
        updateFormData({ skills: [...currentSkills, newSkill] });
      }
      setSkillInput('');
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    const currentSkills = formData.skills || [];
    updateFormData({ skills: currentSkills.filter(s => s !== skillToRemove) });
  };

  const handleNext = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="step-content animate-fade-in">
      <h2 className="step-title">Professional Details</h2>
      <p className="step-description">Tell us about the work you do and your core expertise.</p>

      <form onSubmit={handleNext} className="join-form">
        <div className="form-group">
          <label className="standard-label">Professional Title</label>
          <div className="input-with-icon join-input no-float">
            <Briefcase className="input-icon" size={20} />
            <input 
              type="text" 
              name="title"
              placeholder="e.g. Full Stack Developer, UX Designer"
              value={formData.title || ''}
              onChange={handleChange}
              required 
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="standard-label">Primary Category</label>
            <div className="input-with-icon join-input no-float select-wrapper">
              <Layers className="input-icon" size={20} />
              <select 
                name="category" 
                value={formData.category || ''} 
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select a category</option>
                <option value="programming">Programming & Tech</option>
                <option value="design">Design & Creative</option>
                <option value="writing">Writing & Translation</option>
                <option value="marketing">Digital Marketing</option>
                <option value="video">Video & Animation</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label className="standard-label">Years of Experience</label>
            <div className="input-with-icon join-input no-float select-wrapper">
              <BookOpen className="input-icon" size={20} />
              <select 
                name="experience" 
                value={formData.experience || ''} 
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select experience level</option>
                <option value="beginner">Beginner (0-2 years)</option>
                <option value="intermediate">Intermediate (2-5 years)</option>
                <option value="expert">Expert (5+ years)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="standard-label">Skills (Press Enter to add)</label>
          <div className="skills-input-container">
            <input 
              type="text" 
              placeholder="e.g. React, UI Design, Copywriting"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillAdd}
              className="skill-input"
            />
          </div>
          <div className="skills-chips">
            {(formData.skills || []).map((skill, index) => (
              <div key={index} className="skill-chip">
                {skill}
                <button type="button" onClick={() => handleSkillRemove(skill)}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="step-actions split">
          <button type="button" className="btn btn-outline back-button" onClick={prevStep}>
            Back
          </button>
          <button type="submit" className="btn btn-primary next-button">
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
