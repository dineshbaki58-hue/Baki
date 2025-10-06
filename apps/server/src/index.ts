import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { router as authRouter } from './modules/auth/routes';
import { router as userRouter } from './modules/user/routes';
import { router as mealRouter } from './modules/meals/routes';
import { router as workoutRouter } from './modules/workouts/routes';
import { router as trackingRouter } from './modules/tracking/routes';
import { router as progressRouter } from './modules/progress/routes';
import { router as subscriptionRouter } from './modules/subscriptions/routes';
import bodyParser from 'body-parser';
import { router as adminRouter } from './modules/admin/routes';

export const prisma = new PrismaClient();
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.ADMIN_UPLOAD_ALLOWED_ORIGINS?.split(',') || '*' }));
app.use(compression());
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 });
app.use(limiter);
app.use(morgan('dev'));
// Stripe webhook requires raw body
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/subscriptions/webhook')) {
    return bodyParser.raw({ type: '*/*' })(req, res, next);
  }
  return express.json({ limit: '2mb' })(req, res, next);
});

app.get('/health', async (_req, res) => {
  const dbOk = await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true, db: !!dbOk });
});

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/meals', mealRouter);
app.use('/workouts', workoutRouter);
app.use('/tracking', trackingRouter);
app.use('/progress', progressRouter);
app.use('/subscriptions', subscriptionRouter);
app.use('/admin', adminRouter);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`BakiFitness API listening on :${port}`);
});
