import { shouldUpdateStandings, getLastUpdateTime } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Add timestamp to avoid any caching issues
    const timestamp = Date.now();
    
    // Get the last update timestamp first
    const lastUpdateInfo = await getLastUpdateTime();
    
    // Check if update is needed
    const needsUpdate = await shouldUpdateStandings(`api-check-${timestamp}`);
    
    // Calculate how many minutes ago the data was updated
    let lastUpdatedMinutesAgo = null;
    if (lastUpdateInfo && lastUpdateInfo.lastUpdated) {
      const now = new Date();
      const diffMs = now.getTime() - lastUpdateInfo.lastUpdated.getTime();
      lastUpdatedMinutesAgo = Math.round((diffMs / (1000 * 60)) * 10) / 10; // Round to 1 decimal
    }
    
    return NextResponse.json({ 
      needsUpdate,
      lastUpdated: lastUpdateInfo?.lastUpdated?.toISOString(),
      lastUpdatedMinutesAgo
    });
  } catch (error) {
    console.error('Error checking team standings update:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred while checking if update is needed'
    }, { 
      status: 500 
    });
  }
}
