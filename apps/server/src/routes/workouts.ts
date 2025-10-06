import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/auth';

export const router = Router();

router.get('/', requireAuth, async (_req, res) => {
  const videos = await prisma.workoutVideo.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ videos });
});

const createSchema = z.object({
  title: z.string(),
  description: z.string(),
  durationSec: z.number().int().min(10),
  level: z.string(),
  muscleGroup: z.string(),
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url(),
});

router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const video = await prisma.workoutVideo.create({ data: parsed.data });
  res.json({ video });
});
