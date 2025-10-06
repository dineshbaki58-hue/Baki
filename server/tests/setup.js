// Test setup file
const { db } = require('../src/config/database');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';

// Global test timeout
jest.setTimeout(10000);

// Clean up database after each test
afterEach(async () => {
  // Clean up test data
  await db('progress_tracking').del();
  await db('nutrition_plans').del();
  await db('subscriptions').del();
  await db('workout_views').del();
  await db('workouts').del();
  await db('users').del();
});

// Close database connection after all tests
afterAll(async () => {
  await db.destroy();
});