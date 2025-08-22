// Static data for Firebase hosting (free tier)
// This file provides static fallbacks for data normally fetched from the database

export interface StaticTeam {
  id: number;
  name: string;
  abbr: string | null;
  shortName: string | null;
  apiId: number;
  actualPosition: number | null;
  lastUpdated: string | null;
}

export interface StaticUser {
  id: number;
  name: string;
  predictions: {
    teamId: number;
    predictedPosition: number | null;
  }[];
}

// Static teams data (Premier League 2025/26 season)
export const staticTeams: StaticTeam[] = [
  { id: 1, name: 'Manchester City', abbr: 'MCI', shortName: 'Man City', apiId: 11, actualPosition: 1, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 2, name: 'Arsenal', abbr: 'ARS', shortName: 'Arsenal', apiId: 1, actualPosition: 2, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 3, name: 'Liverpool', abbr: 'LIV', shortName: 'Liverpool', apiId: 10, actualPosition: 3, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 4, name: 'Tottenham Hotspur', abbr: 'TOT', shortName: 'Spurs', apiId: 6, actualPosition: 4, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 5, name: 'Aston Villa', abbr: 'AVL', shortName: 'Aston Villa', apiId: 2, actualPosition: 5, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 6, name: 'Manchester United', abbr: 'MUN', shortName: 'Man Utd', apiId: 12, actualPosition: 6, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 7, name: 'Chelsea', abbr: 'CHE', shortName: 'Chelsea', apiId: 4, actualPosition: 7, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 8, name: 'Newcastle United', abbr: 'NEW', shortName: 'Newcastle', apiId: 23, actualPosition: 8, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 9, name: 'West Ham United', abbr: 'WHU', shortName: 'West Ham', apiId: 25, actualPosition: 9, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 10, name: 'Brighton & Hove Albion', abbr: 'BHA', shortName: 'Brighton', apiId: 131, actualPosition: 10, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 11, name: 'Crystal Palace', abbr: 'CRY', shortName: 'Crystal Palace', apiId: 6, actualPosition: 11, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 12, name: 'Brentford', abbr: 'BRE', shortName: 'Brentford', apiId: 130, actualPosition: 12, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 13, name: 'Fulham', abbr: 'FUL', shortName: 'Fulham', apiId: 34, actualPosition: 13, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 14, name: 'Wolverhampton Wanderers', abbr: 'WOL', shortName: 'Wolves', apiId: 38, actualPosition: 14, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 15, name: 'Everton', abbr: 'EVE', shortName: 'Everton', apiId: 7, actualPosition: 15, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 16, name: 'Nottingham Forest', abbr: 'NFO', shortName: 'Forest', apiId: 15, actualPosition: 16, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 17, name: 'Leicester City', abbr: 'LEI', shortName: 'Leicester', apiId: 26, actualPosition: 17, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 18, name: 'Southampton', abbr: 'SOU', shortName: 'Southampton', apiId: 20, actualPosition: 18, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 19, name: 'Ipswich Town', abbr: 'IPS', shortName: 'Ipswich', apiId: 51, actualPosition: 19, lastUpdated: '2025-08-20T00:00:00.000Z' },
  { id: 20, name: 'Leeds United', abbr: 'LEE', shortName: 'Leeds', apiId: 9, actualPosition: 20, lastUpdated: '2025-08-20T00:00:00.000Z' }
];

// Static users data with predictions
export const staticUsers: StaticUser[] = [
  {
    id: 1,
    name: 'John',
    predictions: [
      { teamId: 1, predictedPosition: 1 },
      { teamId: 2, predictedPosition: 2 },
      { teamId: 3, predictedPosition: 3 },
      { teamId: 4, predictedPosition: 5 },
      { teamId: 5, predictedPosition: 6 },
      { teamId: 6, predictedPosition: 4 },
      { teamId: 7, predictedPosition: 7 },
      { teamId: 8, predictedPosition: 8 },
      { teamId: 9, predictedPosition: 10 },
      { teamId: 10, predictedPosition: 11 },
      { teamId: 11, predictedPosition: 12 },
      { teamId: 12, predictedPosition: 13 },
      { teamId: 13, predictedPosition: 14 },
      { teamId: 14, predictedPosition: 15 },
      { teamId: 15, predictedPosition: 9 },
      { teamId: 16, predictedPosition: 16 },
      { teamId: 17, predictedPosition: 17 },
      { teamId: 18, predictedPosition: 18 },
      { teamId: 19, predictedPosition: 19 },
      { teamId: 20, predictedPosition: 20 }
    ]
  },
  {
    id: 2,
    name: 'Chris',
    predictions: [
      { teamId: 1, predictedPosition: 2 },
      { teamId: 2, predictedPosition: 3 },
      { teamId: 3, predictedPosition: 1 },
      { teamId: 4, predictedPosition: 6 },
      { teamId: 5, predictedPosition: 5 },
      { teamId: 6, predictedPosition: 4 },
      { teamId: 7, predictedPosition: 8 },
      { teamId: 8, predictedPosition: 7 },
      { teamId: 9, predictedPosition: 10 },
      { teamId: 10, predictedPosition: 9 },
      { teamId: 11, predictedPosition: 12 },
      { teamId: 12, predictedPosition: 11 },
      { teamId: 13, predictedPosition: 13 },
      { teamId: 14, predictedPosition: 14 },
      { teamId: 15, predictedPosition: 15 },
      { teamId: 16, predictedPosition: 16 },
      { teamId: 17, predictedPosition: 17 },
      { teamId: 18, predictedPosition: 18 },
      { teamId: 19, predictedPosition: 20 },
      { teamId: 20, predictedPosition: 19 }
    ]
  },
  {
    id: 3,
    name: 'Clive',
    predictions: [
      { teamId: 1, predictedPosition: 2 },
      { teamId: 2, predictedPosition: 1 },
      { teamId: 3, predictedPosition: 3 },
      { teamId: 4, predictedPosition: 4 },
      { teamId: 5, predictedPosition: 5 },
      { teamId: 6, predictedPosition: 6 },
      { teamId: 7, predictedPosition: 7 },
      { teamId: 8, predictedPosition: 8 },
      { teamId: 9, predictedPosition: 9 },
      { teamId: 10, predictedPosition: 10 },
      { teamId: 11, predictedPosition: 11 },
      { teamId: 12, predictedPosition: 12 },
      { teamId: 13, predictedPosition: 13 },
      { teamId: 14, predictedPosition: 14 },
      { teamId: 15, predictedPosition: 15 },
      { teamId: 16, predictedPosition: 16 },
      { teamId: 17, predictedPosition: 17 },
      { teamId: 18, predictedPosition: 18 },
      { teamId: 19, predictedPosition: 19 },
      { teamId: 20, predictedPosition: 20 }
    ]
  },
  {
    id: 4,
    name: 'Dingle',
    predictions: [
      { teamId: 1, predictedPosition: 1 },
      { teamId: 2, predictedPosition: 2 },
      { teamId: 3, predictedPosition: 4 },
      { teamId: 4, predictedPosition: 3 },
      { teamId: 5, predictedPosition: 5 },
      { teamId: 6, predictedPosition: 6 },
      { teamId: 7, predictedPosition: 7 },
      { teamId: 8, predictedPosition: 8 },
      { teamId: 9, predictedPosition: 9 },
      { teamId: 10, predictedPosition: 11 },
      { teamId: 11, predictedPosition: 10 },
      { teamId: 12, predictedPosition: 12 },
      { teamId: 13, predictedPosition: 14 },
      { teamId: 14, predictedPosition: 15 },
      { teamId: 15, predictedPosition: 13 },
      { teamId: 16, predictedPosition: 17 },
      { teamId: 17, predictedPosition: 16 },
      { teamId: 18, predictedPosition: 18 },
      { teamId: 19, predictedPosition: 20 },
      { teamId: 20, predictedPosition: 19 }
    ]
  }
];
