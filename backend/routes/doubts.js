import express from 'express';
import { body, validationResult } from 'express-validator';
import Doubt from '../models/Doubt.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateDoubt = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 255 })
    .withMessage('Title must be between 10 and 255 characters'),
  body('description')
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Description must be between 20 and 5000 characters'),
  body('subjectId')
    .isInt({ min: 1 })
    .withMessage('Please select a valid subject'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

// @desc    Get all doubts with filters and pagination
// @route   GET /api/doubts
// @access  Public
const getDoubts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      subject,
      author,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 50), // Max 50 per page
      status,
      subjectId: subject ? parseInt(subject) : null,
      authorId: author ? parseInt(author) : null,
      search,
      sortBy,
      sortOrder,
      userId: req.user ? req.user.id : null
    };

    const [doubts, total] = await Promise.all([
      Doubt.findAll(options),
      Doubt.count(options)
    ]);

    const totalPages = Math.ceil(total / options.limit);

    res.json({
      success: true,
      data: {
        doubts,
        pagination: {
          currentPage: options.page,
          totalPages,
          totalCount: total,
          hasNext: options.page < totalPages,
          hasPrev: options.page > 1
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get a single doubt by ID
// @route   GET /api/doubts/:id
// @access  Public
const getDoubt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const doubt = await Doubt.findById(id, userId);
    
    if (!doubt) {
      return res.status(404).json({
        success: false,
        error: 'Doubt not found'
      });
    }

    // Increment view count (don't wait for it)
    doubt.incrementViews().catch(err => console.log('View increment failed:', err));

    res.json({
      success: true,
      data: { doubt }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Create a new doubt
// @route   POST /api/doubts
// @access  Private
const createDoubt = async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { title, description, subjectId, tags } = req.body;

    const doubtData = {
      title: title.trim(),
      description: description.trim(),
      authorId: req.user.id,
      subjectId: parseInt(subjectId),
      tags: tags || []
    };

    const doubt = await Doubt.create(doubtData);

    res.status(201).json({
      success: true,
      data: { doubt },
      message: 'Doubt created successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Update a doubt
// @route   PUT /api/doubts/:id
// @access  Private (Author only)
const updateDoubt = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const doubt = await Doubt.findById(id);
    
    if (!doubt) {
      return res.status(404).json({
        success: false,
        error: 'Doubt not found'
      });
    }

    // Check if user is the author
    if (doubt.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only edit your own doubts'
      });
    }

    const { title, description, subjectId, tags } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (subjectId) updateData.subject_id = parseInt(subjectId);
    if (tags) updateData.tags = tags;

    await doubt.update(updateData);

    res.json({
      success: true,
      data: { doubt },
      message: 'Doubt updated successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Delete a doubt
// @route   DELETE /api/doubts/:id
// @access  Private (Author only)
const deleteDoubt = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const doubt = await Doubt.findById(id);
    
    if (!doubt) {
      return res.status(404).json({
        success: false,
        error: 'Doubt not found'
      });
    }

    // Check if user is the author
    if (doubt.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own doubts'
      });
    }

    await doubt.delete();

    res.json({
      success: true,
      message: 'Doubt deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Accept a response for a doubt
// @route   POST /api/doubts/:id/accept/:responseId
// @access  Private (Author only)
const acceptResponse = async (req, res, next) => {
  try {
    const { id, responseId } = req.params;
    
    const doubt = await Doubt.findById(id);
    
    if (!doubt) {
      return res.status(404).json({
        success: false,
        error: 'Doubt not found'
      });
    }

    // Check if user is the author
    if (doubt.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Only the author can accept responses'
      });
    }

    await doubt.acceptResponse(parseInt(responseId));

    res.json({
      success: true,
      data: { doubt },
      message: 'Response accepted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get trending doubts
// @route   GET /api/doubts/trending
// @access  Public
const getTrending = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);
    const doubts = await Doubt.getTrending(limit);

    res.json({
      success: true,
      data: { doubts }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get featured doubts
// @route   GET /api/doubts/featured
// @access  Public
const getFeatured = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 5, 10);
    const doubts = await Doubt.getFeatured(limit);

    res.json({
      success: true,
      data: { doubts }
    });

  } catch (error) {
    next(error);
  }
};

// Routes
router.get('/trending', getTrending);
router.get('/featured', getFeatured);
router.get('/', optionalAuth, getDoubts);
router.get('/:id', optionalAuth, getDoubt);
router.post('/', protect, validateDoubt, createDoubt);
router.put('/:id', protect, updateDoubt);
router.delete('/:id', protect, deleteDoubt);
router.post('/:id/accept/:responseId', protect, acceptResponse);

export default router;