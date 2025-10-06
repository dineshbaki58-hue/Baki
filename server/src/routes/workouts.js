const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { db } = require('../config/database');

const router = express.Router();

// Get all workouts with filtering and pagination
router.get('/', [
  query('category').optional().isIn(['strength', 'cardio', 'yoga', 'pilates', 'hiit', 'flexibility', 'sports', 'dance']),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  query('duration').optional().isInt({ min: 1 }),
  query('is_premium').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      category,
      difficulty,
      duration,
      is_premium,
      page = 1,
      limit = 20,
      search
    } = req.query;

    let query = db('workouts')
      .select('*')
      .where('is_featured', true)
      .orderBy('rating', 'desc')
      .orderBy('view_count', 'desc');

    // Apply filters
    if (category) {
      query = query.where('category', category);
    }
    if (difficulty) {
      query = query.where('difficulty', difficulty);
    }
    if (duration) {
      query = query.where('duration_minutes', '<=', duration);
    }
    if (is_premium !== undefined) {
      query = query.where('is_premium', is_premium === 'true');
    }
    if (search) {
      query = query.where(function() {
        this.where('title', 'ilike', `%${search}%`)
            .orWhere('description', 'ilike', `%${search}%`)
            .orWhere('tags', 'ilike', `%${search}%`);
      });
    }

    // Get total count
    const totalQuery = query.clone();
    const [{ count }] = await totalQuery.count('* as count');

    // Apply pagination
    const offset = (page - 1) * limit;
    const workouts = await query.limit(limit).offset(offset);

    res.json({
      workouts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(count),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get featured workouts
router.get('/featured', async (req, res) => {
  try {
    const workouts = await db('workouts')
      .where('is_featured', true)
      .orderBy('rating', 'desc')
      .limit(10);

    res.json({ workouts });
  } catch (error) {
    console.error('Get featured workouts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get workout by ID
router.get('/:id', async (req, res) => {
  try {
    const workout = await db('workouts')
      .where('id', req.params.id)
      .first();

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Increment view count
    await db('workouts')
      .where('id', req.params.id)
      .increment('view_count', 1);

    res.json({ workout });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Rate workout
router.post('/:id/rate', [
  body('rating').isFloat({ min: 1, max: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating } = req.body;
    const workoutId = req.params.id;

    // Check if workout exists
    const workout = await db('workouts').where('id', workoutId).first();
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    // Update rating (simplified - in production, you'd want to track individual user ratings)
    const newRatingCount = workout.rating_count + 1;
    const newRating = ((workout.rating * workout.rating_count) + rating) / newRatingCount;

    await db('workouts')
      .where('id', workoutId)
      .update({
        rating: newRating,
        rating_count: newRatingCount
      });

    res.json({ 
      message: 'Rating submitted successfully',
      newRating: Math.round(newRating * 100) / 100
    });
  } catch (error) {
    console.error('Rate workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get workout categories
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await db('workouts')
      .select('category')
      .count('* as count')
      .groupBy('category')
      .orderBy('count', 'desc');

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get workouts by category
router.get('/category/:category', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const workouts = await db('workouts')
      .where('category', category)
      .orderBy('rating', 'desc')
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db('workouts')
      .where('category', category)
      .count('* as count');

    res.json({
      workouts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(count),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get workouts by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search workouts
router.get('/search/:query', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const { query: searchQuery } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const workouts = await db('workouts')
      .where(function() {
        this.where('title', 'ilike', `%${searchQuery}%`)
            .orWhere('description', 'ilike', `%${searchQuery}%`)
            .orWhere('tags', 'ilike', `%${searchQuery}%`);
      })
      .orderBy('rating', 'desc')
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db('workouts')
      .where(function() {
        this.where('title', 'ilike', `%${searchQuery}%`)
            .orWhere('description', 'ilike', `%${searchQuery}%`)
            .orWhere('tags', 'ilike', `%${searchQuery}%`);
      })
      .count('* as count');

    res.json({
      workouts,
      query: searchQuery,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(count),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Search workouts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;