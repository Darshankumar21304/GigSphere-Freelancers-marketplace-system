const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, FreelancerProfile } = require('../models');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, bio, skills, location, country, title, hourlyRate } = req.body;
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
      location: userLocation
    });

    // If freelancer, create profile
    let profile = null;
    if (newUser.role === 'freelancer') {
      profile = await FreelancerProfile.create({
        user_id: newUser._id,
        title: title || '',
        bio: bio || '',
        skills: skills || '',
        hourlyRate: hourlyRate || 0
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
        country: country || newUser.location,
        bio: bio || '',
        skills: skills || '',
        title: title || ''
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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

    const payload = {
      id: user._id,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { email, name, role } = req.body;
    const normalizedEmail = (email || 'google.user@gigsphere.com').toLowerCase().trim();

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Auto-create user via Google OAuth
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(`google_${Date.now()}`, salt);

      user = await User.create({
        name: name || 'Google User',
        email: normalizedEmail,
        password_hash,
        role: role || 'client'
      });
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
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Google authentication server error' });
  }
};
