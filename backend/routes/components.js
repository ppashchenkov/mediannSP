const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const Component = require('../models/Component');
const ComponentType = require('../models/ComponentType');
const knex = require('knex')(require('../config/database').dbConfig);
const { body, query, validationResult } = require('express-validator');
const router = express.Router();

// Validation middleware
const validateComponent = [
  body('name').notEmpty().withMessage('Component name is required'),
  body('component_type_id').isInt({ min: 1 }).withMessage('Valid component type ID is required')
];

const validateComponentUpdate = [
  body('name').optional().notEmpty().withMessage('Component name cannot be empty if provided'),
  body('component_type_id').optional().isInt({ min: 1 }).withMessage('Valid component type ID is required if provided')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/components - Get list of components (all authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', component_type_id, status } = req.query;
    
    const component = new Component(knex);
    const result = await component.getAll(
      parseInt(page), 
      parseInt(limit), 
      search, 
      component_type_id ? parseInt(component_type_id) : null,
      status
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/components/:id - Get component by ID (all authenticated users)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const component = new Component(knex);
    const foundComponent = await component.getById(req.params.id);
    
    if (!foundComponent) {
      return res.status(404).json({ error: 'Component not found' });
    }
    
    res.json(foundComponent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/components - Create new component (writer and admin only)
router.post('/', authenticateToken, authorizeRole(['writer', 'admin']), validateComponent, handleValidationErrors, async (req, res) => {
  try {
    const componentData = {
      name: req.body.name,
      serial_number: req.body.serial_number,
      component_type_id: req.body.component_type_id,
      manufacturer: req.body.manufacturer,
      model: req.body.model,
      specifications: req.body.specifications || {},
      purchase_date: req.body.purchase_date,
      warranty_date: req.body.warranty_date,
      status: req.body.status || 'active',
      created_by: req.user.id // Set the creator to the authenticated user
    };
    
    const component = new Component(knex);
    const newComponent = await component.create(componentData);
    
    res.status(201).json(newComponent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/components/:id - Update component (writer and admin only)
router.put('/:id', authenticateToken, authorizeRole(['writer', 'admin']), validateComponentUpdate, handleValidationErrors, async (req, res) => {
  try {
    const component = new Component(knex);
    const existingComponent = await component.getById(req.params.id);
    
    if (!existingComponent) {
      return res.status(404).json({ error: 'Component not found' });
    }
    
    // Prepare update data (only include fields that are provided)
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.serial_number !== undefined) updateData.serial_number = req.body.serial_number;
    if (req.body.component_type_id) updateData.component_type_id = req.body.component_type_id;
    if (req.body.manufacturer) updateData.manufacturer = req.body.manufacturer;
    if (req.body.model) updateData.model = req.body.model;
    if (req.body.specifications) updateData.specifications = req.body.specifications;
    if (req.body.purchase_date) updateData.purchase_date = req.body.purchase_date;
    if (req.body.warranty_date) updateData.warranty_date = req.body.warranty_date;
    if (req.body.status) updateData.status = req.body.status;
    updateData.updated_by = req.user.id; // Set the updater to the authenticated user
    
    const updatedComponent = await component.update(req.params.id, updateData);
    
    res.json(updatedComponent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/components/:id - Delete component (admin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const component = new Component(knex);
    const deletedCount = await component.delete(req.params.id);
    
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Component not found' });
    }
    
    res.json({ message: 'Component deleted successfully' });
 } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;