const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, FreelancerProfile } = require('../models');

exports.register = async (req, res) => {
  try {
    const { 
      name, email, password, role, bio, skills, location, country, title, hourlyRate,
      experience, availability, category, portfolio 
    } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userLocation = location || country || '';

    // Create user
    const newUser = await User.create({
      name,
      email: normalizedEmail,
      password_hash,
      role: role || 'client',
      location: userLocation,
      country: country || userLocation
    });

    // If freelancer, create profile
    let profile = null;
    if (newUser.role === 'freelancer') {
      const parsedSkills = Array.isArray(skills) 
        ? skills 
        : (typeof skills === 'string' && skills.trim() ? skills.split(',').map(s => s.trim()) : []);

      const formattedPortfolio = Array.isArray(portfolio) ? portfolio.map(item => ({
        title: item.title || 'Project',
        description: item.description || '',
        category: item.category || category || 'Web Development',
        skills: Array.isArray(item.skills) ? item.skills : [],
        link: item.link || item.url || '',
        url: item.url || item.link || '',
        imageUrl: item.imageUrl || item.image || ''
      })) : [];

      profile = await FreelancerProfile.create({
        user_id: newUser._id,
        title: title || '',
        bio: bio || '',
        skills: parsedSkills,
        category: category || 'Web Development',
        hourlyRate: Number(hourlyRate) || 0,
        experience: experience || 'Entry Level',
        availability: availability || 'Full-time (40 hrs/week)',
        portfolioItems: formattedPortfolio
      });
    }

    const payload = {
      id: newUser._id,
      role: newUser.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    res.status(201).json({ 
      message: 'User registered successfully', 
      token, 
      user: { 
        id: newUser._id, 
        name: newUser.name, 
        email: newUser.email, 
        role: newUser.role,
        location: newUser.location,
        country: newUser.country || newUser.location,
        bio: profile?.bio || bio || '',
        skills: profile?.skills || skills || '',
        title: profile?.title || title || ''
      },
      profile
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    let profile = null;
    if (user.role === 'freelancer') {
      profile = await FreelancerProfile.findOne({ user_id: user._id });
    }

    const payload = {
      id: user._id,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        location: user.location,
        country: user.country,
        bio: profile?.bio || '',
        title: profile?.title || '',
        skills: profile?.skills || []
      },
      profile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { email, name, role } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();
    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required for Google authentication' });
    }

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Auto-create user via Google OAuth
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(`google_${Date.now()}`, salt);

      user = await User.create({
        name: name || 'Google User',
        email: normalizedEmail,
        password_hash,
        role: role || 'freelancer'
      });
    }

    let profile = null;
    if (user.role === 'freelancer') {
      profile = await FreelancerProfile.findOne({ user_id: user._id });
      if (!profile) {
        profile = await FreelancerProfile.create({ user_id: user._id });
      }
    }

    const payload = {
      id: user._id,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        country: user.country,
        bio: profile?.bio || '',
        title: profile?.title || '',
        skills: profile?.skills || []
      },
      profile
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Google authentication server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
