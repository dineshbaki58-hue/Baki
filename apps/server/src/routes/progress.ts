import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth';
import dayjs from 'dayjs';

export const router = Router();

router.get('/today', requireAuth, async (req: AuthRequest, res) => {
  const today = dayjs().startOf('day').toDate();
  const entry = await prisma.progress.findUnique({
    where: { userId_date: { userId: req.userId!, date: today } },
  });
  res.json({ entry });
});

const upsertSchema = z.object({
  date: z.string().datetime().optional(),
  weightKg: z.number().optional(),
  calories: z.number().int().optional(),
  proteinG: z.number().int().optional(),
  carbsG: z.number().int().optional(),
  fatsG: z.number().int().optional(),
  notes: z.string().optional(),
});

router.post('/upsert', requireAuth, async (req: AuthRequest, res) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { date, ...rest } = parsed.data;
  const theDate = date ? new Date(date) : dayjs().startOf('day').toDate();
  const entry = await prisma.progress.upsert({
    where: { userId_date: { userId: req.userId!, date: theDate } },
    create: { userId: req.userId!, date: theDate, ...rest },
    update: rest,
  });
  res.json({ entry });
});
