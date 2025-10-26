const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const knex = require('knex')(require('../config/database').dbConfig);

const generateToken = (userId, username, roleId) => {
  return jwt.sign(
    { userId, username, roleId },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

const register = async (req, res) => {
  try {
    const { username, email, password, roleId } = req.body;

    // Check if user already exists
    const existingUser = await new User(knex).getByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email already exists
    const existingEmail = await new User(knex).getByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // If this is the first user, assign admin role if no roleId provided
    let assignedRoleId = roleId;
    if (!assignedRoleId) {
      const userCount = await knex('users').count('* as count').first();
      if (parseInt(userCount.count) === 0) {
        // Create admin role if it doesn't exist
        let adminRole = await new Role(knex).getByName('admin');
        if (!adminRole) {
          adminRole = await new Role(knex).create({ name: 'admin', description: 'Administrator with full access' });
        }
        assignedRoleId = adminRole.id;
      } else {
        // For non-first users, assign reader role by default
        let readerRole = await new Role(knex).getByName('reader');
        if (!readerRole) {
          readerRole = await new Role(knex).create({ name: 'reader', description: 'Read-only access' });
        }
        assignedRoleId = readerRole.id;
      }
    }

    // Create the user
    const userData = {
      username,
      email,
      password, // The model will handle hashing
      role_id: assignedRoleId
    };

    const user = await new User(knex).create(userData);

    // Generate token
    const token = generateToken(user.id, user.username, user.role_id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role_name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username
    const user = await new User(knex).getByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isPasswordValid = await new User(knex).comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id, user.username, user.role_id);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role_name
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  // In a real application, you might add the token to a blacklist
  res.json({ message: 'Logged out successfully' });
};

const refreshToken = (req, res) => {
  // In a real application, you would implement refresh token logic
  res.status(401).json({ error: 'Refresh token not implemented' });
};

module.exports = {
  register,
  login,
  logout,
  refreshToken
};