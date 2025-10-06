# BakiFitness Monorepo

Monorepo for BakiFitness - AI fitness app.

## Apps
- `apps/server`: Node.js Express API (TypeScript, Prisma, Stripe, OpenAI, PostHog)
- `apps/mobile`: Expo React Native app with web support
- `packages/shared`: Shared types

## Getting Started

1. Copy env and install deps
```bash
cp apps/server/.env.example apps/server/.env
npm install
npm run prisma:generate
```

2. Start Postgres & Redis (use your local services or Docker)
- If Docker is installed, you can run:
```bash
docker compose up -d postgres redis
```
Otherwise, point `DATABASE_URL` to a running Postgres.

3. Migrate & seed
```bash
npm run prisma:migrate
npm run seed -w apps/server
```

4. Run the API
```bash
npm run dev -w apps/server
```

5. Run the app (web)
```bash
npm run web -w apps/mobile
```

Set `EXPO_PUBLIC_API_URL` to your API URL for the app.
