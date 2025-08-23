import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Initialize the database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  // Resetting database
  await db.delete(schema.predictions);
  await db.delete(schema.users);
  await db.delete(schema.teams);
  // Database reset complete

  // Seeding database

  // Hardcoded user data as per specifications
  const userData = [
    { name: 'Clive', accessCode: 'aB1!cDe', isAdmin: 0 },
    { name: 'John', accessCode: 'fG2@hIj', isAdmin: 0 },
    { name: 'Dingle', accessCode: 'kL3#mNo', isAdmin: 0 },
    { name: 'Chris', accessCode: 'pQ4$rSt', isAdmin: 1 }, // Chris is the admin
  ];

  // Insert users.
  await db.insert(schema.users).values(userData);

  // Seeding teams

  // Fetch team data from the Premier League API
  const response = await fetch('https://sdp-prem-prod.premier-league-prod.pulselive.com/api/v5/competitions/8/seasons/2025/standings?live=true', {
    headers: {
      'Origin': 'https://www.premierleague.com',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch team data: ${response.statusText}`);
  }

  const data = await response.json();
  const teamsData = data.tables[0].entries.map((entry: any) => ({
    apiId: entry.team.id,
    name: entry.team.name,
    shortName: entry.team.shortName,
    abbr: entry.team.abbr,
    actualPosition: entry.position,
  }));

  // Insert teams, and on conflict (based on apiId), do nothing.
  await db.insert(schema.teams).values(teamsData).onConflictDoNothing({ target: schema.teams.apiId });

  // Teams seeded successfully

  // Database seeded successfully
}

main().catch(() => {
  // Silent error handling to prevent logging sensitive information
  process.exit(1);
});
