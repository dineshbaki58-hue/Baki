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

router.get('/', requireAuth, async (req: any, res) => {
  const items = await prisma.progress.findMany({ where: { userId: req.userId }, orderBy: { date: 'desc' } });
  res.json({ progress: items });
});

router.post('/', requireAuth, async (req: any, res) => {
  const { date, weightKg, bodyFatPercent, measurements, photos, summary } = req.body as any;
  const item = await prisma.progress.upsert({
    where: { userId_date: { userId: req.userId, date: new Date(date) } },
    create: { userId: req.userId, date: new Date(date), weightKg, bodyFatPercent, measurements, photos, summary },
    update: { weightKg, bodyFatPercent, measurements, photos, summary },
  });
  res.json({ progress: item });
});
