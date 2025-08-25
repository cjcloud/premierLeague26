import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Extract the path and query parameters from the request
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'standings';
  const live = searchParams.get('live') || 'false';

  try {
    // Make the request to the Premier League API from the server side
    const apiResponse = await fetch(
      `https://sdp-prem-prod.premier-league-prod.pulselive.com/api/v5/competitions/8/seasons/2025/${endpoint}?live=${live}`,
      {
        headers: {
          'Origin': 'https://www.premierleague.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
          'Content-Type': 'application/json',
          'Referer': 'https://www.premierleague.com/',
        },
      }
    );

    if (!apiResponse.ok) {
      return NextResponse.json(
        { error: `Premier League API returned ${apiResponse.status}` },
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Premier League API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Premier League API' },
      { status: 500 }
    );
  }
}
