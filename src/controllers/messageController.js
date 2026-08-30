const { Message } = require('../models');
const { uploadToCloudinary } = require('../config/cloudinary');

exports.getChatHistory = async (req, res) => {
  try {
    const { user1_id, user2_id } = req.params;

    if (!Message) {
      return res.json([]);
    }

    // Find messages between the two users safely
    let chatMessages = await Message.find({
      $or: [
        { sender_id: user1_id, receiver_id: user2_id },
        { sender_id: user2_id, receiver_id: user1_id }
      ]
    })
    .sort({ timestamp: 1 })
    .catch(() => []);

    // Format the response safely
    const formattedMessages = (chatMessages || []).map(m => {
      const msgObj = typeof m.toObject === 'function' ? m.toObject() : m;
      return {
        ...msgObj,
        sender: msgObj.sender_id ? { id: msgObj.sender_id._id || msgObj.sender_id, name: msgObj.sender_id.name || 'User' } : null,
        receiver: msgObj.receiver_id ? { id: msgObj.receiver_id._id || msgObj.receiver_id, name: msgObj.receiver_id.name || 'User' } : null
      };
    });

    res.json(formattedMessages);
  } catch (error) {
    console.error('Chat history fetch error:', error);
    res.json([]); // Return empty array on error so UI never crashes
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const mime = req.file.mimetype;
    let folder = 'gigsphere/chat/files';
    let resource_type = 'auto';

    if (mime.startsWith('image/')) {
      folder = 'gigsphere/chat/images';
      resource_type = 'image';
    } else if (mime.startsWith('video/') || mime.startsWith('audio/')) {
      folder = 'gigsphere/chat/videos';
      resource_type = 'video';
    } else if (mime.includes('pdf') || mime.includes('word') || mime.includes('text')) {
      folder = 'gigsphere/chat/documents';
      resource_type = 'raw';
    }

    const result = await uploadToCloudinary(req.file.buffer, { folder, resource_type });

    res.status(200).json({ 
      fileUrl: result.secure_url,
      publicId: result.public_id,
      fileName: req.file.originalname,
      resourceType: result.resource_type,
      format: result.format || mime.split('/')[1]
    });
  } catch (error) {
    console.error('Chat Cloudinary upload error:', error);
    res.status(500).json({ message: error.message || 'Server error uploading chat attachment to Cloudinary' });
  }
};

// GET /api/messages/unread-count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Message.countDocuments({ receiver_id: userId, read: false });
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/messages/read-all/:senderId
exports.markMessagesRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { senderId } = req.params;
    
    await Message.updateMany(
      { receiver_id: userId, sender_id: senderId, read: false },
      { read: true }
    );
    
    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/messages/conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { User } = require('../models');

    const messages = await Message.find({
      $or: [{ sender_id: userId }, { receiver_id: userId }]
    }).sort({ createdAt: -1 });

    const partnersMap = new Map();

    for (const msg of messages) {
      const partnerId = msg.sender_id.toString() === userId.toString() 
        ? msg.receiver_id.toString() 
        : msg.sender_id.toString();

      if (!partnersMap.has(partnerId)) {
        partnersMap.set(partnerId, {
          lastMessage: msg.message_text,
          lastMessageTime: msg.createdAt
        });
      }
    }

    const conversationsList = [];
    for (const [partnerId, data] of partnersMap.entries()) {
      const partnerUser = await User.findById(partnerId).catch(() => null);
      if (!partnerUser) continue;

      const unreadCount = await Message.countDocuments({
        sender_id: partnerId,
        receiver_id: userId,
        read: false
      });

      conversationsList.push({
        partnerId: partnerUser._id,
        partnerName: partnerUser.name,
        partnerAvatar: partnerUser.avatar || partnerUser.profilePhoto || 'https://i.pravatar.cc/150?img=5',
        partnerRole: partnerUser.role,
        lastMessage: data.lastMessage,
        lastMessageTime: new Date(data.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unreadCount
      });
    }

    res.json(conversationsList);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
