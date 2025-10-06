# BakiFitness - AI-Powered Fitness App

A comprehensive full-stack fitness application with AI-generated diet plans, workout videos, progress tracking, and subscription management.

## 🏗️ Architecture

- **Frontend**: React Native (Expo) for mobile + React web admin panel
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Redis
- **Payments**: Stripe integration
- **AI**: OpenAI API for diet generation
- **Storage**: AWS S3 for workout videos

## 🚀 Features

### Core Features
- ✅ User onboarding with comprehensive profile setup
- ✅ AI-generated personalized diet & nutrition plans
- ✅ Workout video library with AI recommendations
- ✅ Daily tracking (meals, workouts, water, steps)
- ✅ Progress analytics with charts and photos
- ✅ Subscription management with Stripe
- ✅ Admin panel for content management

### Tech Stack
- **Mobile**: React Native (Expo), TypeScript, React Navigation
- **Web Admin**: React, TypeScript, Tailwind CSS, ShadCN/UI
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL, Redis
- **Authentication**: JWT tokens
- **Payments**: Stripe
- **AI**: OpenAI GPT-4
- **Storage**: AWS S3
- **Deployment**: Docker, AWS/GCP

## 📁 Project Structure

```
bakifitness/
├── mobile/                 # React Native app
├── admin/                  # React web admin panel
├── backend/                # Node.js API server
├── shared/                 # Shared types and utilities
└── docs/                   # Documentation
```

## 🛠️ Development Setup

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Set up environment variables**:
   - Copy `.env.example` files in each directory
   - Configure database, Redis, Stripe, and OpenAI API keys

3. **Start development servers**:
   ```bash
   npm run dev
   ```

4. **Database setup**:
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

## 📱 Mobile App Features

- User onboarding and profile setup
- AI diet plan generation and management
- Workout video library with search and filters
- Daily tracking dashboard
- Progress photos and analytics
- Subscription management
- Offline support for core features

## 🌐 Admin Panel Features

- User management and analytics
- Workout video upload and management
- Meal template creation
- Subscription analytics
- Content moderation tools
- System health monitoring

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/onboarding` - Complete onboarding

### Diet & Nutrition
- `POST /api/diet/generate` - Generate AI diet plan
- `GET /api/diet/plans` - Get user's diet plans
- `PUT /api/diet/plans/:id` - Update diet plan
- `POST /api/diet/swap-meal` - Swap individual meal

### Workouts
- `GET /api/workouts` - Get workout library
- `GET /api/workouts/:id` - Get workout details
- `POST /api/workouts/recommend` - AI workout recommendations
- `POST /api/workouts/favorite` - Add to favorites

### Progress Tracking
- `POST /api/progress/track` - Track daily progress
- `GET /api/progress/analytics` - Get progress analytics
- `POST /api/progress/photos` - Upload progress photos

### Subscriptions
- `POST /api/subscriptions/create` - Create subscription
- `GET /api/subscriptions/status` - Get subscription status
- `POST /api/subscriptions/cancel` - Cancel subscription

## 🚀 Deployment

### Production Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bakifitness
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# External Services
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-s3-bucket

# App Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-app.com
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual services
docker build -t bakifitness-backend ./backend
docker build -t bakifitness-mobile ./mobile
docker build -t bakifitness-admin ./admin
```

## 📊 Performance & Scaling

- **Database**: PostgreSQL with read replicas for scaling
- **Caching**: Redis for session management and API caching
- **CDN**: CloudFront for static assets and videos
- **Monitoring**: Application performance monitoring
- **Load Balancing**: Multiple backend instances
- **Target**: 20,000+ daily active users

## 🔒 Security

- JWT-based authentication with refresh tokens
- Rate limiting on API endpoints
- Input validation and sanitization
- HTTPS enforcement
- CORS configuration
- SQL injection prevention with Prisma ORM

## 📈 Analytics & Monitoring

- User engagement tracking
- Subscription conversion metrics
- API performance monitoring
- Error tracking and logging
- Business intelligence dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details