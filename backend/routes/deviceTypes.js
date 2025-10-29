const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const DeviceType = require('../models/DeviceType');
const knex = require('knex')(require('../config/database').dbConfig);
const router = express.Router();

// GET /api/device-types - Get list of device types (all authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const deviceType = new DeviceType(knex);
    const deviceTypes = await deviceType.getAll();
    res.json({ device_types: deviceTypes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/device-types/:id - Get device type by ID (all authenticated users)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const deviceType = new DeviceType(knex);
    const foundDeviceType = await deviceType.getById(req.params.id);
    
    if (!foundDeviceType) {
      return res.status(404).json({ error: 'Device type not found' });
    }
    
    res.json(foundDeviceType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/device-types - Create new device type (admin only)
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const deviceTypeData = {
      name: req.body.name
    };
    
    const deviceType = new DeviceType(knex);
    const newDeviceType = await deviceType.create(deviceTypeData);
    
    res.status(201).json(newDeviceType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/device-types/:id - Update device type (admin only)
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const deviceType = new DeviceType(knex);
    const existingDeviceType = await deviceType.getById(req.params.id);
    
    if (!existingDeviceType) {
      return res.status(404).json({ error: 'Device type not found' });
    }
    
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    
    const updatedDeviceType = await deviceType.update(req.params.id, updateData);
    
    res.json(updatedDeviceType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/device-types/:id - Delete device type (admin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const deviceType = new DeviceType(knex);
    const deletedCount = await deviceType.delete(req.params.id);
    
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Device type not found' });
    }
    
    res.json({ message: 'Device type deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;