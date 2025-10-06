const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { body, validationResult } = require('express-validator');
const { db } = require('../config/database');

const router = express.Router();

// Create Stripe customer
router.post('/create-customer', async (req, res) => {
  try {
    const { email, name } = req.body;

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId: req.user.id
      }
    });

    // Save customer ID to user
    await db('users')
      .where('id', req.user.id)
      .update({ stripe_customer_id: customer.id });

    res.json({ customerId: customer.id });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create subscription
router.post('/create-subscription', [
  body('priceId').notEmpty(),
  body('paymentMethodId').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { priceId, paymentMethodId } = req.body;

    // Get user's Stripe customer ID
    const user = await db('users')
      .select('stripe_customer_id')
      .where('id', req.user.id)
      .first();

    if (!user.stripe_customer_id) {
      return res.status(400).json({ message: 'Customer not found' });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripe_customer_id,
    });

    // Set as default payment method
    await stripe.customers.update(user.stripe_customer_id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: user.stripe_customer_id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Save subscription to database
    await db('subscriptions').insert({
      user_id: req.user.id,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: user.stripe_customer_id,
      plan: getPlanFromPriceId(priceId),
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      amount: subscription.items.data[0].price.unit_amount / 100,
      currency: subscription.currency
    });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get subscription status
router.get('/status', async (req, res) => {
  try {
    const subscription = await db('subscriptions')
      .where('user_id', req.user.id)
      .orderBy('created_at', 'desc')
      .first();

    if (!subscription) {
      return res.json({ 
        hasSubscription: false,
        isActive: false 
      });
    }

    // Update subscription status from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
    
    await db('subscriptions')
      .where('id', subscription.id)
      .update({
        status: stripeSubscription.status,
        current_period_start: new Date(stripeSubscription.current_period_start * 1000),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000)
      });

    res.json({
      hasSubscription: true,
      isActive: stripeSubscription.status === 'active',
      plan: subscription.plan,
      status: stripeSubscription.status,
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel subscription
router.post('/cancel', async (req, res) => {
  try {
    const subscription = await db('subscriptions')
      .where('user_id', req.user.id)
      .andWhere('status', 'active')
      .first();

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Cancel subscription at period end
    const stripeSubscription = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true
    });

    await db('subscriptions')
      .where('id', subscription.id)
      .update({
        status: 'canceled',
        canceled_at: new Date()
      });

    res.json({ 
      message: 'Subscription will be canceled at the end of the current period',
      cancelAtPeriodEnd: true
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reactivate subscription
router.post('/reactivate', async (req, res) => {
  try {
    const subscription = await db('subscriptions')
      .where('user_id', req.user.id)
      .andWhere('status', 'canceled')
      .first();

    if (!subscription) {
      return res.status(404).json({ message: 'No canceled subscription found' });
    }

    // Reactivate subscription
    const stripeSubscription = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false
    });

    await db('subscriptions')
      .where('id', subscription.id)
      .update({
        status: 'active',
        canceled_at: null
      });

    res.json({ 
      message: 'Subscription reactivated successfully',
      status: 'active'
    });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment methods
router.get('/payment-methods', async (req, res) => {
  try {
    const user = await db('users')
      .select('stripe_customer_id')
      .where('id', req.user.id)
      .first();

    if (!user.stripe_customer_id) {
      return res.json({ paymentMethods: [] });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripe_customer_id,
      type: 'card',
    });

    res.json({ paymentMethods: paymentMethods.data });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payment intent for one-time payment
router.post('/create-payment-intent', [
  body('amount').isInt({ min: 1 }),
  body('currency').optional().isLength({ min: 3, max: 3 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, currency = 'usd' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      metadata: {
        userId: req.user.id
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Helper functions
function getPlanFromPriceId(priceId) {
  // Map Stripe price IDs to plan names
  const priceMap = {
    'price_basic': 'basic',
    'price_premium': 'premium',
    'price_pro': 'pro'
  };
  return priceMap[priceId] || 'basic';
}

async function handleSubscriptionChange(subscription) {
  await db('subscriptions')
    .where('stripe_subscription_id', subscription.id)
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000)
    });

  // Update user premium status
  const isActive = subscription.status === 'active';
  await db('users')
    .where('stripe_customer_id', subscription.customer)
    .update({
      is_premium: isActive,
      premium_expires_at: isActive ? new Date(subscription.current_period_end * 1000) : null
    });
}

async function handleSubscriptionDeleted(subscription) {
  await db('subscriptions')
    .where('stripe_subscription_id', subscription.id)
    .update({
      status: 'canceled',
      canceled_at: new Date()
    });

  await db('users')
    .where('stripe_customer_id', subscription.customer)
    .update({
      is_premium: false,
      premium_expires_at: null
    });
}

async function handlePaymentSucceeded(invoice) {
  // Handle successful payment
  console.log('Payment succeeded:', invoice.id);
}

async function handlePaymentFailed(invoice) {
  // Handle failed payment
  console.log('Payment failed:', invoice.id);
}

module.exports = router;