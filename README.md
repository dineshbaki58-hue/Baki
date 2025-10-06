# BakiFitness - AI-Powered Fitness App

A comprehensive full-stack fitness application built with React Native and Node.js, featuring AI-powered nutrition generation, workout video library, progress tracking, and subscription management for 20,000+ users.

## 🚀 Features

### Core Features
- **AI Nutrition Generator**: Personalized meal plans using OpenAI GPT-4
- **Workout Video Library**: 1000+ professional workout videos with categories
- **Progress Tracking**: Daily logging with analytics and charts
- **User Management**: JWT authentication with onboarding flow
- **Subscription System**: Stripe integration for premium features
- **Admin Panel**: Content management and user analytics
- **Real-time Features**: Push notifications and live updates
- **Responsive Design**: Mobile-first with web support

### Technical Features
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Knex.js ORM
- **Authentication**: JWT with bcrypt password hashing
- **File Storage**: Cloudinary for images and videos
- **Payments**: Stripe for subscription management
- **AI Integration**: OpenAI API for nutrition generation
- **Caching**: Redis for performance optimization
- **Email**: Nodemailer for notifications
- **Frontend**: React Native with Redux state management

## 📱 Screenshots

*Screenshots will be added once the app is built and running*

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)
- React Native CLI
- Android Studio / Xcode (for mobile development)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bakifitness.git
   cd bakifitness
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Configuration**
   ```bash
   cd server
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=bakifitness_dev
   DB_USER=postgres
   DB_PASSWORD=your_password

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # OpenAI
   OPENAI_API_KEY=your-openai-api-key-here

   # Stripe
   STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
   STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
   STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret

   # Redis
   REDIS_URL=redis://localhost:6379

   # Email
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password

   # Server
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   cd server
   npm run migrate
   npm run seed
   ```

5. **Start the server**
   ```bash
   npm run server:dev
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only)
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   ```bash
   # Android
   npm run android

   # iOS
   npm run ios
   ```

## 🏗️ Project Structure

```
bakifitness/
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── config/        # Database and app configuration
│   │   ├── middleware/    # Custom middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic services
│   │   └── index.js       # Server entry point
│   ├── migrations/        # Database migrations
│   ├── seeds/            # Database seeds
│   └── package.json
├── client/                # React Native Frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── screens/       # App screens
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store
│   │   ├── context/       # React contexts
│   │   └── utils/         # Utility functions
│   ├── android/          # Android-specific code
│   ├── ios/              # iOS-specific code
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts and profiles
- **workouts**: Workout videos and metadata
- **nutrition_plans**: AI-generated meal plans
- **progress_tracking**: Daily progress logs
- **subscriptions**: Stripe subscription data
- **workout_views**: User workout interactions
- **admin_logs**: Admin activity tracking

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Workouts
- `GET /api/workouts` - Get workouts with filters
- `GET /api/workouts/featured` - Get featured workouts
- `GET /api/workouts/:id` - Get workout details
- `POST /api/workouts/:id/rate` - Rate workout

### Nutrition
- `POST /api/nutrition/generate` - Generate AI nutrition plan
- `GET /api/nutrition/plans` - Get user's nutrition plans
- `GET /api/nutrition/plans/:id` - Get specific plan
- `PUT /api/nutrition/plans/:id` - Update plan
- `DELETE /api/nutrition/plans/:id` - Delete plan

### Progress
- `POST /api/progress/log` - Log daily progress
- `GET /api/progress` - Get progress entries
- `GET /api/analytics/user` - Get user analytics

### Subscriptions
- `POST /api/subscriptions/create-customer` - Create Stripe customer
- `POST /api/subscriptions/create-subscription` - Create subscription
- `GET /api/subscriptions/status` - Get subscription status
- `POST /api/subscriptions/cancel` - Cancel subscription

## 🤖 AI Features

### Nutrition Generation
- Uses OpenAI GPT-4 for personalized meal plans
- Considers user profile, goals, and dietary restrictions
- Generates 7-day meal plans with recipes and nutrition info
- Calculates BMR and TDEE for accurate calorie targets

### Smart Recommendations
- Workout recommendations based on user preferences
- Progress-based goal adjustments
- Personalized content curation

## 💳 Subscription Plans

### Basic (Free)
- Access to basic workouts
- Basic nutrition tracking
- Community support
- Limited AI features

### Premium ($9.99/month)
- All basic features
- AI nutrition plans
- Advanced workout library
- Progress analytics
- Priority support
- Custom meal plans

### Pro ($19.99/month)
- All premium features
- Personal trainer AI
- Advanced analytics
- Custom workout plans
- 1-on-1 support
- Early access to features

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers
- SQL injection prevention
- XSS protection

## 📊 Analytics & Monitoring

- User engagement tracking
- Workout completion rates
- Nutrition plan effectiveness
- Subscription metrics
- Error logging and monitoring
- Performance metrics

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy to cloud platform (Heroku, AWS, etc.)

### Frontend Deployment
1. Build React Native app
2. Deploy to app stores (iOS App Store, Google Play)
3. Configure deep linking
4. Set up push notifications

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## 📈 Performance Optimization

- Database query optimization
- Redis caching
- Image optimization
- Lazy loading
- Code splitting
- Bundle optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Backend Development**: Node.js, Express.js, PostgreSQL
- **Frontend Development**: React Native, Redux
- **AI Integration**: OpenAI GPT-4
- **DevOps**: Docker, CI/CD
- **Design**: UI/UX Design

## 📞 Support

For support, email support@bakifitness.com or join our Discord community.

## 🔮 Roadmap

- [ ] Social features and challenges
- [ ] Wearable device integration
- [ ] Advanced AI coaching
- [ ] Live workout streaming
- [ ] Nutrition barcode scanning
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Apple Health / Google Fit integration

---

**BakiFitness** - Transform your fitness journey with AI-powered insights and expert guidance. 💪🤖