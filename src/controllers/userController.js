const { User, FreelancerProfile } = require('../models');

const getFreelancers = async (req, res) => {
  try {
    // Find users who have the role of freelancer
    const freelancers = await User.find({ role: 'freelancer' }).select('-password_hash');
    
    // Fetch their profiles
    const freelancerIds = freelancers.map(f => f._id);
    const profiles = await FreelancerProfile.find({ user_id: { $in: freelancerIds } });

    // Combine user data with profile data
    const result = freelancers.map(freelancer => {
      const profile = profiles.find(p => p.user_id.toString() === freelancer._id.toString());
      return {
        ...freelancer.toObject(),
        profile: profile ? profile.toObject() : null
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching freelancers:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password_hash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let profile = null;
    if (user.role === 'freelancer') {
      profile = await FreelancerProfile.findOne({ user_id: userId });
    }
    
    res.json({ user, profile });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      name, phone, location, language, preferences, avatar, profilePhoto,
      title, bio, skills, experience, availability, hourlyRate 
    } = req.body;

    const updateFields = { name, phone, location, language, preferences };
    if (avatar || profilePhoto) {
      updateFields.avatar = avatar || profilePhoto;
      updateFields.profilePhoto = avatar || profilePhoto;
    }
    
    // Update User
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      updateFields, 
      { new: true, runValidators: true }
    ).select('-password_hash');
    
    let updatedProfile = null;
    if (updatedUser.role === 'freelancer') {
      updatedProfile = await FreelancerProfile.findOneAndUpdate(
        { user_id: userId },
        { title, bio, skills, experience, availability, hourlyRate },
        { new: true, upsert: true, runValidators: true }
      );
    }
    
    res.json({ user: updatedUser, profile: updatedProfile });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getFreelancers,
  getSettings,
  updateSettings
};
