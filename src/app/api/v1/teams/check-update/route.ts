import { shouldUpdateStandings } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Add timestamp to avoid any caching issues
    const timestamp = Date.now();
    
    // Check if update is needed
    const needsUpdate = await shouldUpdateStandings(`api-check-${timestamp}`);
    
    return NextResponse.json({ 
      needsUpdate,
      lastUpdatedMinutesAgo: null // We could calculate this if needed
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
