import { db } from '@/db';
import { teams } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

// Use environment variable for API URL with fallback for local development
const API_URL = process.env.PREMIER_LEAGUE_API_URL || 'https://sdp-prem-prod.premier-league-prod.pulselive.com/api/v5/competitions/8/seasons/2025/standings?live=false';

interface ApiTeamEntry {
  team: {
    id: string;
  };
  overall: {
    position: number;
  };
}

interface ApiResponse {
  tables: {
    entries: ApiTeamEntry[];
  }[];
}

/**
 * Checks if the team standings data needs to be updated
 * Data is considered stale if it's older than 3 minutes
 */
export async function shouldUpdateStandings(): Promise<boolean> {
  try {
    // Get the most recent lastUpdated value from any team
    const result = await db
      .select({ lastUpdated: teams.lastUpdated })
      .from(teams)
      .orderBy(desc(teams.lastUpdated))
      .limit(1);
    
    // If no teams exist yet, we should definitely update
    if (!result.length) {
      console.log('No teams found in the database. Update needed.');
      return true;
    }
    
    const lastUpdate = result[0].lastUpdated;
    if (!lastUpdate) {
      console.log('Team exists but lastUpdated is null. Update needed.');
      return true;
    }
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    
    // If data is older than 3 minutes, we should update
    const isStale = diffMinutes > 3;
    console.log(`Last update was ${diffMinutes.toFixed(1)} minutes ago. Update needed: ${isStale}`);
    
    return isStale;
  } catch (error) {
    console.error('Error checking if update is needed:', error);
    // On error, it's safer to return false to avoid excessive API calls
    return false;
  }
}

/**
 * Updates team standings from the Premier League API
 */
export async function updateTeamStandings() {
  try {
    console.log('Fetching latest standings from Premier League API...');
    const response = await fetch(API_URL, {
      headers: {
        'Origin': 'https://www.premierleague.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    const standings = data.tables[0].entries;

    console.log(`Found ${standings.length} teams in the standings.`);

    for (const entry of standings) {
      const apiId = parseInt(entry.team.id, 10);
      const position = entry.overall.position;
      // Await each update individually to process them sequentially
      await db
        .update(teams)
        .set({ 
          actualPosition: position,
          lastUpdated: new Date() 
        })
        .where(eq(teams.apiId, apiId));
    }

    console.log('Successfully updated team standings in the database.');
    return { success: true, message: `Updated ${standings.length} teams.` };

  } catch (error) {
    console.error('Failed to update team standings:', error);
    if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred' };
  }
}
