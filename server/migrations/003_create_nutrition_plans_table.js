exports.up = function(knex) {
  return knex.schema.createTable('nutrition_plans', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description');
    table.enum('goal', ['weight_loss', 'muscle_gain', 'maintenance', 'performance']);
    table.integer('calories_per_day').notNullable();
    table.integer('protein_grams').notNullable();
    table.integer('carbs_grams').notNullable();
    table.integer('fat_grams').notNullable();
    table.integer('fiber_grams');
    table.integer('sugar_grams');
    table.json('meals'); // array of meal objects
    table.json('restrictions'); // dietary restrictions
    table.json('preferences'); // food preferences
    table.boolean('is_ai_generated').defaultTo(false);
    table.boolean('is_active').defaultTo(false);
    table.timestamps(true, true);
    
    table.index(['user_id']);
    table.index(['goal']);
    table.index(['is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('nutrition_plans');
};