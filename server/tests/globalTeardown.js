// Global teardown for tests
const { db } = require('../src/config/database');

module.exports = async () => {
  // Close database connection
  try {
    await db.destroy();
    console.log('Database connection closed after tests');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};