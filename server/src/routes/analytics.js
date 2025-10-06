const express = require('express');
const { query, validationResult } = require('express-validator');
const { db } = require('../config/database');

const router = express.Router();

// Get user analytics
router.get('/user', [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = 'month' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const [
      progressEntries,
      nutritionPlans,
      workoutViews,
      userStats
    ] = await Promise.all([
      db('progress_tracking')
        .where('user_id', req.user.id)
        .andWhere('date', '>=', startDate)
        .andWhere('date', '<=', endDate)
        .orderBy('date', 'asc'),
      db('nutrition_plans')
        .where('user_id', req.user.id)
        .andWhere('created_at', '>=', startDate)
        .andWhere('created_at', '<=', endDate),
      db('workout_views')
        .where('user_id', req.user.id)
        .andWhere('viewed_at', '>=', startDate)
        .andWhere('viewed_at', '<=', endDate),
      db('users')
        .select('created_at', 'last_login_at', 'is_premium')
        .where('id', req.user.id)
        .first()
    ]);

    const analytics = {
      period,
      startDate,
      endDate,
      progress: {
        totalEntries: progressEntries.length,
        averageWeight: calculateAverage(progressEntries.map(e => e.weight).filter(Boolean)),
        averageBodyFat: calculateAverage(progressEntries.map(e => e.body_fat_percentage).filter(Boolean)),
        averageSteps: calculateAverage(progressEntries.map(e => e.steps).filter(Boolean)),
        averageSleep: calculateAverage(progressEntries.map(e => e.sleep_hours).filter(Boolean)),
        averageMood: calculateAverage(progressEntries.map(e => e.mood_rating).filter(Boolean)),
        weightTrend: calculateTrend(progressEntries.map(e => e.weight).filter(Boolean)),
        consistencyScore: calculateConsistencyScore(progressEntries)
      },
      nutrition: {
        totalPlans: nutritionPlans.length,
        activePlans: nutritionPlans.filter(p => p.is_active).length,
        aiGeneratedPlans: nutritionPlans.filter(p => p.is_ai_generated).length
      },
      workouts: {
        totalViews: workoutViews.length,
        uniqueWorkouts: [...new Set(workoutViews.map(v => v.workout_id))].length,
        averageSessionDuration: calculateAverage(workoutViews.map(v => v.duration_minutes).filter(Boolean))
      },
      engagement: {
        daysActive: [...new Set(progressEntries.map(e => e.date.toDateString()))].length,
        streak: calculateStreak(progressEntries),
        lastActive: userStats.last_login_at
      }
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get workout analytics
router.get('/workouts', [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = 'month' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const [
      popularWorkouts,
      categoryStats,
      difficultyStats,
      timeStats
    ] = await Promise.all([
      db('workout_views')
        .join('workouts', 'workout_views.workout_id', 'workouts.id')
        .select('workouts.id', 'workouts.title', 'workouts.category', 'workouts.difficulty')
        .count('workout_views.id as views')
        .where('workout_views.viewed_at', '>=', startDate)
        .andWhere('workout_views.viewed_at', '<=', endDate)
        .groupBy('workouts.id', 'workouts.title', 'workouts.category', 'workouts.difficulty')
        .orderBy('views', 'desc')
        .limit(10),
      db('workout_views')
        .join('workouts', 'workout_views.workout_id', 'workouts.id')
        .select('workouts.category')
        .count('workout_views.id as views')
        .where('workout_views.viewed_at', '>=', startDate)
        .andWhere('workout_views.viewed_at', '<=', endDate)
        .groupBy('workouts.category'),
      db('workout_views')
        .join('workouts', 'workout_views.workout_id', 'workouts.id')
        .select('workouts.difficulty')
        .count('workout_views.id as views')
        .where('workout_views.viewed_at', '>=', startDate)
        .andWhere('workout_views.viewed_at', '<=', endDate)
        .groupBy('workouts.difficulty'),
      db('workout_views')
        .select(db.raw('EXTRACT(HOUR FROM viewed_at) as hour'))
        .count('* as views')
        .where('viewed_at', '>=', startDate)
        .andWhere('viewed_at', '<=', endDate)
        .groupBy('hour')
        .orderBy('hour')
    ]);

    res.json({
      period,
      startDate,
      endDate,
      popularWorkouts,
      categoryStats,
      difficultyStats,
      timeStats
    });
  } catch (error) {
    console.error('Get workout analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nutrition analytics
router.get('/nutrition', [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period = 'month' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const [
      nutritionPlans,
      goalStats,
      aiUsageStats
    ] = await Promise.all([
      db('nutrition_plans')
        .where('user_id', req.user.id)
        .andWhere('created_at', '>=', startDate)
        .andWhere('created_at', '<=', endDate)
        .orderBy('created_at', 'desc'),
      db('nutrition_plans')
        .select('goal')
        .count('* as count')
        .where('user_id', req.user.id)
        .andWhere('created_at', '>=', startDate)
        .andWhere('created_at', '<=', endDate)
        .groupBy('goal'),
      db('nutrition_plans')
        .select('is_ai_generated')
        .count('* as count')
        .where('user_id', req.user.id)
        .andWhere('created_at', '>=', startDate)
        .andWhere('created_at', '<=', endDate)
        .groupBy('is_ai_generated')
    ]);

    const averageCalories = calculateAverage(
      nutritionPlans.map(p => p.calories_per_day).filter(Boolean)
    );

    res.json({
      period,
      startDate,
      endDate,
      totalPlans: nutritionPlans.length,
      averageCalories: Math.round(averageCalories),
      goalStats,
      aiUsageStats,
      recentPlans: nutritionPlans.slice(0, 5)
    });
  } catch (error) {
    console.error('Get nutrition analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions
function calculateAverage(values) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function calculateTrend(values) {
  if (values.length < 2) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (change > 5) return 'increasing';
  if (change < -5) return 'decreasing';
  return 'stable';
}

function calculateConsistencyScore(entries) {
  if (entries.length === 0) return 0;
  
  const days = [...new Set(entries.map(e => e.date.toDateString()))].length;
  const totalDays = Math.ceil((new Date() - new Date(entries[0].date)) / (1000 * 60 * 60 * 24));
  
  return Math.round((days / totalDays) * 100);
}

function calculateStreak(entries) {
  if (entries.length === 0) return 0;
  
  const sortedDates = [...new Set(entries.map(e => e.date.toDateString()))]
    .map(d => new Date(d))
    .sort((a, b) => b - a);
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const date of sortedDates) {
    const diffTime = currentDate - date;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      streak++;
      currentDate = date;
    } else {
      break;
    }
  }
  
  return streak;
}

module.exports = router;