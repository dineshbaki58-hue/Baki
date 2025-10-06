import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { stripe } from '../../lib/stripe';

const prisma = new PrismaClient();
export const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as any;
    req.userId = payload.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

router.post('/create-checkout-session', requireAuth, async (req: any, res) => {
  const { plan } = req.body as { plan: 'pro_monthly' | 'pro_yearly' };
  const priceId = plan === 'pro_yearly' ? process.env.STRIPE_PRICE_PRO_YEARLY : process.env.STRIPE_PRICE_PRO_MONTHLY;
  if (!priceId) return res.status(400).json({ error: 'Price not configured' });
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.APP_PUBLIC_URL}/subscriptions/success`,
    cancel_url: `${process.env.APP_PUBLIC_URL}/subscriptions/cancel`,
    customer_email: user.email,
    allow_promotion_codes: true,
    subscription_data: { trial_period_days: 7 },
  });

  res.json({ url: session.url });
});

// Note: configure raw body parsing for this route in index.ts
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent((req as any).rawBody || JSON.stringify(req.body), sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email;
      if (email) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
          await prisma.subscription.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              planSlug: 'pro_monthly',
              status: 'active',
              stripeCustomerId: String(session.customer),
              stripeSubscriptionId: String(session.subscription),
              startAt: new Date(),
            },
            update: {
              planSlug: 'pro_monthly',
              status: 'active',
              stripeCustomerId: String(session.customer),
              stripeSubscriptionId: String(session.subscription),
            },
          });
        }
      }
      break;
    }
    default:
      break;
  }

  res.json({ received: true });
});
