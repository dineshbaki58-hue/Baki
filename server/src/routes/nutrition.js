const express = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');
const aiNutritionService = require('../services/aiNutritionService');

const router = express.Router();

// Generate AI nutrition plan
router.post('/generate', [
  body('fitnessGoal').isIn(['weight_loss', 'muscle_gain', 'endurance', 'strength', 'general_fitness']),
  body('dietaryRestrictions').optional().isArray(),
  body('foodPreferences').optional().isArray(),
  body('allergies').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get user profile
    const user = await db('users')
      .select('id', 'date_of_birth', 'gender', 'height', 'weight', 'activity_level', 'fitness_goal')
      .where('id', req.user.id)
      .first();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate age
    const age = user.date_of_birth ? 
      Math.floor((new Date() - new Date(user.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)) : 25;

    const userProfile = {
      age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      activityLevel: user.activity_level,
      fitnessGoal: req.body.fitnessGoal || user.fitness_goal,
      dietaryRestrictions: req.body.dietaryRestrictions || [],
      foodPreferences: req.body.foodPreferences || [],
      allergies: req.body.allergies || []
    };

    // Generate AI nutrition plan
    const result = await aiNutritionService.generateNutritionPlan(userProfile, req.body);

    if (result.success) {
      // Save nutrition plan to database
      const [nutritionPlan] = await db('nutrition_plans')
        .insert({
          user_id: req.user.id,
          title: `AI Generated Plan - ${new Date().toLocaleDateString()}`,
          description: 'AI-generated personalized nutrition plan',
          goal: userProfile.fitnessGoal,
          calories_per_day: result.metadata.targetCalories,
          protein_grams: result.metadata.macros.protein,
          carbs_grams: result.metadata.macros.carbs,
          fat_grams: result.metadata.macros.fat,
          meals: result.plan.weeklyPlan,
          restrictions: userProfile.dietaryRestrictions,
          preferences: userProfile.foodPreferences,
          is_ai_generated: true,
          is_active: true
        })
        .returning('*');

      res.json({
        success: true,
        plan: nutritionPlan,
        metadata: result.metadata
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error,
        fallback: result.fallback
      });
    }
  } catch (error) {
    console.error('Generate nutrition plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's nutrition plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await db('nutrition_plans')
      .where('user_id', req.user.id)
      .orderBy('created_at', 'desc');

    res.json({ plans });
  } catch (error) {
    console.error('Get nutrition plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific nutrition plan
router.get('/plans/:id', async (req, res) => {
  try {
    const plan = await db('nutrition_plans')
      .where('id', req.params.id)
      .andWhere('user_id', req.user.id)
      .first();

    if (!plan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    res.json({ plan });
  } catch (error) {
    console.error('Get nutrition plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update nutrition plan
router.put('/plans/:id', [
  body('title').optional().trim().notEmpty(),
  body('is_active').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
    if (req.body.title) updates.title = req.body.title;
    if (req.body.is_active !== undefined) updates.is_active = req.body.is_active;

    const [updatedPlan] = await db('nutrition_plans')
      .where('id', req.params.id)
      .andWhere('user_id', req.user.id)
      .update(updates)
      .returning('*');

    if (!updatedPlan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    res.json({ plan: updatedPlan });
  } catch (error) {
    console.error('Update nutrition plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete nutrition plan
router.delete('/plans/:id', async (req, res) => {
  try {
    const deleted = await db('nutrition_plans')
      .where('id', req.params.id)
      .andWhere('user_id', req.user.id)
      .del();

    if (!deleted) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    res.json({ message: 'Nutrition plan deleted successfully' });
  } catch (error) {
    console.error('Delete nutrition plan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nutrition recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const user = await db('users')
      .select('fitness_goal', 'activity_level', 'weight', 'height')
      .where('id', req.user.id)
      .first();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate basic recommendations based on user profile
    const recommendations = {
      dailyCalories: user.weight * 25, // Basic calculation
      waterIntake: Math.round(user.weight * 35), // ml per day
      mealTiming: [
        "Eat within 1 hour of waking up",
        "Have a meal every 3-4 hours",
        "Finish eating 2-3 hours before bed"
      ],
      macronutrients: {
        protein: `${Math.round(user.weight * 1.6)}g per day`,
        carbs: "Focus on complex carbohydrates",
        fat: "Include healthy fats from nuts, avocados, and olive oil"
      },
      supplements: [
        "Consider a multivitamin",
        "Omega-3 fatty acids",
        "Vitamin D if limited sun exposure"
      ]
    };

    res.json({ recommendations });
  } catch (error) {
    console.error('Get nutrition recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;