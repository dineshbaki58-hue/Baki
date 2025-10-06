exports.up = function(knex) {
  return knex.schema.createTable('subscriptions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('stripe_subscription_id').unique();
    table.string('stripe_customer_id');
    table.enum('plan', ['basic', 'premium', 'pro']);
    table.enum('status', ['active', 'canceled', 'past_due', 'unpaid', 'incomplete']);
    table.timestamp('current_period_start');
    table.timestamp('current_period_end');
    table.timestamp('canceled_at');
    table.timestamp('trial_end');
    table.decimal('amount', 10, 2);
    table.string('currency', 3).defaultTo('usd');
    table.json('metadata');
    table.timestamps(true, true);
    
    table.index(['user_id']);
    table.index(['stripe_subscription_id']);
    table.index(['status']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('subscriptions');
};