import { updateTeamStandings } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Add timestamp to avoid any caching issues
    const timestamp = Date.now();
    
    // Perform the direct API update
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
