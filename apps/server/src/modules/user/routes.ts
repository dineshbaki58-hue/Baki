import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

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

router.get('/me', requireAuth, async (req: any, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  res.json({ user });
});

router.post('/onboard', requireAuth, async (req: any, res) => {
  const { age, gender, heightCm, weightKg, activityLevel, goal, allergies, dietType } = req.body as any;
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { age, gender, heightCm, weightKg, activityLevel, goal, allergies, dietType },
  });
  res.json({ user, calories: mifflinStJeor({ gender, age, heightCm, weightKg, activityLevel, goal }) });
});

export function mifflinStJeor({ gender, age, heightCm, weightKg, activityLevel, goal }: any) {
  const weight = Number(weightKg || 0);
  const height = Number(heightCm || 0);
  const a = gender === 'male' ? 5 : -161;
  const bmr = 10 * weight + 6.25 * height - 5 * Number(age || 0) + a;
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);
  const goalAdj = goal === 'loss' ? -500 : goal === 'gain' ? 300 : 0;
  return Math.max(1200, Math.round(tdee + goalAdj));
}
