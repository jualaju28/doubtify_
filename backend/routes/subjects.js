import express from 'express';
import Subject from '../models/Subject.js';

const router = express.Router();

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.findAll();

    res.json({
      success: true,
      data: { subjects }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get a single subject by ID
// @route   GET /api/subjects/:id
// @access  Public
const getSubject = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id);
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    res.json({
      success: true,
      data: { subject }
    });

  } catch (error) {
    next(error);
  }
};

// Routes
router.get('/', getSubjects);
router.get('/:id', getSubject);

export default router;