import Joi from 'joi';

export const generateMealPlanSchema = Joi.object({
  duration: Joi.string().valid('daily', 'weekly').required().messages({
    'any.only': 'Duration must be either "daily" or "weekly"',
    'any.required': 'Duration is required'
  }),
  preferences: Joi.object({
    cuisine: Joi.array().items(Joi.string()).optional(),
    cookingTime: Joi.string().valid('quick', 'moderate', 'extensive').optional(),
    mealCount: Joi.number().min(1).max(6).optional()
  }).optional()
});

export const updateMealPlanSchema = Joi.object({
  title: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional()
});

export const swapMealSchema = Joi.object({
  preferences: Joi.object({
    cuisine: Joi.array().items(Joi.string()).optional(),
    cookingTime: Joi.string().valid('quick', 'moderate', 'extensive').optional(),
    avoidIngredients: Joi.array().items(Joi.string()).optional()
  }).optional()
});

export const trackMealSchema = Joi.object({
  mealId: Joi.string().required().messages({
    'any.required': 'Meal ID is required'
  }),
  date: Joi.date().required().messages({
    'any.required': 'Date is required'
  }),
  servings: Joi.number().min(0.1).max(10).default(1).messages({
    'number.min': 'Servings must be at least 0.1',
    'number.max': 'Servings must not exceed 10'
  }),
  notes: Joi.string().max(500).optional()
});