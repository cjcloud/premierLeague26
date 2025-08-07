import { db } from '@/db';
import { teams } from '@/db/schema';
import { eq } from 'drizzle-orm';

const API_URL = 'https://sdp-prem-prod.premier-league-prod.pulselive.com/api/v5/competitions/8/seasons/2025/standings?live=false';

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
        .set({ actualPosition: position })
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
