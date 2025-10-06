import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
export const router = Router();

function signToken(userId: string) {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body as { email: string; password: string; name?: string };
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: 'Email already in use' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash, name } });
    return res.json({ token: signToken(user.id) });
  } catch (e) {
    return res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    return res.json({ token: signToken(user.id) });
  } catch (e) {
    return res.status(500).json({ error: 'Login failed' });
  }
});
