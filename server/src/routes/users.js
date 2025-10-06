const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'date_of_birth', 'gender', 
              'height', 'weight', 'activity_level', 'fitness_goal', 'profile_image_url',
              'is_verified', 'is_premium', 'premium_expires_at', 'preferences', 'created_at')
      .where('id', req.user.id)
      .first();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('dateOfBirth').optional().isISO8601().toDate(),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('height').optional().isFloat({ min: 0 }),
  body('weight').optional().isFloat({ min: 0 }),
  body('activityLevel').optional().isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']),
  body('fitnessGoal').optional().isIn(['weight_loss', 'muscle_gain', 'endurance', 'strength', 'general_fitness']),
  body('preferences').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
    const { 
      firstName, 
      lastName, 
      dateOfBirth, 
      gender, 
      height, 
      weight, 
      activityLevel, 
      fitnessGoal, 
      preferences 
    } = req.body;

    if (firstName) updates.first_name = firstName;
    if (lastName) updates.last_name = lastName;
    if (dateOfBirth) updates.date_of_birth = dateOfBirth;
    if (gender) updates.gender = gender;
    if (height) updates.height = height;
    if (weight) updates.weight = weight;
    if (activityLevel) updates.activity_level = activityLevel;
    if (fitnessGoal) updates.fitness_goal = fitnessGoal;
    if (preferences) updates.preferences = preferences;

    const [updatedUser] = await db('users')
      .where('id', req.user.id)
      .update(updates)
      .returning('*');

    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile image
router.post('/profile-image', async (req, res) => {
  try {
    // In a real implementation, you would handle file upload here
    // For now, we'll just return a success message
    res.json({ 
      message: 'Profile image upload endpoint - implement with multer and cloudinary',
      imageUrl: 'placeholder-image-url'
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update FCM token for push notifications
router.post('/fcm-token', [
  body('token').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.body;

    await db('users')
      .where('id', req.user.id)
      .update({ fcm_token: token });

    res.json({ message: 'FCM token updated successfully' });
  } catch (error) {
    console.error('Update FCM token error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user stats
router.get('/stats', async (req, res) => {
  try {
    const [
      progressEntries,
      nutritionPlans,
      workoutViews,
      subscription
    ] = await Promise.all([
      db('progress_tracking')
        .where('user_id', req.user.id)
        .count('* as count')
        .first(),
      db('nutrition_plans')
        .where('user_id', req.user.id)
        .count('* as count')
        .first(),
      db('workout_views')
        .where('user_id', req.user.id)
        .count('* as count')
        .first(),
      db('subscriptions')
        .where('user_id', req.user.id)
        .andWhere('status', 'active')
        .first()
    ]);

    res.json({
      stats: {
        totalProgressEntries: parseInt(progressEntries.count),
        totalNutritionPlans: parseInt(nutritionPlans.count),
        totalWorkoutViews: parseInt(workoutViews.count),
        hasActiveSubscription: !!subscription
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user account
router.delete('/account', [
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password } = req.body;

    // Verify password
    const user = await db('users')
      .select('password_hash')
      .where('id', req.user.id)
      .first();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Delete user and all related data (cascade should handle this)
    await db('users')
      .where('id', req.user.id)
      .del();

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;