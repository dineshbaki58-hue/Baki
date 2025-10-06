import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { CustomError } from '../middleware/errorHandler';
import { AIService } from '../services/aiService';
import { AuthRequest } from '../middleware/auth';

// Calculate BMR using Mifflin-St Jeor equation
const calculateBMR = (weight: number, height: number, age: number, gender: string) => {
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'MALE' ? baseBMR + 5 : baseBMR - 161;
};

// Calculate TDEE based on activity level
const calculateTDEE = (bmr: number, activityLevel: string) => {
  const activityMultipliers = {
    SEDENTARY: 1.2,
    LIGHTLY_ACTIVE: 1.375,
    MODERATELY_ACTIVE: 1.55,
    VERY_ACTIVE: 1.725,
    EXTRA_ACTIVE: 1.9
  };
  
  return Math.round(bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers]);
};

export const generateMealPlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { duration, preferences = {} } = req.body;

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Calculate user's TDEE
    const age = new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear();
    const bmr = calculateBMR(user.weight, user.height, age, user.gender);
    const tdee = calculateTDEE(bmr, user.activityLevel);

    // Prepare user profile for AI
    const userProfile = {
      age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      activityLevel: user.activityLevel,
      goals: user.goals,
      allergies: user.allergies,
      dietType: user.dietType,
      tdee
    };

    // Generate meal plan using AI
    const generatedMealPlan = await AIService.generateMealPlan({
      userProfile,
      duration,
      preferences
    });

    // Save meal plan to database
    const mealPlan = await prisma.mealPlan.create({
      data: {
        userId,
        title: generatedMealPlan.title,
        description: generatedMealPlan.description,
        startDate: new Date(),
        endDate: duration === 'daily' 
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalCalories: generatedMealPlan.totalCalories,
        totalProtein: generatedMealPlan.totalProtein,
        totalCarbs: generatedMealPlan.totalCarbs,
        totalFat: generatedMealPlan.totalFat,
        totalFiber: generatedMealPlan.totalFiber,
        totalSugar: generatedMealPlan.totalSugar,
        aiGenerated: true,
        generationPrompt: JSON.stringify({ userProfile, duration, preferences }),
        preferences: preferences,
        meals: {
          create: generatedMealPlan.meals.map(meal => ({
            name: meal.name,
            mealType: meal.mealType,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            fiber: meal.fiber,
            sugar: meal.sugar,
            sodium: meal.sodium,
            ingredients: meal.ingredients,
            instructions: meal.instructions,
            prepTime: meal.prepTime,
            cookTime: meal.cookTime,
            servings: meal.servings,
            difficulty: meal.difficulty,
            aiGenerated: true,
            canSwap: true,
            tags: meal.tags
          }))
        }
      },
      include: {
        meals: true
      }
    });

    logger.info(`Meal plan generated for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Meal plan generated successfully',
      data: {
        mealPlan,
        groceryList: generatedMealPlan.groceryList
      }
    });
  } catch (error) {
    logger.error('Meal plan generation error:', error);
    throw error;
  }
};

export const getMealPlans = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10, startDate, endDate } = req.query;

    const where: any = { userId };

    if (startDate || endDate) {
      where.AND = [];
      if (startDate) {
        where.AND.push({ startDate: { gte: new Date(startDate as string) } });
      }
      if (endDate) {
        where.AND.push({ endDate: { lte: new Date(endDate as string) } });
      }
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where,
      include: {
        meals: {
          select: {
            id: true,
            name: true,
            mealType: true,
            calories: true,
            protein: true,
            carbs: true,
            fat: true,
            imageUrl: true
          }
        },
        _count: {
          select: { meals: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.mealPlan.count({ where });

    res.json({
      success: true,
      data: {
        mealPlans,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get meal plans error:', error);
    throw error;
  }
};

export const getMealPlanById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId
      },
      include: {
        meals: true
      }
    });

    if (!mealPlan) {
      throw new CustomError('Meal plan not found', 404);
    }

    res.json({
      success: true,
      data: { mealPlan }
    });
  } catch (error) {
    logger.error('Get meal plan error:', error);
    throw error;
  }
};

export const updateMealPlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const updateData = req.body;

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!mealPlan) {
      throw new CustomError('Meal plan not found', 404);
    }

    const updatedMealPlan = await prisma.mealPlan.update({
      where: { id },
      data: updateData,
      include: {
        meals: true
      }
    });

    res.json({
      success: true,
      message: 'Meal plan updated successfully',
      data: { mealPlan: updatedMealPlan }
    });
  } catch (error) {
    logger.error('Update meal plan error:', error);
    throw error;
  }
};

export const deleteMealPlan = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!mealPlan) {
      throw new CustomError('Meal plan not found', 404);
    }

    await prisma.mealPlan.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Meal plan deleted successfully'
    });
  } catch (error) {
    logger.error('Delete meal plan error:', error);
    throw error;
  }
};

export const swapMeal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { planId, mealId } = req.params;
    const { preferences = {} } = req.body;

    // Get the meal plan and meal
    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id: planId,
        userId
      },
      include: {
        meals: {
          where: { id: mealId }
        }
      }
    });

    if (!mealPlan || mealPlan.meals.length === 0) {
      throw new CustomError('Meal not found', 404);
    }

    const currentMeal = mealPlan.meals[0];

    if (!currentMeal.canSwap) {
      throw new CustomError('This meal cannot be swapped', 400);
    }

    // Get user profile for AI
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const age = new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear();
    const userProfile = {
      age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      activityLevel: user.activityLevel,
      goals: user.goals,
      allergies: user.allergies,
      dietType: user.dietType,
      tdee: 0 // Not needed for meal swap
    };

    // Generate replacement meal using AI
    const newMeal = await AIService.swapMeal(
      currentMeal as any,
      userProfile,
      currentMeal.mealType,
      preferences
    );

    // Update the meal in database
    const updatedMeal = await prisma.meal.update({
      where: { id: mealId },
      data: {
        name: newMeal.name,
        calories: newMeal.calories,
        protein: newMeal.protein,
        carbs: newMeal.carbs,
        fat: newMeal.fat,
        fiber: newMeal.fiber,
        sugar: newMeal.sugar,
        sodium: newMeal.sodium,
        ingredients: newMeal.ingredients,
        instructions: newMeal.instructions,
        prepTime: newMeal.prepTime,
        cookTime: newMeal.cookTime,
        servings: newMeal.servings,
        difficulty: newMeal.difficulty,
        tags: newMeal.tags
      }
    });

    logger.info(`Meal swapped for user ${userId}, meal ${mealId}`);

    res.json({
      success: true,
      message: 'Meal swapped successfully',
      data: { meal: updatedMeal }
    });
  } catch (error) {
    logger.error('Meal swap error:', error);
    throw error;
  }
};

export const regenerateMeal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { planId, mealId } = req.params;

    // This is similar to swapMeal but without specific preferences
    // Just regenerate with the same constraints
    return swapMeal(req, res);
  } catch (error) {
    logger.error('Meal regeneration error:', error);
    throw error;
  }
};

export const getGroceryList = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        id,
        userId
      },
      include: {
        meals: {
          select: {
            ingredients: true
          }
        }
      }
    });

    if (!mealPlan) {
      throw new CustomError('Meal plan not found', 404);
    }

    // Generate grocery list from meal ingredients
    const groceryList = generateGroceryList(mealPlan.meals);

    res.json({
      success: true,
      data: { groceryList }
    });
  } catch (error) {
    logger.error('Get grocery list error:', error);
    throw error;
  }
};

export const trackMeal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { mealId, date, servings = 1, notes } = req.body;

    // Get the meal
    const meal = await prisma.meal.findUnique({
      where: { id: mealId }
    });

    if (!meal) {
      throw new CustomError('Meal not found', 404);
    }

    // Get or create daily tracking entry
    const trackingDate = new Date(date);
    let dailyTracking = await prisma.dailyTracking.findUnique({
      where: {
        userId_date: {
          userId,
          date: trackingDate
        }
      }
    });

    if (!dailyTracking) {
      dailyTracking = await prisma.dailyTracking.create({
        data: {
          userId,
          date: trackingDate,
          caloriesConsumed: 0,
          proteinConsumed: 0,
          carbsConsumed: 0,
          fatConsumed: 0,
          mealsLogged: []
        }
      });
    }

    // Calculate nutritional values based on servings
    const mealCalories = Math.round(meal.calories * servings);
    const mealProtein = meal.protein * servings;
    const mealCarbs = meal.carbs * servings;
    const mealFat = meal.fat * servings;

    // Update daily tracking
    const updatedTracking = await prisma.dailyTracking.update({
      where: { id: dailyTracking.id },
      data: {
        caloriesConsumed: dailyTracking.caloriesConsumed + mealCalories,
        proteinConsumed: dailyTracking.proteinConsumed + mealProtein,
        carbsConsumed: dailyTracking.carbsConsumed + mealCarbs,
        fatConsumed: dailyTracking.fatConsumed + mealFat,
        mealsLogged: {
          push: {
            mealId,
            name: meal.name,
            servings,
            calories: mealCalories,
            protein: mealProtein,
            carbs: mealCarbs,
            fat: mealFat,
            loggedAt: new Date(),
            notes
          }
        }
      }
    });

    logger.info(`Meal tracked for user ${userId}: ${meal.name}`);

    res.json({
      success: true,
      message: 'Meal tracked successfully',
      data: { tracking: updatedTracking }
    });
  } catch (error) {
    logger.error('Track meal error:', error);
    throw error;
  }
};

// Helper function to generate grocery list
function generateGroceryList(meals: any[]) {
  const ingredientMap = new Map();

  meals.forEach(meal => {
    if (meal.ingredients && Array.isArray(meal.ingredients)) {
      meal.ingredients.forEach((ingredient: any) => {
        const key = ingredient.name.toLowerCase();
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key);
          // Add amounts (simplified - in real app, you'd need proper unit conversion)
          existing.amount = `${parseFloat(existing.amount) + parseFloat(ingredient.amount)} ${ingredient.unit}`;
        } else {
          ingredientMap.set(key, {
            name: ingredient.name,
            amount: `${ingredient.amount} ${ingredient.unit}`,
            category: getIngredientCategory(ingredient.name)
          });
        }
      });
    }
  });

  // Group by category
  const categories = new Map();
  ingredientMap.forEach(ingredient => {
    const category = ingredient.category;
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category).push(ingredient);
  });

  return Array.from(categories.entries()).map(([category, items]) => ({
    category,
    items
  }));
}

// Helper function to categorize ingredients
function getIngredientCategory(ingredientName: string): string {
  const name = ingredientName.toLowerCase();
  
  if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || 
      name.includes('fish') || name.includes('salmon') || name.includes('turkey')) {
    return 'Meat & Seafood';
  }
  if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || 
      name.includes('butter') || name.includes('cream')) {
    return 'Dairy';
  }
  if (name.includes('apple') || name.includes('banana') || name.includes('orange') || 
      name.includes('berry') || name.includes('grape')) {
    return 'Fruits';
  }
  if (name.includes('carrot') || name.includes('onion') || name.includes('tomato') || 
      name.includes('lettuce') || name.includes('pepper')) {
    return 'Vegetables';
  }
  if (name.includes('rice') || name.includes('pasta') || name.includes('bread') || 
      name.includes('flour') || name.includes('oats')) {
    return 'Grains & Bread';
  }
  if (name.includes('oil') || name.includes('vinegar') || name.includes('spice') || 
      name.includes('herb') || name.includes('salt') || name.includes('pepper')) {
    return 'Pantry Items';
  }
  
  return 'Other';
}