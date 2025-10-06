const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { db } = require('../config/database');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin authentication
router.use(requireAdmin);

// Dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      premiumUsers,
      totalWorkouts,
      totalNutritionPlans,
      recentSignups,
      revenueData
    ] = await Promise.all([
      db('users').count('* as count').first(),
      db('users').where('last_login_at', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).count('* as count').first(),
      db('users').where('is_premium', true).count('* as count').first(),
      db('workouts').count('* as count').first(),
      db('nutrition_plans').count('* as count').first(),
      db('users').select('id', 'email', 'first_name', 'last_name', 'created_at')
        .orderBy('created_at', 'desc')
        .limit(10),
      db('subscriptions')
        .select(db.raw('DATE(created_at) as date'))
        .count('* as count')
        .where('status', 'active')
        .groupBy('date')
        .orderBy('date', 'desc')
        .limit(30)
    ]);

    res.json({
      stats: {
        totalUsers: parseInt(totalUsers.count),
        activeUsers: parseInt(activeUsers.count),
        premiumUsers: parseInt(premiumUsers.count),
        totalWorkouts: parseInt(totalWorkouts.count),
        totalNutritionPlans: parseInt(totalNutritionPlans.count)
      },
      recentSignups,
      revenueData
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User management
router.get('/users', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('is_premium').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page = 1, limit = 20, search, is_premium } = req.query;

    let query = db('users')
      .select('id', 'email', 'first_name', 'last_name', 'is_premium', 'is_verified', 'created_at', 'last_login_at');

    if (search) {
      query = query.where(function() {
        this.where('email', 'ilike', `%${search}%`)
            .orWhere('first_name', 'ilike', `%${search}%`)
            .orWhere('last_name', 'ilike', `%${search}%`);
      });
    }

    if (is_premium !== undefined) {
      query = query.where('is_premium', is_premium === 'true');
    }

    const offset = (page - 1) * limit;
    const users = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const [{ count }] = await query.clone().count('* as count');

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(count),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/users/:id', [
  body('is_premium').optional().isBoolean(),
  body('is_verified').optional().isBoolean(),
  body('role').optional().isIn(['user', 'admin', 'instructor'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = {};

    if (req.body.is_premium !== undefined) updates.is_premium = req.body.is_premium;
    if (req.body.is_verified !== undefined) updates.is_verified = req.body.is_verified;
    if (req.body.role !== undefined) updates.role = req.body.role;

    const [updatedUser] = await db('users')
      .where('id', id)
      .update(updates)
      .returning('*');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Workout management
router.post('/workouts', [
  body('title').trim().notEmpty(),
  body('description').optional().trim(),
  body('category').isIn(['strength', 'cardio', 'yoga', 'pilates', 'hiit', 'flexibility', 'sports', 'dance']),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']),
  body('duration_minutes').isInt({ min: 1 }),
  body('calories_burned').optional().isInt({ min: 0 }),
  body('video_url').isURL(),
  body('thumbnail_url').optional().isURL(),
  body('equipment_needed').optional().isArray(),
  body('muscle_groups').optional().isArray(),
  body('tags').optional().isArray(),
  body('is_premium').optional().isBoolean(),
  body('is_featured').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const [workout] = await db('workouts')
      .insert({
        ...req.body,
        instructor_id: req.user.id
      })
      .returning('*');

    res.status(201).json({ workout });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update workout
router.put('/workouts/:id', [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('category').optional().isIn(['strength', 'cardio', 'yoga', 'pilates', 'hiit', 'flexibility', 'sports', 'dance']),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('duration_minutes').optional().isInt({ min: 1 }),
  body('calories_burned').optional().isInt({ min: 0 }),
  body('video_url').optional().isURL(),
  body('thumbnail_url').optional().isURL(),
  body('equipment_needed').optional().isArray(),
  body('muscle_groups').optional().isArray(),
  body('tags').optional().isArray(),
  body('is_premium').optional().isBoolean(),
  body('is_featured').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = { ...req.body };

    const [updatedWorkout] = await db('workouts')
      .where('id', id)
      .update(updates)
      .returning('*');

    if (!updatedWorkout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({ workout: updatedWorkout });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete workout
router.delete('/workouts/:id', async (req, res) => {
  try {
    const deleted = await db('workouts')
      .where('id', req.params.id)
      .del();

    if (!deleted) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all workouts for admin
router.get('/workouts', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isIn(['strength', 'cardio', 'yoga', 'pilates', 'hiit', 'flexibility', 'sports', 'dance']),
  query('is_premium').optional().isBoolean(),
  query('is_featured').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page = 1, limit = 20, category, is_premium, is_featured } = req.query;

    let query = db('workouts')
      .select('*')
      .orderBy('created_at', 'desc');

    if (category) {
      query = query.where('category', category);
    }
    if (is_premium !== undefined) {
      query = query.where('is_premium', is_premium === 'true');
    }
    if (is_featured !== undefined) {
      query = query.where('is_featured', is_featured === 'true');
    }

    const offset = (page - 1) * limit;
    const workouts = await query.limit(limit).offset(offset);

    const [{ count }] = await query.clone().count('* as count');

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

// Get subscription analytics
router.get('/subscriptions/analytics', async (req, res) => {
  try {
    const [
      totalRevenue,
      monthlyRevenue,
      subscriptionStats,
      churnRate
    ] = await Promise.all([
      db('subscriptions')
        .sum('amount as total')
        .where('status', 'active')
        .first(),
      db('subscriptions')
        .sum('amount as total')
        .where('status', 'active')
        .where('created_at', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .first(),
      db('subscriptions')
        .select('plan')
        .count('* as count')
        .where('status', 'active')
        .groupBy('plan'),
      calculateChurnRate()
    ]);

    res.json({
      totalRevenue: parseFloat(totalRevenue.total || 0),
      monthlyRevenue: parseFloat(monthlyRevenue.total || 0),
      subscriptionStats,
      churnRate
    });
  } catch (error) {
    console.error('Get subscription analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate churn rate
async function calculateChurnRate() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const [totalActive, canceled] = await Promise.all([
    db('subscriptions')
      .count('* as count')
      .where('status', 'active')
      .where('created_at', '<=', thirtyDaysAgo)
      .first(),
    db('subscriptions')
      .count('* as count')
      .where('status', 'canceled')
      .where('canceled_at', '>=', thirtyDaysAgo)
      .first()
  ]);

  const total = parseInt(totalActive.count);
  const churned = parseInt(canceled.count);
  
  return total > 0 ? (churned / total) * 100 : 0;
}

module.exports = router;