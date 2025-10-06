exports.up = function(knex) {
  return knex.schema.createTable('workouts', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('description');
    table.enum('category', ['strength', 'cardio', 'yoga', 'pilates', 'hiit', 'flexibility', 'sports', 'dance']);
    table.enum('difficulty', ['beginner', 'intermediate', 'advanced']);
    table.integer('duration_minutes').notNullable();
    table.integer('calories_burned');
    table.string('video_url').notNullable();
    table.string('thumbnail_url');
    table.json('equipment_needed'); // array of equipment
    table.json('muscle_groups'); // array of muscle groups targeted
    table.json('tags'); // array of tags
    table.boolean('is_premium').defaultTo(false);
    table.boolean('is_featured').defaultTo(false);
    table.integer('view_count').defaultTo(0);
    table.decimal('rating', 3, 2).defaultTo(0);
    table.integer('rating_count').defaultTo(0);
    table.uuid('instructor_id').references('id').inTable('users');
    table.timestamps(true, true);
    
    table.index(['category']);
    table.index(['difficulty']);
    table.index(['is_premium']);
    table.index(['is_featured']);
    table.index(['rating']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('workouts');
};