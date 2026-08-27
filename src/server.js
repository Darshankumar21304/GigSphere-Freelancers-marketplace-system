require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const { Message } = require('./models');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Room id can be a combination of user1_id and user2_id like '1_2' (smaller_larger)
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on('send_message', async (data) => {
    try {
      // Save message to MongoDB
      const newMessage = await Message.create({
        sender_id: data.sender_id,
        receiver_id: data.receiver_id,
        message_text: data.message_text,
        file_url: data.file_url || null,
        room: data.room
      });

      // Emit to the room
      io.to(data.room).emit('receive_message', {
        id: newMessage._id,
        sender_id: newMessage.sender_id,
        receiver_id: newMessage.receiver_id,
        message_text: newMessage.message_text,
        file_url: newMessage.file_url,
        timestamp: newMessage.createdAt,
        room: newMessage.room
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('typing', (data) => {
    socket.to(data.room).emit('user_typing', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start the server:', error);
  }
};

startServer();
