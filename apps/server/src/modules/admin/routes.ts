import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { getPresignedPutUrl } from '../../lib/s3';

const prisma = new PrismaClient();
export const router = Router();

function requireAdmin(req: any, res: any, next: any) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
    req.userId = payload.userId;
    // naive role check
    (async () => {
      const user = await prisma.user.findUnique({ where: { id: req.userId } });
      if (user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
      next();
    })();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

router.post('/workouts', requireAdmin, async (req, res) => {
  const { title, description, durationMin, equipment, videoUrl, muscleGroups, difficulty, tags } = req.body as any;
  const workout = await prisma.workout.create({
    data: { title, description, durationMin, equipment, videoUrl, muscleGroups, difficulty, tags },
  });
  res.json({ workout });
});

router.post('/uploads/presign', requireAdmin, async (req, res) => {
  const { key, contentType } = req.body as { key: string; contentType: string };
  if (!key || !contentType) return res.status(400).json({ error: 'Missing key or contentType' });
  const url = await getPresignedPutUrl(key, contentType);
  res.json({ url, bucket: process.env.S3_BUCKET_NAME });
});

router.get('/analytics', requireAdmin, async (_req, res) => {
  const [users, workouts, mealPlans] = await Promise.all([
    prisma.user.count(),
    prisma.workout.count(),
    prisma.mealPlan.count(),
  ]);
  res.json({ users, workouts, mealPlans });
});
