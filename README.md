# Premier League 2025/26 Prediction App

## Final Version

This is the final version of the Premier League 2025/26 prediction application. The application allows users to predict the final positions of Premier League teams for the 2025/26 season and compare their predictions with the actual standings.

## Features

- User predictions for Premier League team positions
- Real-time standings from the Premier League API
- Smart API update mechanism (only fetches new data when older than 3 minutes)
- Leaderboard showing user scores based on prediction accuracy
- Point calculation system with bonuses for correct predictions

## Technical Details

- Next.js application with TypeScript
- PostgreSQL database with Drizzle ORM
- Environment-based configuration
- Premier League API integration with browser-like request headers

## Branch Policy

**IMPORTANT: This is the final version of the application.**

Any updates, enhancements, or bug fixes should be implemented in separate branches and merged only after thorough testing and review. The main branch should remain stable and represent the production-ready application.

### Creating a new branch

```bash
# Create a new branch for your feature or fix
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "Description of your changes"

# Push the branch to remote
git push -u origin feature/your-feature-name
```

## Environment Variables

The application requires the following environment variables to be set in `.env.local`:

```
DATABASE_URL="your-postgres-connection-string"
PREMIER_LEAGUE_API_URL="https://sdp-prem-prod.premier-league-prod.pulselive.com/api/v5/competitions/8/seasons/2025/standings?live=false"
CRON_SECRET="your-cron-secret"
SESSION_SECRET="your-session-secret"
```

## Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start
```

## Data Update Policy

The application checks the age of Premier League standings data when the leaderboard is viewed. If the data is older than 3 minutes, it will automatically call the Premier League API to update the database. This prevents excessive API calls while ensuring users see reasonably fresh data.
