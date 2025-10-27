const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const Role = require('../models/Role');
const knex = require('knex')(require('../config/database').dbConfig);
const router = express.Router();

// GET /api/roles - Get list of roles (admin only)
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const role = new Role(knex);
    const roles = await role.getAll();
    res.json({ roles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/roles/:id - Get role by ID (admin only)
router.get('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const role = new Role(knex);
    const foundRole = await role.getById(req.params.id);
    
    if (!foundRole) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    res.json(foundRole);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/roles - Create new role (admin only)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const roleData = {
      name: req.body.name
    };
    
    const role = new Role(knex);
    const newRole = await role.create(roleData);
    
    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/roles/:id - Update role (admin only)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const role = new Role(knex);
    const existingRole = await role.getById(req.params.id);
    
    if (!existingRole) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    
    const updatedRole = await role.update(req.params.id, updateData);
    
    res.json(updatedRole);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/roles/:id - Delete role (admin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const role = new Role(knex);
    const deletedCount = await role.delete(req.params.id);
    
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Role not found' });
    }
    
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;