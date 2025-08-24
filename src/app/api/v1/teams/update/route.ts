import { updateTeamStandings } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Add timestamp to avoid any caching issues
    const timestamp = Date.now();
    
    // Base URL handling - ensure we always have a protocol
    let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    
    // If we're on Vercel, make sure we include the https:// protocol
    if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    }
    
    // Perform the update with base URL
    const result = await updateTeamStandings(`api-update-${timestamp}`, baseUrl);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: result.message 
    });
  } catch (error) {
    console.error('Error updating team standings:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred while updating team standings' 
    }, { 
      status: 500 
    });
  }
}
