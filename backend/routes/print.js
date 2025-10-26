const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Device = require('../models/Device');
const Component = require('../models/Component');
const knex = require('knex')(require('../config/database').dbConfig);
const router = express.Router();

// GET /api/print/device/:id - Get device data for printing (all authenticated users)
router.get('/device/:id', authenticateToken, async (req, res) => {
  try {
    const device = new Device(knex);
    const deviceData = await device.getById(req.params.id);

    if (!deviceData) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Prepare data for printing
    const printData = {
      type: 'device',
      ...deviceData,
      components: deviceData.components || [],
      printDate: new Date().toISOString(),
      printedBy: req.user.username
    };

    res.json(printData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/print/component/:id - Get component data for printing (all authenticated users)
router.get('/component/:id', authenticateToken, async (req, res) => {
  try {
    const component = new Component(knex);
    const componentData = await component.getById(req.params.id);

    if (!componentData) {
      return res.status(404).json({ error: 'Component not found' });
    }

    // Prepare data for printing
    const printData = {
      type: 'component',
      ...componentData,
      printDate: new Date().toISOString(),
      printedBy: req.username
    };

    res.json(printData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/print/batch - Batch printing (all authenticated users)
router.post('/batch', authenticateToken, async (req, res) => {
  try {
    const { entity_type, ids } = req.body;

    if (!entity_type || !ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Entity type and a non-empty array of IDs are required' });
    }

    if (!['device', 'component'].includes(entity_type)) {
      return res.status(400).json({ error: 'Entity type must be "device" or "component"' });
    }

    let entities = [];
    if (entity_type === 'device') {
      const device = new Device(knex);
      for (const id of ids) {
        const entity = await device.getById(id);
        if (entity) {
          entities.push(entity);
        }
      }
    } else if (entity_type === 'component') {
      const component = new Component(knex);
      for (const id of ids) {
        const entity = await component.getById(id);
        if (entity) {
          entities.push(entity);
        }
      }
    }

    // Prepare data for printing
    const printData = {
      type: 'batch',
      entity_type,
      entities,
      printDate: new Date().toISOString(),
      printedBy: req.user.username
    };

    res.json(printData);
  } catch (error) {
    res.status(50).json({ error: error.message });
  }
});

module.exports = router;