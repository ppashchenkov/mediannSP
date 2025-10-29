const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const Device = require('../models/Device');
const DeviceType = require('../models/DeviceType');
const knex = require('knex')(require('../config/database').dbConfig);
const { body, query, validationResult } = require('express-validator');
const router = express.Router();

// Validation middleware
const validateDevice = [
  body('name').notEmpty().withMessage('Device name is required'),
  body('device_type_id').isInt({ min: 1 }).withMessage('Valid device type ID is required'),
  body('contract_id').isInt({ min: 1 }).withMessage('Valid contract ID is required')
];

const validateDeviceUpdate = [
  body('name').optional().notEmpty().withMessage('Device name cannot be empty if provided'),
  body('device_type_id').optional().isInt({ min: 1 }).withMessage('Valid device type ID is required if provided'),
  body('contract_id').optional().isInt({ min: 1 }).withMessage('Valid contract ID is required if provided')
];

const validateDeviceComponent = [
  body('component_id').isInt({ min: 1 }).withMessage('Valid component ID is required')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/devices - Get list of devices (all authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', device_type_id, status, location } = req.query;
    
    const device = new Device(knex);
    const result = await device.getAll(
      parseInt(page), 
      parseInt(limit), 
      search, 
      device_type_id ? parseInt(device_type_id) : null,
      status,
      location
    );
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/devices/:id - Get device by ID (all authenticated users)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const device = new Device(knex);
    const foundDevice = await device.getById(req.params.id);
    
    if (!foundDevice) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json(foundDevice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/devices - Create new device (writer and admin only)
router.post('/', authenticateToken, authorizeRole(['writer', 'admin']), validateDevice, handleValidationErrors, async (req, res) => {
  try {
    const deviceData = {
      name: req.body.name,
      serial_number: req.body.serial_number,
      device_type_id: req.body.device_type_id,
      manufacturer: req.body.manufacturer,
      model: req.body.model,
      specifications: req.body.specifications || {},
      location: req.body.location,
      purchase_date: req.body.purchase_date,
      warranty_date: req.body.warranty_date,
      status: req.body.status || 'active',
      contract_id: req.body.contract_id, // Add contract ID
      created_by: req.user.id // Set the creator to the authenticated user
    };
    
    const device = new Device(knex);
    const newDevice = await device.create(deviceData);
    
    res.status(201).json(newDevice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/devices/:id - Update device (writer and admin only)
router.put('/:id', authenticateToken, authorizeRole(['writer', 'admin']), validateDeviceUpdate, handleValidationErrors, async (req, res) => {
  try {
    const device = new Device(knex);
    const existingDevice = await device.getById(req.params.id);
    
    if (!existingDevice) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    // Prepare update data (only include fields that are provided)
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.serial_number !== undefined) updateData.serial_number = req.body.serial_number;
    if (req.body.device_type_id) updateData.device_type_id = req.body.device_type_id;
    if (req.body.manufacturer) updateData.manufacturer = req.body.manufacturer;
    if (req.body.model) updateData.model = req.body.model;
    if (req.body.specifications) updateData.specifications = req.body.specifications;
    if (req.body.location) updateData.location = req.body.location;
    if (req.body.purchase_date) updateData.purchase_date = req.body.purchase_date;
    if (req.body.warranty_date) updateData.warranty_date = req.body.warranty_date;
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.contract_id) updateData.contract_id = req.body.contract_id; // Add contract ID if provided
    updateData.updated_by = req.user.id; // Set the updater to the authenticated user
    
    const updatedDevice = await device.update(req.params.id, updateData);
    
    res.json(updatedDevice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/devices/:id - Delete device (admin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const device = new Device(knex);
    const deletedCount = await device.delete(req.params.id);
    
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json({ message: 'Device deleted successfully' });
 } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/devices/:id/components - Get components for a specific device (all authenticated users)
router.get('/:id/components', authenticateToken, async (req, res) => {
  try {
    const device = new Device(knex);
    const foundDevice = await device.getById(req.params.id);
    
    if (!foundDevice) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json(foundDevice.components);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/devices/:device_id/components - Add component to device (writer and admin only)
router.post('/:device_id/components', authenticateToken, authorizeRole(['writer', 'admin']), validateDeviceComponent, handleValidationErrors, async (req, res) => {
  try {
    const device = new Device(knex);
    
    // Check if device exists
    const existingDevice = await device.getById(req.params.device_id);
    if (!existingDevice) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    // Add the component to the device
    const result = await device.addComponent(
      parseInt(req.params.device_id), 
      parseInt(req.body.component_id), 
      req.user.id
    );
    
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/devices/:device_id/components/:component_id - Remove component from device (writer and admin only)
router.delete('/:device_id/components/:component_id', authenticateToken, authorizeRole(['writer', 'admin']), async (req, res) => {
  try {
    const device = new Device(knex);
    
    // Check if device exists
    const existingDevice = await device.getById(req.params.device_id);
    if (!existingDevice) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    // Remove the component from the device
    const result = await device.removeComponent(
      parseInt(req.params.device_id), 
      parseInt(req.params.component_id)
    );
    
    if (result === 0) {
      return res.status(404).json({ error: 'Component not found in device or already removed' });
    }
    
    res.json({ message: 'Component removed from device successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;