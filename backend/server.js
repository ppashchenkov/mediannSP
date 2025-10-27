const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { dbConfig, environment } = require('./config/database');
const knex = require('knex')(dbConfig);

// Function to initialize the admin user
const initializeAdminUser = async () => {
  const bcrypt = require('bcryptjs');
  const User = require('./models/User');
  const Role = require('./models/Role');
  
  try {
    // Check if admin user already exists
    const adminUser = await knex('users').where({ email: 'ua3aaz@gmail.com' }).first();
    
    if (!adminUser) {
      // Create admin role if it doesn't exist
      let adminRole = await knex('roles').where({ name: 'admin' }).first();
      if (!adminRole) {
        const [roleId] = await knex('roles').insert({
          name: 'admin',
          description: 'Administrator with full access'
        });
        adminRole = { id: roleId };
      }
      
      // Hash the admin password
      const hashedPassword = await bcrypt.hash('vtjCH60(', 10);
      
      // Create the admin user
      await knex('users').insert({
        username: 'admin',
        email: 'ua3aaz@gmail.com',
        password_hash: hashedPassword,
        role_id: adminRole.id,
        created_at: knex.fn.now(),
        updated_at: knex.fn.now()
      });
      
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
};

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');
const deviceRoutes = require('./routes/devices');
const componentRoutes = require('./routes/components');
const photoRoutes = require('./routes/photos');
const searchRoutes = require('./routes/search');
const printRoutes = require('./routes/print');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
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

// Initialize the admin user when the server starts
initializeAdminUser();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${environment} mode`);
  console.log(`Database client: ${dbConfig.client}`);
});

module.exports = app;