import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

export const router = Router();

router.use(requireAuth);

const profileSchema = z.object({
  heightCm: z.number().int().min(100).max(250).optional(),
  weightKg: z.number().min(30).max(400).optional(),
  goal: z.string().max(200).optional(),
});

router.put('/profile', async (req: AuthRequest, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const user = await prisma.user.update({
    where: { id: req.userId! },
    data: parsed.data,
    select: { id: true, email: true, name: true, role: true, heightCm: true, weightKg: true, goal: true },
  });
  res.json({ user });
});
