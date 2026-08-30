const { User, FreelancerProfile } = require('../models');
const adminController = require('./adminController');

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
      companyName, industry, companySize, website, companyDesc, gstin, state, country,
      title, bio, skills, experience, availability, hourlyRate 
    } = req.body;

    const updateFields = { 
      name, phone, location, language, preferences,
      companyName, industry, companySize, website, companyDesc, gstin, state, country
    };
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

const submitKyc = async (req, res) => {
  try {
    const userId = req.user.id;
    const { docUrl, docType } = req.body;

    if (!docUrl) {
      return res.status(400).json({ message: 'Document URL is required.' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        kycStatus: 'Pending Approval',
        kycDocUrl: docUrl,
        kycDocType: docType || 'Aadhaar Card',
        kycSubmittedAt: new Date()
      },
      { new: true }
    ).select('-password_hash');

    res.json({ message: 'KYC Document submitted successfully for review.', user: updatedUser });
  } catch (error) {
    console.error('Error submitting KYC:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 4. Get all disputes associated with the logged in user
const getUserDisputes = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const myDisputes = adminController.globalDisputes.filter(d => 
      d.clientEmail === userEmail || d.freelancerEmail === userEmail
    );
    res.json({ success: true, disputes: myDisputes });
  } catch (error) {
    console.error('Error fetching user disputes:', error);
    res.status(500).json({ message: 'Error retrieving disputes' });
  }
};

// 5. Post a message to a dispute discussion thread
const addUserDisputeMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userEmail = req.user.email;
    const userRole = req.user.role;
    const userName = req.user.name || 'User';

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required.' });
    }

    const dispute = adminController.globalDisputes.find(d => d.id === id);
    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found.' });
    }

    if (dispute.clientEmail !== userEmail && dispute.freelancerEmail !== userEmail) {
      return res.status(403).json({ message: 'Access denied to this dispute thread.' });
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      senderRole: userRole === 'client' ? 'Client' : 'Freelancer',
      senderName: `${userName} (${userEmail})`,
      text: text,
      timestamp: new Date().toISOString()
    };

    dispute.messages.push(newMessage);

    res.json({ success: true, message: 'Message added successfully.', dispute });
  } catch (error) {
    console.error('Error adding dispute message:', error);
    res.status(500).json({ message: 'Error adding message to dispute' });
  }
};

// 6. File a new dispute
const fileNewDispute = async (req, res) => {
  try {
    const { projectTitle, freelancerEmail, amount, issue } = req.body;
    const userEmail = req.user.email;
    const userName = req.user.name || 'Client';

    if (!projectTitle || !freelancerEmail || !amount || !issue) {
      return res.status(400).json({ message: 'Project title, freelancer email, amount, and issue details are required.' });
    }

    const newDisp = {
      id: `DISP-${Math.floor(100 + Math.random() * 900)}`,
      projectTitle,
      clientName: userName,
      clientEmail: userEmail,
      freelancerName: freelancerEmail.split('@')[0],
      freelancerEmail: freelancerEmail,
      amount: Number(amount),
      issue,
      freelancerDefense: 'Awaiting freelancer response.',
      status: 'Open',
      createdAt: new Date().toISOString(),
      resolution: null,
      adminReasoning: null,
      aiRecommendation: null,
      messages: [
        {
          id: 'msg-1',
          senderRole: 'Client',
          senderName: `${userName} (${userEmail})`,
          text: `Dispute opened: ${issue}`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    adminController.globalDisputes.push(newDisp);

    res.status(201).json({ success: true, message: 'Dispute filed successfully!', dispute: newDisp });
  } catch (error) {
    console.error('Error filing dispute:', error);
    res.status(500).json({ message: 'Error filing dispute' });
  }
};

module.exports = {
  getFreelancers,
  getSettings,
  updateSettings,
  submitKyc,
  getUserDisputes,
  addUserDisputeMessage,
  fileNewDispute
};
