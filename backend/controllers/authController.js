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

// Register function has been removed - self-registration is disabled
// Only admins can create users through the /api/users endpoint

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
  login,
  logout,
  refreshToken
};