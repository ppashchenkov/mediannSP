const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const Photo = require('../models/Photo');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const knex = require('knex')(require('../config/database').dbConfig);
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/photos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Validation middleware
const validatePhoto = [
  body('entity_type').isIn(['device', 'component']).withMessage('Entity type must be "device" or "component"'),
  body('entity_id').isInt({ min: 1 }).withMessage('Valid entity ID is required')
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
 const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// POST /api/photos - Upload new photo (writer and admin only)
router.post('/', authenticateToken, authorizeRole(['writer', 'admin']), upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo file provided' });
    }

    const { entity_type, entity_id } = req.body;

    // Validate entity_type and entity_id
    if (!entity_type || !entity_id) {
      return res.status(400).json({ error: 'Entity type and entity ID are required' });
    }

    if (!['device', 'component'].includes(entity_type)) {
      return res.status(400).json({ error: 'Entity type must be "device" or "component"' });
    }

    // Create photo record in database
    const photoData = {
      entity_type,
      entity_id: parseInt(entity_id),
      file_path: req.file.path,
      file_name: req.file.originalname,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_by: req.user.id
    };

    const photo = new Photo(knex);
    const newPhoto = await photo.create(photoData);

    res.status(201).json(newPhoto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/photos/:entity_type/:entity_id - Get photos for an entity (all authenticated users)
router.get('/:entity_type/:entity_id', authenticateToken, async (req, res) => {
 try {
    const { entity_type, entity_id } = req.params;

    if (!['device', 'component'].includes(entity_type)) {
      return res.status(400).json({ error: 'Entity type must be "device" or "component"' });
    }

    if (isNaN(entity_id) || parseInt(entity_id) <= 0) {
      return res.status(400).json({ error: 'Valid entity ID is required' });
    }

    const photo = new Photo(knex);
    const photos = await photo.getAllByEntity(entity_type, parseInt(entity_id));

    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/photos/:id - Get specific photo file (all authenticated users)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const photo = new Photo(knex);
    const photoRecord = await photo.getById(req.params.id);

    if (!photoRecord) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Check if file exists
    if (!fs.existsSync(photoRecord.file_path)) {
      return res.status(404).json({ error: 'Photo file not found' });
    }

    res.sendFile(path.resolve(photoRecord.file_path));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/photos/:id/set-primary - Set photo as primary (writer and admin only)
router.put('/:id/set-primary', authenticateToken, authorizeRole(['writer', 'admin']), async (req, res) => {
  try {
    const photo = new Photo(knex);
    const photoRecord = await photo.getById(req.params.id);

    if (!photoRecord) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Set as primary
    const updatedPhoto = await photo.setAsPrimary(req.params.id, photoRecord.entity_type, photoRecord.entity_id);

    res.json(updatedPhoto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/photos/:id - Delete photo (writer and admin only)
router.delete('/:id', authenticateToken, authorizeRole(['writer', 'admin']), async (req, res) => {
  try {
    const photo = new Photo(knex);
    const photoRecord = await photo.getById(req.params.id);

    if (!photoRecord) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Delete the file from the filesystem
    if (fs.existsSync(photoRecord.file_path)) {
      fs.unlinkSync(photoRecord.file_path);
    }

    // Delete the record from the database
    await photo.delete(req.params.id);

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;