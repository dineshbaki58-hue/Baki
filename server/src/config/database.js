const knex = require('knex');
const config = require('./knexfile');

const db = knex(config);

const connectDB = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

module.exports = { db, connectDB };