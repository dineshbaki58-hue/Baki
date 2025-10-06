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

router.get('/today', requireAuth, async (req: any, res) => {
  const dateKey = new Date().toISOString().slice(0, 10);
  const track = await prisma.dailyTracking.findUnique({ where: { userId_date: { userId: req.userId, date: new Date(dateKey) } } });
  res.json({ tracking: track });
});

router.post('/log', requireAuth, async (req: any, res) => {
  const { date, waterMl, steps, caloriesIn, caloriesOut, macros, mealsLogged, workoutsLogged } = req.body as any;
  const d = new Date(date || new Date().toISOString().slice(0, 10));
  const record = await prisma.dailyTracking.upsert({
    where: { userId_date: { userId: req.userId, date: d } },
    create: { userId: req.userId, date: d, waterMl, steps, caloriesIn, caloriesOut, macros, mealsLogged, workoutsLogged },
    update: { waterMl, steps, caloriesIn, caloriesOut, macros, mealsLogged, workoutsLogged },
  });
  res.json({ tracking: record });
});
