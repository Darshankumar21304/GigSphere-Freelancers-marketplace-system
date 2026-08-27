const { Message } = require('../models');

exports.getChatHistory = async (req, res) => {
  try {
    const { user1_id, user2_id } = req.params;

    // Find messages between the two users
    let chatMessages = await Message.find({
      $or: [
        { sender_id: user1_id, receiver_id: user2_id },
        { sender_id: user2_id, receiver_id: user1_id }
      ]
    })
    .sort({ timestamp: 1 })
    .populate('sender_id', 'name')
    .populate('receiver_id', 'name');

    // Format the response to match the previous structure
    const formattedMessages = chatMessages.map(m => {
      const msgObj = m.toObject();
      return {
        ...msgObj,
        sender: msgObj.sender_id ? { id: msgObj.sender_id._id, name: msgObj.sender_id.name } : null,
        receiver: msgObj.receiver_id ? { id: msgObj.receiver_id._id, name: msgObj.receiver_id.name } : null
      };
    });

    res.json(formattedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching messages.' });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    // File uploaded successfully, return URL
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({ fileUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error uploading file' });
  }
};
