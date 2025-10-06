const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { db } = require('../config/database');

const router = express.Router();

// Log daily progress
router.post('/log', [
  body('date').isISO8601().toDate(),
  body('weight').optional().isFloat({ min: 0 }),
  body('bodyFatPercentage').optional().isFloat({ min: 0, max: 100 }),
  body('muscleMass').optional().isFloat({ min: 0 }),
  body('caloriesConsumed').optional().isInt({ min: 0 }),
  body('caloriesBurned').optional().isInt({ min: 0 }),
  body('steps').optional().isInt({ min: 0 }),
  body('waterIntakeMl').optional().isInt({ min: 0 }),
  body('sleepHours').optional().isFloat({ min: 0, max: 24 }),
  body('moodRating').optional().isInt({ min: 1, max: 10 }),
  body('notes').optional().trim(),
  body('measurements').optional().isObject(),
  body('photos').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      date,
      weight,
      bodyFatPercentage,
      muscleMass,
      caloriesConsumed,
      caloriesBurned,
      steps,
      waterIntakeMl,
      sleepHours,
      moodRating,
      notes,
      measurements,
      photos
    } = req.body;

    // Check if entry already exists for this date
    const existingEntry = await db('progress_tracking')
      .where('user_id', req.user.id)
      .andWhere('date', date)
      .first();

    let progressEntry;
    if (existingEntry) {
      // Update existing entry
      [progressEntry] = await db('progress_tracking')
        .where('id', existingEntry.id)
        .update({
          weight: weight || existingEntry.weight,
          body_fat_percentage: bodyFatPercentage || existingEntry.body_fat_percentage,
          muscle_mass: muscleMass || existingEntry.muscle_mass,
          calories_consumed: caloriesConsumed || existingEntry.calories_consumed,
          calories_burned: caloriesBurned || existingEntry.calories_burned,
          steps: steps || existingEntry.steps,
          water_intake_ml: waterIntakeMl || existingEntry.water_intake_ml,
          sleep_hours: sleepHours || existingEntry.sleep_hours,
          mood_rating: moodRating || existingEntry.mood_rating,
          notes: notes || existingEntry.notes,
          measurements: measurements || existingEntry.measurements,
          photos: photos || existingEntry.photos
        })
        .returning('*');
    } else {
      // Create new entry
      [progressEntry] = await db('progress_tracking')
        .insert({
          user_id: req.user.id,
          date,
          weight,
          body_fat_percentage: bodyFatPercentage,
          muscle_mass: muscleMass,
          calories_consumed: caloriesConsumed,
          calories_burned: caloriesBurned,
          steps,
          water_intake_ml: waterIntakeMl,
          sleep_hours: sleepHours,
          mood_rating: moodRating,
          notes,
          measurements,
          photos
        })
        .returning('*');
    }

    res.status(201).json({
      message: 'Progress logged successfully',
      entry: progressEntry
    });
  } catch (error) {
    console.error('Log progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get progress entries
router.get('/', [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    let query = db('progress_tracking')
      .where('user_id', req.user.id)
      .orderBy('date', 'desc');

    if (startDate) {
      query = query.where('date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('date', '<=', endDate);
    }

    const offset = (page - 1) * limit;
    const entries = await query.limit(limit).offset(offset);

    const [{ count }] = await query.clone().count('* as count');

    res.json({
      entries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(count),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get progress entries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get progress analytics
router.get('/analytics', [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year'])
], async (req, res) => {
  try {
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

    const entries = await db('progress_tracking')
      .where('user_id', req.user.id)
      .andWhere('date', '>=', startDate)
      .andWhere('date', '<=', endDate)
      .orderBy('date', 'asc');

    // Calculate analytics
    const analytics = {
      period,
      startDate,
      endDate,
      totalEntries: entries.length,
      weight: {
        current: entries[entries.length - 1]?.weight || null,
        change: entries.length > 1 ? 
          (entries[entries.length - 1]?.weight || 0) - (entries[0]?.weight || 0) : 0,
        trend: calculateTrend(entries.map(e => e.weight).filter(Boolean))
      },
      bodyFat: {
        current: entries[entries.length - 1]?.body_fat_percentage || null,
        change: entries.length > 1 ? 
          (entries[entries.length - 1]?.body_fat_percentage || 0) - (entries[0]?.body_fat_percentage || 0) : 0,
        trend: calculateTrend(entries.map(e => e.body_fat_percentage).filter(Boolean))
      },
      calories: {
        averageConsumed: calculateAverage(entries.map(e => e.calories_consumed).filter(Boolean)),
        averageBurned: calculateAverage(entries.map(e => e.calories_burned).filter(Boolean)),
        netCalories: calculateAverage(entries.map(e => (e.calories_consumed || 0) - (e.calories_burned || 0)).filter(Boolean))
      },
      activity: {
        averageSteps: calculateAverage(entries.map(e => e.steps).filter(Boolean)),
        averageSleep: calculateAverage(entries.map(e => e.sleep_hours).filter(Boolean)),
        averageMood: calculateAverage(entries.map(e => e.mood_rating).filter(Boolean))
      },
      waterIntake: {
        average: calculateAverage(entries.map(e => e.water_intake_ml).filter(Boolean))
      }
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Get progress analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get progress chart data
router.get('/charts/:metric', [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year'])
], async (req, res) => {
  try {
    const { metric } = req.params;
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

    const entries = await db('progress_tracking')
      .select('date', metric)
      .where('user_id', req.user.id)
      .andWhere('date', '>=', startDate)
      .andWhere('date', '<=', endDate)
      .orderBy('date', 'asc');

    const chartData = entries.map(entry => ({
      date: entry.date,
      value: entry[metric]
    }));

    res.json({ chartData });
  } catch (error) {
    console.error('Get progress chart data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions
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

function calculateAverage(values) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length * 100) / 100;
}

module.exports = router;