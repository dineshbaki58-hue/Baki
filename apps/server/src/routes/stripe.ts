import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });
export const router = Router();

router.post('/checkout', requireAuth, async (req: AuthRequest, res) => {
  const priceId = process.env.STRIPE_PRICE_ID as string;
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const customer = user.stripeCustomerId
    ? user.stripeCustomerId
    : (await stripe.customers.create({ email: user.email })).id;
  if (!user.stripeCustomerId) {
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer } });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: 'https://app.bakifitness.com/success',
    cancel_url: 'https://app.bakifitness.com/cancel',
  });
  res.json({ url: session.url });
});

export async function stripeWebhookHandler(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'];
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent((req as any).rawBody || req.body, sig as string, whSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;
      const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
      if (user) {
        await prisma.subscription.upsert({
          where: { id: sub.id },
          create: {
            id: sub.id,
            userId: user.id,
            status: sub.status,
            currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
            priceId: sub.items.data[0]?.price?.id || null,
          },
          update: {
            status: sub.status,
            currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
            priceId: sub.items.data[0]?.price?.id || null,
          },
        });
      }
      break;
    }
  }

  res.json({ received: true });
}
