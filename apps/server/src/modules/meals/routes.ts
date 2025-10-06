import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { buildGroceryList, generateMealPlan, MealPlanSchema } from './ai';

const prisma = new PrismaClient();
export const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
    req.userId = payload.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// schema imported from ai.ts

router.post('/generate', requireAuth, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const calories = req.body?.targetCalories ?? 2000;
    const aiPlan = await generateMealPlan({
      planType: (req.body.planType || 'daily') as 'daily' | 'weekly',
      targetCalories: calories,
      dietType: user.dietType,
      allergies: user.allergies,
    });
    const parsed = MealPlanSchema.safeParse(aiPlan);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid AI response', issues: parsed.error.format() });
    }

    const saved = await prisma.mealPlan.create({
      data: {
        userId: req.userId,
        planType: parsed.data.planType,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        totalCalories: parsed.data.totalCalories ?? calories,
        macros: parsed.data.macros as any,
        meals: parsed.data.meals as any,
      },
    });

    res.json({ mealPlan: saved });
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate meal plan' });
  }
});

router.get('/', requireAuth, async (req: any, res) => {
  const plans = await prisma.mealPlan.findMany({ where: { userId: req.userId }, orderBy: { startDate: 'desc' } });
  res.json({ mealPlans: plans });
});

router.get('/:id/grocery-list', requireAuth, async (req: any, res) => {
  const plan = await prisma.mealPlan.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!plan) return res.status(404).json({ error: 'Not found' });
  const list = buildGroceryList((plan.meals as any) || []);
  res.json({ groceryList: list });
});

router.post('/:id/swap', requireAuth, async (req: any, res) => {
  const { mealIndex } = req.body as { mealIndex: number };
  const plan = await prisma.mealPlan.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!plan) return res.status(404).json({ error: 'Not found' });
  const calories = plan.totalCalories || 2000;
  const aiPlan = await generateMealPlan({
    planType: 'daily',
    targetCalories: calories,
    dietType: null,
    allergies: null,
  });
  const meals = (plan.meals as any) || [];
  if (mealIndex < 0 || mealIndex >= meals.length) return res.status(400).json({ error: 'Invalid index' });
  meals[mealIndex] = aiPlan.meals[Math.min(mealIndex, aiPlan.meals.length - 1)];
  const updated = await prisma.mealPlan.update({ where: { id: plan.id }, data: { meals } });
  res.json({ mealPlan: updated });
});
