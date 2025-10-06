import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { json } from 'express';
import bodyParser from 'body-parser';
import { PostHog } from 'posthog-node';
import { router as authRouter } from './routes/auth';
import { router as aiRouter } from './routes/ai';
import { router as workoutRouter } from './routes/workouts';
import { router as progressRouter } from './routes/progress';
import { router as userRouter } from './routes/user';
import { router as adminRouter } from './routes/admin';
import { router as stripeRouter, stripeWebhookHandler } from './routes/stripe';

const app = express();
const posthog = new PostHog(process.env.POSTHOG_API_KEY || '', { host: process.env.POSTHOG_HOST });

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
// Stripe webhook requires raw body for signature validation
app.use('/stripe/webhook', bodyParser.raw({ type: 'application/json' }));
app.use(json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Minimal analytics capture endpoint
app.post('/events', (req, res) => {
  const { event, distinctId, properties } = req.body as {
    event: string; distinctId: string; properties?: Record<string, unknown>
  };
  if (event && distinctId) {
    posthog.capture({ event, distinctId, properties });
  }
  res.json({ ok: true });
});

app.use('/auth', authRouter);
app.use('/ai', aiRouter);
app.use('/workouts', workoutRouter);
app.use('/progress', progressRouter);
app.use('/user', userRouter);
app.use('/stripe', stripeRouter);
app.post('/stripe/webhook', stripeWebhookHandler);
app.use('/admin', adminRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${port}`);
});
