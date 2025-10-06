exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.date('date_of_birth');
    table.enum('gender', ['male', 'female', 'other']).notNullable();
    table.decimal('height', 5, 2); // in cm
    table.decimal('weight', 5, 2); // in kg
    table.enum('activity_level', ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']);
    table.enum('fitness_goal', ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'general_fitness']);
    table.string('profile_image_url');
    table.boolean('is_verified').defaultTo(false);
    table.boolean('is_premium').defaultTo(false);
    table.timestamp('premium_expires_at');
    table.json('preferences');
    table.string('fcm_token');
    table.timestamp('last_login_at');
    table.timestamps(true, true);
    
    table.index(['email']);
    table.index(['is_premium']);
    table.index(['created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};