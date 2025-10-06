exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();
  
  // Hash passwords for demo users
  const bcrypt = require('bcryptjs');
  const saltRounds = 12;
  
  const demoPassword = await bcrypt.hash('password123', saltRounds);
  const adminPassword = await bcrypt.hash('admin123', saltRounds);
  
  // Inserts seed entries
  await knex('users').insert([
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'demo@bakifitness.com',
      password_hash: demoPassword,
      first_name: 'Demo',
      last_name: 'User',
      date_of_birth: '1990-05-15',
      gender: 'male',
      height: 175.5,
      weight: 75.0,
      activity_level: 'moderately_active',
      fitness_goal: 'muscle_gain',
      profile_image_url: 'https://example.com/profiles/demo-user.jpg',
      is_verified: true,
      is_premium: true,
      premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      preferences: JSON.stringify({
        notifications: true,
        theme: 'light',
        units: 'metric'
      }),
      fcm_token: 'demo_fcm_token_123',
      last_login_at: new Date(),
      role: 'user'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'admin@bakifitness.com',
      password_hash: adminPassword,
      first_name: 'Admin',
      last_name: 'User',
      date_of_birth: '1985-03-20',
      gender: 'female',
      height: 165.0,
      weight: 60.0,
      activity_level: 'very_active',
      fitness_goal: 'weight_loss',
      profile_image_url: 'https://example.com/profiles/admin-user.jpg',
      is_verified: true,
      is_premium: true,
      premium_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      preferences: JSON.stringify({
        notifications: true,
        theme: 'dark',
        units: 'metric'
      }),
      fcm_token: 'admin_fcm_token_456',
      last_login_at: new Date(),
      role: 'admin'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      email: 'instructor@bakifitness.com',
      password_hash: demoPassword,
      first_name: 'Sarah',
      last_name: 'Johnson',
      date_of_birth: '1988-07-10',
      gender: 'female',
      height: 170.0,
      weight: 65.0,
      activity_level: 'extremely_active',
      fitness_goal: 'general_fitness',
      profile_image_url: 'https://example.com/profiles/sarah-johnson.jpg',
      is_verified: true,
      is_premium: true,
      premium_expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
      preferences: JSON.stringify({
        notifications: true,
        theme: 'light',
        units: 'metric'
      }),
      fcm_token: 'instructor_fcm_token_789',
      last_login_at: new Date(),
      role: 'instructor'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      email: 'user1@bakifitness.com',
      password_hash: demoPassword,
      first_name: 'John',
      last_name: 'Smith',
      date_of_birth: '1992-11-25',
      gender: 'male',
      height: 180.0,
      weight: 80.0,
      activity_level: 'lightly_active',
      fitness_goal: 'weight_loss',
      profile_image_url: 'https://example.com/profiles/john-smith.jpg',
      is_verified: true,
      is_premium: false,
      premium_expires_at: null,
      preferences: JSON.stringify({
        notifications: true,
        theme: 'light',
        units: 'metric'
      }),
      fcm_token: 'user1_fcm_token_101',
      last_login_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      role: 'user'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      email: 'user2@bakifitness.com',
      password_hash: demoPassword,
      first_name: 'Emma',
      last_name: 'Wilson',
      date_of_birth: '1995-09-12',
      gender: 'female',
      height: 160.0,
      weight: 55.0,
      activity_level: 'moderately_active',
      fitness_goal: 'muscle_gain',
      profile_image_url: 'https://example.com/profiles/emma-wilson.jpg',
      is_verified: true,
      is_premium: true,
      premium_expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      preferences: JSON.stringify({
        notifications: false,
        theme: 'dark',
        units: 'metric'
      }),
      fcm_token: 'user2_fcm_token_202',
      last_login_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      role: 'user'
    }
  ]);
};