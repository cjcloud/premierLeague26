import { updateTeamStandings, shouldUpdateStandings } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Add timestamp to avoid any caching issues
    const timestamp = Date.now();
    
    // Check if data is stale (older than 5 minutes) before making API call
    const needsUpdate = await shouldUpdateStandings(`should-update-${timestamp}`);
    
    if (!needsUpdate) {
      // Data is fresh (less than 5 minutes old), no need to update
      return NextResponse.json({
        success: true,
        message: 'Data is already up to date (less than 5 minutes old).'
      });
    }
    
    // Data is stale, perform the API update
    const result = await updateTeamStandings(`api-update-${timestamp}`);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: result.message 
    });
  } catch (error) {
    console.error('Error updating team standings:', error);
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred while updating team standings', 
      details: errorMessage
    }, { 
      status: 500 
    });
  }
}
