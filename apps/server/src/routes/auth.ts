import { Router } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { requireAdmin, AuthRequest, requireAuth } from '../middleware/auth';

export const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { email, password, name } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash, name } });
  const token = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as unknown as import('jsonwebtoken').SignOptions['expiresIn'] }
  );
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string() });

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as unknown as import('jsonwebtoken').SignOptions['expiresIn'] }
  );
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ user });
});

router.post('/promote', requireAdmin, async (req, res) => {
  const { userId } = req.body as { userId: string };
  const user = await prisma.user.update({ where: { id: userId }, data: { role: 'ADMIN' } });
  res.json({ id: user.id, role: user.role });
});
