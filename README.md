# Premier League 2025/26 Prediction App

## Overview

This is a prediction application for the Premier League 2025/26 season. The application allows users to predict the final positions of Premier League teams and compare their predictions with the actual standings in real-time.

## Features

- User predictions for Premier League team positions
- Real-time standings from the official Premier League API
- Smart API update mechanism (only fetches new data when older than 5 minutes)
- Leaderboard showing user scores based on prediction accuracy
- Point calculation system with bonuses for correct predictions
- Admin interface for managing data
- Responsive design for mobile and desktop

## Technical Details

### Frontend
- Next.js 14.2.5 with App Router
- TypeScript for type safety
- TailwindCSS for styling with Radix UI components
- React Hook Form for form handling

### Backend
- Next.js API routes
- PostgreSQL database (via Neon serverless)
- Drizzle ORM for database interactions
- Iron Session for authentication

### Data Source
- Premier League standings from the official Premier League internal API
- Robust error handling and request caching
- Browser request mimicking to avoid API restrictions

### Deployment
- Firebase Hosting for production deployment
- Support for both serverless and static export modes

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Update database schema
npm run db:push

# Seed database with initial data
npm run db:seed

# Run tests
npm run test:api:simple
npm run test:update-logic

# Build for production
npm run build

# Run production server
npm start
```

## Environment Variables

The application requires the following environment variables to be set in `.env.local`:

```
DATABASE_URL="your-postgres-connection-string"
PREMIER_LEAGUE_API_URL="https://sdp-prem-prod.premier-league-prod.pulselive.com/api/v5/competitions/8/seasons/2025/standings?live=false"
CRON_SECRET="your-cron-secret"
SESSION_SECRET="your-session-secret"
```

See `.env.example` for all required environment variables.

## Deployment

```bash
# Deploy to Firebase
npm run deploy
```

## Version Information

**IMPORTANT: This is the final version of the Premier League 2025/26 Prediction App.**

This application is designed to track the current Premier League season (2025/26) using real-time data from the Premier League's internal API.

## API Implementation

The application uses a direct connection to the Premier League's internal API endpoint:
```
https://sdp-prem-prod.premier-league-prod.pulselive.com/api/v5/competitions/8/seasons/2025/standings?live=false
```

### Rate Limiting and Caching
- The application checks the age of Premier League standings data when the leaderboard is viewed
- If the data is older than 5 minutes, it automatically calls the Premier League API to update the database
- This prevents excessive API calls while ensuring users see reasonably fresh data

### Implementation Details
- Browser-like request headers are used to mimic legitimate web browser traffic
- Robust error handling with appropriate HTTP status checks
- Data is only updated if standings have changed
- Next.js cache invalidation tags are used for efficient cache management
