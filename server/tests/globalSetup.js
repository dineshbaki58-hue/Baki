// Global setup for tests
const { db } = require('../src/config/database');

module.exports = async () => {
  // Ensure database is ready for tests
  try {
    await db.raw('SELECT 1');
    console.log('Database connection established for tests');
  } catch (error) {
    console.error('Failed to connect to database for tests:', error);
    process.exit(1);
  }
};