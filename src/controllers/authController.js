const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, FreelancerProfile } = require('../models');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, bio, skills, location, country, title, hourlyRate } = req.body;
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
      location: userLocation
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
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
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
