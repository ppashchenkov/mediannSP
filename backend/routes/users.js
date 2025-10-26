const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const User = require('../models/User');
const knex = require('knex')(require('../config/database').dbConfig);
const { body, query, validationResult } = require('express-validator');
const router = express.Router();

// Validation middleware
const validateUser = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role_id').isInt({ min: 1 }).withMessage('Valid role ID is required')
];

const validateUserUpdate = [
  body('username').optional().notEmpty().withMessage('Username cannot be empty if provided'),
  body('email').optional().isEmail().withMessage('Valid email is required if provided'),
  body('role_id').optional().isInt({ min: 1 }).withMessage('Valid role ID is required if provided')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/users - Get list of users (admin only)
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const user = new User(knex);
    const result = await user.getAll(parseInt(page), parseInt(limit), search);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id - Get user by ID (admin only)
router.get('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const user = new User(knex);
    const foundUser = await user.getById(req.params.id);
    
    if (!foundUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(foundUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users - Create new user (admin only)
router.post('/', authenticateToken, authorizeRole(['admin']), validateUser, handleValidationErrors, async (req, res) => {
  try {
    const userData = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password, // Password will be hashed in the model
      role_id: req.body.role_id
    };
    
    const user = new User(knex);
    const newUser = await user.create(userData);
    
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', authenticateToken, authorizeRole(['admin']), validateUserUpdate, handleValidationErrors, async (req, res) => {
  try {
    const user = new User(knex);
    const existingUser = await user.getById(req.params.id);
    
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prepare update data (only include fields that are provided)
    const updateData = {};
    if (req.body.username) updateData.username = req.body.username;
    if (req.body.email) updateData.email = req.body.email;
    if (req.body.role_id) updateData.role_id = req.body.role_id;
    if (req.body.password) updateData.password = req.body.password; // Password will be hashed in the model
    
    const updatedUser = await user.update(req.params.id, updateData);
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const user = new User(knex);
    const deletedCount = await user.delete(req.params.id);
    
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;