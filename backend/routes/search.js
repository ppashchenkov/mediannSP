const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Device = require('../models/Device');
const Component = require('../models/Component');
const knex = require('knex')(require('../config/database').dbConfig);
const { query, validationResult } = require('express-validator');
const router = express.Router();

// Validation middleware for search
const validateSearch = [
  query('query').optional().trim().escape().isLength({ min: 1, max: 100 }).withMessage('Query must be between 1 and 100 characters'),
  query('entity_type').optional().isIn(['device', 'component', 'all']).withMessage('Entity type must be "device", "component", or "all"'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/search - Search across database (all authenticated users)
router.get('/', authenticateToken, validateSearch, handleValidationErrors, async (req, res) => {
  try {
    const { query: searchQuery, entity_type = 'all', page = 1, limit = 10 } = req.query;
    
    if (!searchQuery || searchQuery.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    let results = [];
    let totalCount = 0;
    
    if (entity_type === 'device' || entity_type === 'all') {
      const device = new Device(knex);
      const deviceResults = await device.getAll(
        parseInt(page), 
        parseInt(limit), 
        searchQuery
      );
      
      results = results.concat(deviceResults.devices.map(d => ({ ...d, entity_type: 'device' })));
      totalCount += deviceResults.totalCount;
    }
    
    if (entity_type === 'component' || entity_type === 'all') {
      const component = new Component(knex);
      const componentResults = await component.getAll(
        parseInt(page), 
        parseInt(limit), 
        searchQuery
      );
      
      results = results.concat(componentResults.components.map(c => ({ ...c, entity_type: 'component' })));
      totalCount += componentResults.totalCount;
    }
    
    // Sort results by relevance (for now, just by creation date)
    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Apply pagination to combined results
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = results.slice(startIndex, startIndex + parseInt(limit));
    
    res.json({
      results: paginatedResults,
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / limit)
    });
 } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/search/advanced - Advanced search with filters (all authenticated users)
router.post('/advanced', authenticateToken, async (req, res) => {
  try {
    const { filters, entity_type = 'all', page = 1, limit = 10 } = req.body;
    
    let results = [];
    let totalCount = 0;
    
    if (entity_type === 'device' || entity_type === 'all') {
      const device = new Device(knex);
      // For advanced search, we'll use the same getAll method but with more specific filters
      // In a real implementation, you would create more specific query methods
      const deviceResults = await device.getAll(
        parseInt(page), 
        parseInt(limit), 
        filters.search || '',
        filters.device_type_id || null,
        filters.status || null,
        filters.location || null
      );
      
      results = results.concat(deviceResults.devices.map(d => ({ ...d, entity_type: 'device' })));
      totalCount += deviceResults.totalCount;
    }
    
    if (entity_type === 'component' || entity_type === 'all') {
      const component = new Component(knex);
      const componentResults = await component.getAll(
        parseInt(page), 
        parseInt(limit), 
        filters.search || '',
        filters.component_type_id || null,
        filters.status || null
      );
      
      results = results.concat(componentResults.components.map(c => ({ ...c, entity_type: 'component' })));
      totalCount += componentResults.totalCount;
    }
    
    // Sort results by relevance (for now, just by creation date)
    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Apply pagination to combined results
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = results.slice(startIndex, startIndex + parseInt(limit));
    
    res.json({
      results: paginatedResults,
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    res.status(50).json({ error: error.message });
  }
});

module.exports = router;