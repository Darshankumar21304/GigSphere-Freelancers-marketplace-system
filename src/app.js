const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/authRoutes');
const gigRoutes = require('./routes/gigRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');
const walletRoutes = require('./routes/walletRoutes');
const contractRoutes = require('./routes/contractRoutes');
// Other routes like orderRoutes, etc.

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads directory for static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/messages', require('./routes/messageRoutes'));

// Base route
app.get('/', (req, res) => {
  res.send('Welcome to GigSphere API');
});

module.exports = app;
