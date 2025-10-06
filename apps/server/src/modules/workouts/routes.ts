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

router.get('/', requireAuth, async (_req, res) => {
  const workouts = await prisma.workout.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ workouts });
});

router.get('/recommended', requireAuth, async (req: any, res) => {
  // simple placeholder recommended filter by goal
  const goal = (await prisma.user.findUnique({ where: { id: req.userId } }))?.goal;
  const workouts = await prisma.workout.findMany({
    where: goal ? { tags: { has: goal } } : {},
    take: 10,
    orderBy: { createdAt: 'desc' },
  });
  res.json({ workouts });
});

router.post('/:id/favorite', requireAuth, async (req: any, res) => {
  const workoutId = req.params.id;
  await prisma.favoriteWorkout.upsert({
    where: { userId_workoutId: { userId: req.userId, workoutId } },
    create: { userId: req.userId, workoutId },
    update: {},
  });
  res.json({ ok: true });
});

router.delete('/:id/favorite', requireAuth, async (req: any, res) => {
  const workoutId = req.params.id;
  await prisma.favoriteWorkout.delete({ where: { userId_workoutId: { userId: req.userId, workoutId } } });
  res.json({ ok: true });
});
