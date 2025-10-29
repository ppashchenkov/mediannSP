const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const Contract = require('../models/Contract');
const knex = require('knex')(require('../config/database').dbConfig);
const { body, query, validationResult } = require('express-validator');
const router = express.Router();

// Validation middleware
const validateContract = [
  body('contract_number').notEmpty().withMessage('Contract number is required'),
  body('contract_date').isISO8601().withMessage('Valid contract date is required'),
  body('user_id').isInt({ min: 1 }).withMessage('Valid user ID is required')
];

const validateContractUpdate = [
  body('contract_number').optional().notEmpty().withMessage('Contract number cannot be empty if provided'),
  body('contract_date').optional().isISO8601().withMessage('Valid contract date is required if provided'),
  body('user_id').optional().isInt({ min: 1 }).withMessage('Valid user ID is required if provided')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/contracts - Get list of contracts (all authenticated users)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const contract = new Contract(knex);
    const result = await contract.getAll(
      parseInt(page), 
      parseInt(limit), 
      search
    );
    
    res.json(result);
 } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/contracts/:id - Get contract by ID (all authenticated users)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const contract = new Contract(knex);
    const foundContract = await contract.getById(req.params.id);
    
    if (!foundContract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.json(foundContract);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/contracts - Create new contract (writer and admin only)
router.post('/', authenticateToken, authorizeRole(['writer', 'admin']), validateContract, handleValidationErrors, async (req, res) => {
  try {
    const contractData = {
      contract_number: req.body.contract_number,
      contract_date: req.body.contract_date,
      user_id: req.body.user_id,
      updated_at: knex.fn.now(),
      created_at: knex.fn.now()
    };
    
    const contract = new Contract(knex);
    const newContract = await contract.create(contractData);
    
    res.status(201).json(newContract);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/contracts/:id - Update contract (writer and admin only)
router.put('/:id', authenticateToken, authorizeRole(['writer', 'admin']), validateContractUpdate, handleValidationErrors, async (req, res) => {
  try {
    const contract = new Contract(knex);
    const existingContract = await contract.getById(req.params.id);
    
    if (!existingContract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    // Prepare update data (only include fields that are provided)
    const updateData = {};
    if (req.body.contract_number) updateData.contract_number = req.body.contract_number;
    if (req.body.contract_date) updateData.contract_date = req.body.contract_date;
    if (req.body.user_id) updateData.user_id = req.body.user_id;
    updateData.updated_at = knex.fn.now();
    
    const updatedContract = await contract.update(req.params.id, updateData);
    
    res.json(updatedContract);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/contracts/:id - Delete contract (admin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const contract = new Contract(knex);
    const deletedCount = await contract.delete(req.params.id);
    
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.json({ message: 'Contract deleted successfully' });
 } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;