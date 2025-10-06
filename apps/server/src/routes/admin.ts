import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';

export const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/overview', async (_req, res) => {
  const [users, subs, videos, progress] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count(),
    prisma.workoutVideo.count(),
    prisma.progress.count(),
  ]);
  res.json({ users, subs, videos, progress });
});

router.get('/users', async (req, res) => {
  const page = Number(req.query.page || 1);
  const pageSize = Math.min(100, Number(req.query.pageSize || 20));
  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    }),
    prisma.user.count(),
  ]);
  res.json({ items, total, page, pageSize });
});

router.get('/subscriptions', async (req, res) => {
  const page = Number(req.query.page || 1);
  const pageSize = Math.min(100, Number(req.query.pageSize || 20));
  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.subscription.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true } } },
    }),
    prisma.subscription.count(),
  ]);
  res.json({ items, total, page, pageSize });
});
