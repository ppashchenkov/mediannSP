const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { dbConfig, environment } = require('./config/database');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const deviceRoutes = require('./routes/devices');
const componentRoutes = require('./routes/components');
const photoRoutes = require('./routes/photos');
const searchRoutes = require('./routes/search');
const printRoutes = require('./routes/print');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/print', printRoutes);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${environment} mode`);
  console.log(`Database client: ${dbConfig.client}`);
});

module.exports = app;