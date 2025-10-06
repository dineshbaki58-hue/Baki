exports.up = function(knex) {
  return knex.schema.createTable('progress_tracking', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.date('date').notNullable();
    table.decimal('weight', 5, 2);
    table.decimal('body_fat_percentage', 4, 2);
    table.decimal('muscle_mass', 5, 2);
    table.integer('calories_consumed');
    table.integer('calories_burned');
    table.integer('steps');
    table.integer('water_intake_ml');
    table.integer('sleep_hours');
    table.integer('mood_rating'); // 1-10 scale
    table.text('notes');
    table.json('measurements'); // custom body measurements
    table.json('photos'); // array of photo URLs
    table.timestamps(true, true);
    
    table.unique(['user_id', 'date']);
    table.index(['user_id', 'date']);
    table.index(['date']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('progress_tracking');
};