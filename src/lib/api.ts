import { db } from '@/db';
import { teams } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';

// Use local proxy endpoint to avoid CORS issues
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const API_ENDPOINT = '/api/premier-league?endpoint=standings&live=false';
const API_URL = `${API_BASE_URL}${API_ENDPOINT}`;

interface ApiTeamEntry {
  team: {
    id: string;
  };
  overall: {
    position: number;
    points: number;
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
 * @param cacheKey Optional parameter to prevent caching of this function call
 */
export async function shouldUpdateStandings(cacheKey?: string): Promise<boolean> {
  // Log the cache key to verify it's being used
  // Cache key handling
  // No debug logging to prevent information leakage
  try {
    // Get the most recent lastUpdated value from any team
    const result = await db
      .select({ lastUpdated: teams.lastUpdated })
      .from(teams)
      .orderBy(desc(teams.lastUpdated))
      .limit(1);
    
    // If no teams exist yet, we should definitely update
    if (!result.length) {
      // No teams found in the database. Update needed.
      return true;
    }
    
    const lastUpdate = result[0].lastUpdated;
    if (!lastUpdate) {
      // Team exists but lastUpdated is null. Update needed.
      return true;
    }
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    
    // If data is older than 3 minutes, we should update
    const isStale = diffMinutes > 3;
    // Time-based update check complete
    
    return isStale;
  } catch (error) {
    // Error handled silently to prevent logging sensitive information
    // On error, it's safer to return false to avoid excessive API calls
    return false;
  }
}

/**
 * Updates team standings from the Premier League API
 * @param cacheKey Optional parameter to prevent caching of this function call
 * @param baseUrl Optional base URL to use instead of API_BASE_URL
 */
export async function updateTeamStandings(cacheKey?: string, baseUrl?: string) {
  // Log the cache key to verify it's being used
  // Cache key handling
  // No debug logging to prevent information leakage
  try {
    // Construct URL using baseUrl if provided, otherwise use API_BASE_URL
    const base = baseUrl || API_BASE_URL;
    const apiUrl = `${base}${API_ENDPOINT}`;
    
    // Fetching latest standings from Premier League API
    const response = await fetch(apiUrl, {
      headers: {
        'Origin': 'https://www.premierleague.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        // Add cache control headers to prevent caching
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
      // Force fetch to bypass cache
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    const standings = data.tables[0].entries;

    // Process teams from standings data

    for (const entry of standings) {
      const apiId = parseInt(entry.team.id, 10);
      const position = entry.overall.position;
      const points = entry.overall.points;
      // Await each update individually to process them sequentially
      await db
        .update(teams)
        .set({ 
          actualPosition: position,
          points: points,
          lastUpdated: new Date() 
        })
        .where(eq(teams.apiId, apiId));
    }
    
    // Use tag-based revalidation instead of path-based to avoid issues with static generation
    revalidateTag('team-data');
    revalidateTag('leaderboard-data');
    revalidateTag('admin-data');
    revalidateTag('home-data');

    // Successfully updated team standings in the database
    return { success: true, message: `Updated ${standings.length} teams.` };

  } catch (error) {
    // Error handled silently to prevent logging sensitive information
    if (error instanceof Error) {
        return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred' };
  }
}
