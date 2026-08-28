const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, FreelancerProfile } = require('../models');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, bio, skills, location, country, title, hourlyRate, avatar, profileImage } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required for registration.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();
    
    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'An account with this email already exists. Please log in with your password, or reset your password if you forgot it.' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(trimmedPassword, salt);

    const userLocation = location || country || '';
    const userAvatar = avatar || profileImage || '';

    // Create user
    const newUser = await User.create({
      name: name ? name.trim() : 'User',
      email: normalizedEmail,
      password_hash,
      role: role || 'client',
      location: userLocation,
      avatar: userAvatar
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

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.status(201).json({ 
      message: 'User registered successfully', 
      token, 
      user: { 
        id: newUser._id, 
        name: newUser.name, 
        email: newUser.email, 
        role: newUser.role,
        avatar: newUser.avatar,
        location: newUser.location,
        country: country || newUser.location,
        bio: bio || '',
        skills: skills || '',
        title: title || ''
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration: ' + error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both your email address and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'No account found with this email. Please check your email or sign up.' });
    }

    let isMatch = await bcrypt.compare(trimmedPassword, user.password_hash);
    if (!isMatch) {
      isMatch = await bcrypt.compare(password, user.password_hash);
    }

    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password. Please double-check your password or reset it.' });
    }

    const payload = {
      id: user._id,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        avatar: user.avatar || '',
        location: user.location || ''
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login: ' + error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: 'Email address and new password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'No user account found with this email address.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword.trim(), salt);
    
    user.password_hash = password_hash;
    await user.save();

    res.json({ message: 'Password updated successfully. You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error resetting password: ' + error.message });
  }
};

