exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('subscriptions').del();
  
  // Inserts seed entries
  await knex('subscriptions').insert([
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      user_id: '550e8400-e29b-41d4-a716-446655440001', // Demo user
      stripe_subscription_id: 'sub_demo_user_123',
      stripe_customer_id: 'cus_demo_user_123',
      plan: 'premium',
      status: 'active',
      current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      canceled_at: null,
      trial_end: null,
      amount: 9.99,
      currency: 'usd',
      metadata: JSON.stringify({
        source: 'mobile_app',
        campaign: 'summer_special'
      })
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      user_id: '550e8400-e29b-41d4-a716-446655440002', // Admin user
      stripe_subscription_id: 'sub_admin_user_456',
      stripe_customer_id: 'cus_admin_user_456',
      plan: 'pro',
      status: 'active',
      current_period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      current_period_end: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000), // 335 days from now
      canceled_at: null,
      trial_end: null,
      amount: 19.99,
      currency: 'usd',
      metadata: JSON.stringify({
        source: 'web_app',
        campaign: 'early_adopter'
      })
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      user_id: '550e8400-e29b-41d4-a716-446655440003', // Instructor user
      stripe_subscription_id: 'sub_instructor_user_789',
      stripe_customer_id: 'cus_instructor_user_789',
      plan: 'premium',
      status: 'active',
      current_period_start: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      current_period_end: new Date(Date.now() + 170 * 24 * 60 * 60 * 1000), // 170 days from now
      canceled_at: null,
      trial_end: null,
      amount: 9.99,
      currency: 'usd',
      metadata: JSON.stringify({
        source: 'mobile_app',
        campaign: 'instructor_discount'
      })
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      user_id: '550e8400-e29b-41d4-a716-446655440005', // Emma Wilson
      stripe_subscription_id: 'sub_emma_wilson_101',
      stripe_customer_id: 'cus_emma_wilson_101',
      plan: 'premium',
      status: 'active',
      current_period_start: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      current_period_end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      canceled_at: null,
      trial_end: null,
      amount: 9.99,
      currency: 'usd',
      metadata: JSON.stringify({
        source: 'mobile_app',
        campaign: 'new_user_trial'
      })
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      user_id: '550e8400-e29b-41d4-a716-446655440004', // John Smith (canceled)
      stripe_subscription_id: 'sub_john_smith_202',
      stripe_customer_id: 'cus_john_smith_202',
      plan: 'premium',
      status: 'canceled',
      current_period_start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      current_period_end: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      canceled_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
      trial_end: null,
      amount: 9.99,
      currency: 'usd',
      metadata: JSON.stringify({
        source: 'web_app',
        campaign: 'spring_promotion'
      })
    }
  ]);
};