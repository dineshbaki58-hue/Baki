import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
    (req as any).userId = payload.userId as string;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, async () => {
    const user = await prisma.user.findUnique({ where: { id: (req as any).userId } });
    if (user?.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    next();
  });
}
