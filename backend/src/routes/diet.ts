import { Router } from 'express';
import { 
  generateMealPlan,
  getMealPlans,
  getMealPlanById,
  updateMealPlan,
  deleteMealPlan,
  swapMeal,
  regenerateMeal,
  getGroceryList,
  trackMeal
} from '../controllers/dietController';
import { validate } from '../middleware/validation';
import { 
  generateMealPlanSchema,
  updateMealPlanSchema,
  swapMealSchema,
  trackMealSchema
} from '../validators/dietValidators';
import { authenticateToken, requireSubscription } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Meal plan generation (requires subscription)
router.post('/generate', requireSubscription(), validate(generateMealPlanSchema), generateMealPlan);
router.get('/plans', getMealPlans);
router.get('/plans/:id', getMealPlanById);
router.put('/plans/:id', validate(updateMealPlanSchema), updateMealPlan);
router.delete('/plans/:id', deleteMealPlan);

// Meal management
router.post('/plans/:planId/meals/:mealId/swap', validate(swapMealSchema), swapMeal);
router.post('/plans/:planId/meals/:mealId/regenerate', regenerateMeal);

// Grocery list
router.get('/plans/:id/grocery-list', getGroceryList);

// Meal tracking
router.post('/track', validate(trackMealSchema), trackMeal);

export { router as dietRoutes };