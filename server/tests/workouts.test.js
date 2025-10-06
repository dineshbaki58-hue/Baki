const request = require('supertest');
const app = require('../src/index');
const { db } = require('../src/config/database');

describe('Workout Endpoints', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await db('workouts').del();
    await db('users').del();
  });

  afterAll(async () => {
    // Close database connection
    await db.destroy();
  });

  describe('GET /api/workouts', () => {
    beforeEach(async () => {
      // Insert test workouts
      await db('workouts').insert([
        {
          id: 'test-workout-1',
          title: 'Test Workout 1',
          description: 'A test workout',
          category: 'strength',
          difficulty: 'beginner',
          duration_minutes: 30,
          calories_burned: 200,
          video_url: 'https://example.com/video1.mp4',
          thumbnail_url: 'https://example.com/thumb1.jpg',
          equipment_needed: JSON.stringify(['Dumbbells']),
          muscle_groups: JSON.stringify(['Chest', 'Arms']),
          tags: JSON.stringify(['test', 'strength']),
          is_premium: false,
          is_featured: true,
          view_count: 100,
          rating: 4.5,
          rating_count: 10
        },
        {
          id: 'test-workout-2',
          title: 'Test Workout 2',
          description: 'Another test workout',
          category: 'cardio',
          difficulty: 'intermediate',
          duration_minutes: 20,
          calories_burned: 150,
          video_url: 'https://example.com/video2.mp4',
          thumbnail_url: 'https://example.com/thumb2.jpg',
          equipment_needed: JSON.stringify(['None']),
          muscle_groups: JSON.stringify(['Full Body']),
          tags: JSON.stringify(['test', 'cardio']),
          is_premium: true,
          is_featured: false,
          view_count: 50,
          rating: 4.0,
          rating_count: 5
        }
      ]);
    });

    it('should return all workouts', async () => {
      const response = await request(app)
        .get('/api/workouts')
        .expect(200);

      expect(response.body).toHaveProperty('workouts');
      expect(response.body.workouts).toHaveLength(2);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should filter workouts by category', async () => {
      const response = await request(app)
        .get('/api/workouts?category=strength')
        .expect(200);

      expect(response.body.workouts).toHaveLength(1);
      expect(response.body.workouts[0].category).toBe('strength');
    });

    it('should filter workouts by difficulty', async () => {
      const response = await request(app)
        .get('/api/workouts?difficulty=beginner')
        .expect(200);

      expect(response.body.workouts).toHaveLength(1);
      expect(response.body.workouts[0].difficulty).toBe('beginner');
    });

    it('should filter workouts by premium status', async () => {
      const response = await request(app)
        .get('/api/workouts?is_premium=true')
        .expect(200);

      expect(response.body.workouts).toHaveLength(1);
      expect(response.body.workouts[0].is_premium).toBe(true);
    });

    it('should search workouts by title', async () => {
      const response = await request(app)
        .get('/api/workouts?search=Test Workout 1')
        .expect(200);

      expect(response.body.workouts).toHaveLength(1);
      expect(response.body.workouts[0].title).toBe('Test Workout 1');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/workouts?page=1&limit=1')
        .expect(200);

      expect(response.body.workouts).toHaveLength(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
    });
  });

  describe('GET /api/workouts/featured', () => {
    beforeEach(async () => {
      // Insert test workouts with different featured status
      await db('workouts').insert([
        {
          id: 'featured-workout-1',
          title: 'Featured Workout 1',
          description: 'A featured workout',
          category: 'strength',
          difficulty: 'beginner',
          duration_minutes: 30,
          calories_burned: 200,
          video_url: 'https://example.com/video1.mp4',
          thumbnail_url: 'https://example.com/thumb1.jpg',
          equipment_needed: JSON.stringify(['Dumbbells']),
          muscle_groups: JSON.stringify(['Chest']),
          tags: JSON.stringify(['featured']),
          is_premium: false,
          is_featured: true,
          view_count: 100,
          rating: 4.5,
          rating_count: 10
        },
        {
          id: 'regular-workout-1',
          title: 'Regular Workout 1',
          description: 'A regular workout',
          category: 'cardio',
          difficulty: 'intermediate',
          duration_minutes: 20,
          calories_burned: 150,
          video_url: 'https://example.com/video2.mp4',
          thumbnail_url: 'https://example.com/thumb2.jpg',
          equipment_needed: JSON.stringify(['None']),
          muscle_groups: JSON.stringify(['Full Body']),
          tags: JSON.stringify(['regular']),
          is_premium: false,
          is_featured: false,
          view_count: 50,
          rating: 4.0,
          rating_count: 5
        }
      ]);
    });

    it('should return only featured workouts', async () => {
      const response = await request(app)
        .get('/api/workouts/featured')
        .expect(200);

      expect(response.body).toHaveProperty('workouts');
      expect(response.body.workouts).toHaveLength(1);
      expect(response.body.workouts[0].is_featured).toBe(true);
    });
  });

  describe('GET /api/workouts/:id', () => {
    beforeEach(async () => {
      // Insert a test workout
      await db('workouts').insert({
        id: 'test-workout-detail',
        title: 'Test Workout Detail',
        description: 'A test workout for detail view',
        category: 'strength',
        difficulty: 'beginner',
        duration_minutes: 30,
        calories_burned: 200,
        video_url: 'https://example.com/video.mp4',
        thumbnail_url: 'https://example.com/thumb.jpg',
        equipment_needed: JSON.stringify(['Dumbbells']),
        muscle_groups: JSON.stringify(['Chest']),
        tags: JSON.stringify(['test']),
        is_premium: false,
        is_featured: true,
        view_count: 100,
        rating: 4.5,
        rating_count: 10
      });
    });

    it('should return workout details', async () => {
      const response = await request(app)
        .get('/api/workouts/test-workout-detail')
        .expect(200);

      expect(response.body).toHaveProperty('workout');
      expect(response.body.workout.id).toBe('test-workout-detail');
      expect(response.body.workout.title).toBe('Test Workout Detail');
    });

    it('should increment view count', async () => {
      const initialResponse = await request(app)
        .get('/api/workouts/test-workout-detail')
        .expect(200);

      const initialViewCount = initialResponse.body.workout.view_count;

      await request(app)
        .get('/api/workouts/test-workout-detail')
        .expect(200);

      // Check if view count was incremented
      const workout = await db('workouts').where('id', 'test-workout-detail').first();
      expect(workout.view_count).toBe(initialViewCount + 1);
    });

    it('should return 404 for non-existent workout', async () => {
      const response = await request(app)
        .get('/api/workouts/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Workout not found');
    });
  });

  describe('POST /api/workouts/:id/rate', () => {
    beforeEach(async () => {
      // Insert a test workout
      await db('workouts').insert({
        id: 'test-workout-rate',
        title: 'Test Workout Rate',
        description: 'A test workout for rating',
        category: 'strength',
        difficulty: 'beginner',
        duration_minutes: 30,
        calories_burned: 200,
        video_url: 'https://example.com/video.mp4',
        thumbnail_url: 'https://example.com/thumb.jpg',
        equipment_needed: JSON.stringify(['Dumbbells']),
        muscle_groups: JSON.stringify(['Chest']),
        tags: JSON.stringify(['test']),
        is_premium: false,
        is_featured: true,
        view_count: 100,
        rating: 4.0,
        rating_count: 5
      });
    });

    it('should rate a workout successfully', async () => {
      const response = await request(app)
        .post('/api/workouts/test-workout-rate/rate')
        .send({ rating: 5 })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Rating submitted successfully');
      expect(response.body).toHaveProperty('newRating');
    });

    it('should return 400 for invalid rating', async () => {
      const response = await request(app)
        .post('/api/workouts/test-workout-rate/rate')
        .send({ rating: 6 })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 404 for non-existent workout', async () => {
      const response = await request(app)
        .post('/api/workouts/non-existent/rate')
        .send({ rating: 5 })
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Workout not found');
    });
  });
});