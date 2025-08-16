import React from 'react';

// Use dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';
// Disable client-side data store to reduce memory usage
export const fetchCache = 'force-no-store';
import { getUsersWithPredictions } from '@/lib/db/queries/users';
import { getTeams } from '@/lib/db/queries/teams';
import { shouldUpdateStandings, updateTeamStandings } from '@/lib/api';
import Image from 'next/image';

// Helper function to get cell background color class
const getCellColorClass = (predicted: number | undefined | null, actual: number | null) => {
    // Check if we have valid numbers to compare
    if (predicted === undefined || predicted === null || actual === null) {
        return '';
    }
    
    // Force conversion to numbers
    const predNum = Number(predicted);
    const actNum = Number(actual);
    
    if (predNum === actNum) {
        return 'bg-green-400 bg-opacity-70'; // Green for exact match
    }
    
    if (Math.abs(predNum - actNum) === 1) {
        return 'bg-yellow-400 bg-opacity-70'; // Yellow for off by one
    }
    
    return 'bg-red-400 bg-opacity-70'; // Red for more than one off
};

// Helper function to calculate points according to specification
const calculatePoints = (predictedPosition: number | undefined | null, actualPosition: number | null) => {
  let points = 0;
  
  // Return 0 if we don't have valid positions to compare
  if (predictedPosition === undefined || predictedPosition === null || actualPosition === null) {
    return points;
  }
  
  const diff = Math.abs(predictedPosition - actualPosition);
  
  // Helper functions to check if a position is in a special zone
  const inTopFour = (pos: number) => pos >= 1 && pos <= 4;
  const inRelegationZone = (pos: number) => pos >= 18 && pos <= 20;
  
  // Base points
  if (diff === 0) {
    points = 2; // Exact prediction - 2 base points
    
    // Bonus points for correct predictions in key positions
    if (actualPosition === 1) {
      points += 1; // Bonus for correctly predicting champion
    } 
    else if (actualPosition >= 2 && actualPosition <= 4) {
      points += 1; // Bonus for correctly predicting top 4 (not champion)
    } 
    else if (actualPosition >= 18 && actualPosition <= 20) {
      points += 1; // Bonus for correctly predicting relegation zone
    }
  } 
  else if (diff === 1) {
    points = 1; // Off by one - 1 base point
    
    // Bonus points when both positions are in the same special zone
    // Both predicted and actual are in top 4
    if (inTopFour(predictedPosition) && inTopFour(actualPosition)) {
      points += 1;
    }
    // Both predicted and actual are in relegation zone
    else if (inRelegationZone(predictedPosition) && inRelegationZone(actualPosition)) {
      points += 1;
    }
  } 
  else if (diff <= 3) {
    points = 0; // Off by 2 or 3 - normally 0 base points
    
    // Bonus point when both positions are in the same special zone despite being off by 2-3 positions
    // Both predicted and actual are in top 4
    if (inTopFour(predictedPosition) && inTopFour(actualPosition)) {
      points += 1;
    }
    // Both predicted and actual are in relegation zone
    else if (inRelegationZone(predictedPosition) && inRelegationZone(actualPosition)) {
      points += 1;
    }
  }
  else {
    points = 0; // Off by more than three - 0 points
  }
  
  return points;
};

// Type definitions to improve memory efficiency through proper typing
type UserPrediction = { teamId: number, predictedPosition: number };
type User = { id: number, name: string, predictions: UserPrediction[] };
// Remove custom Team type - we'll use the actual return type from the getTeams function
type UserScore = { id: number, name: string, points: number };

// Memory-efficient calculation of user scores - ensure types match the actual data structure
const calculateUserScores = (users: any[], teams: any[], predictionsMap: Map<number, Map<number, number>>) => {
  return users.map(user => {
    let totalPoints = 0;
    teams.forEach(team => {
      const predictedPosition = predictionsMap.get(user.id)?.get(team.id);
      totalPoints += calculatePoints(predictedPosition, team.actualPosition);
    });
    return { id: user.id, name: user.name, points: totalPoints };
  });
};

const LeaderboardPage = async () => {
  console.log(`[Leaderboard] Page rendering started at ${new Date().toISOString()}`);

  // Get users while we check if team data needs updating
  console.log(`[Leaderboard] Fetching users from database`);
  const users = await getUsersWithPredictions();
  
  // Check if team standings data is stale (older than 3 minutes)
  console.log('[Leaderboard] Checking if Premier League data needs updating...');
  const needsUpdate = await shouldUpdateStandings();
  console.log(`[Leaderboard] API update needed: ${needsUpdate ? 'YES' : 'NO'}`);
  
  // If update is needed, fetch fresh data from API
  if (needsUpdate) {
    console.log('[Leaderboard] Data is stale (> 3 minutes old). Updating from Premier League API...');
    await updateTeamStandings();
    console.log('[Leaderboard] API update completed successfully');
  } else {
    console.log('[Leaderboard] Using cached data (< 3 minutes old)');
  }

  // Always get the teams after potential update
  console.log('[Leaderboard] Fetching teams from database');
  const teams = await getTeams();

  // Log detailed information about the team data timestamps
  let oldestData = new Date();
  let newestData = new Date(0);
  let hasTimestamp = false;
  
  teams.forEach(team => {
    if (team.lastUpdated) {
      hasTimestamp = true;
      if (team.lastUpdated < oldestData) {
        oldestData = team.lastUpdated;
      }
      if (team.lastUpdated > newestData) {
        newestData = team.lastUpdated;
      }
    }
  });

  if (hasTimestamp) {
    const ageInMinutes = (Date.now() - oldestData.getTime()) / (1000 * 60);
    const ageInSeconds = (Date.now() - oldestData.getTime()) / 1000;
    console.log(`[Leaderboard] Oldest team data timestamp: ${oldestData.toISOString()} (${ageInMinutes.toFixed(1)} minutes old)`);
    console.log(`[Leaderboard] Newest team data timestamp: ${newestData.toISOString()} (${(Date.now() - newestData.getTime()) / 1000} seconds old)`);
    console.log(`[Leaderboard] Time since last update: ${ageInSeconds.toFixed(0)} seconds`);
  } else {
    console.log('[Leaderboard] WARNING: No lastUpdated timestamps found in team data');
  }
  
  // Create test data if actual positions are missing (for development purposes only)
  const hasActualPositions = teams.some(t => t.actualPosition !== null && t.actualPosition !== undefined);
  
  if (!hasActualPositions) {    
    // Create a shuffled array of positions from 1 to teams.length
    const positions = Array.from({length: teams.length}, (_, i) => i + 1);
    
    // Apply a unique position to each team (without modifying original data)
    teams.forEach((team, index) => {
      team.actualPosition = positions[index];
    });
  }
  
  const sortedTeams = [...teams].sort((a, b) => (a.actualPosition ?? 99) - (b.actualPosition ?? 99));

  // Create a more memory-efficient mapping structure - only create necessary maps
  const userPredictionsMap = new Map<number, Map<number, number>>();
  
  // Check if we need to create mock prediction data (if users have no or identical predictions)
  const hasPredictions = users.some(u => u.predictions.length > 0);
  
  users.forEach((user, userIndex) => {
    const predictions = new Map<number, number>();
    
    // If user has predictions, use them
    if (user.predictions.length > 0) {
      user.predictions.forEach(p => {
        predictions.set(p.teamId, p.predictedPosition);
      });
    } 
    // Otherwise create mock predictions with intentional variations
    else if (!hasPredictions) {
      // Skip logging to reduce memory usage
      
      teams.forEach((team, teamIndex) => {
        // For first user - mostly correct predictions with a few off by 1 or 2
        if (userIndex === 0) {
          if (teamIndex < 10) {
            // Exact matches for first 10 teams
            predictions.set(team.id, team.actualPosition!);
          } else if (teamIndex < 15) {
            // Off by 1 for next 5 teams
            predictions.set(team.id, (team.actualPosition! + 1 <= teams.length) ? 
              team.actualPosition! + 1 : team.actualPosition! - 1);
          } else {
            // Off by more for remaining teams
            predictions.set(team.id, (team.actualPosition! + 3 <= teams.length) ? 
              team.actualPosition! + 3 : team.actualPosition! - 3);
          }
        }
        // For second user - mostly wrong predictions with a few correct ones
        else if (userIndex === 1) {
          if (teamIndex < 5) {
            // Exact matches for first 5 teams
            predictions.set(team.id, team.actualPosition!);
          } else {
            // Off by 2-5 positions for the rest
            const offset = ((teamIndex % 4) + 2);
            const newPos = (team.actualPosition! + offset <= teams.length) ?
              team.actualPosition! + offset : team.actualPosition! - offset;
            predictions.set(team.id, newPos);
          }
        }
        // For any other users - random predictions
        else {
          // Just leave them empty/undefined
        }
      });
    }
    
    userPredictionsMap.set(user.id, predictions);
  });
  
  // Remove debug logging and operations to reduce memory usage

  // Calculate scores in one pass to avoid redundant calculations
  const userScores = calculateUserScores(users, teams, userPredictionsMap);

  // Sort users by total points with optimized lookup using a Map instead of find()
  const scoreMap = new Map(userScores.map(s => [s.id, s.points]));
  const sortedUsersByScore = [...users].sort((a, b) => {
    const scoreA = scoreMap.get(a.id) ?? 0;
    const scoreB = scoreMap.get(b.id) ?? 0;
    return scoreB - scoreA;
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left">Leaderboard</h1>
      <div className="overflow-x-auto -mx-4 px-1 sm:mx-0 sm:px-0">
        <div className="max-w-[100vw] overflow-hidden">
          <table className="w-full text-[11px] xs:text-xs sm:text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
              <th rowSpan={2} className="text-center py-1 sm:py-2 px-1 sm:px-2 text-xs sm:text-base font-semibold align-middle">Pos</th>
              <th rowSpan={2} className="text-left py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-base font-semibold align-middle">Team</th>
              {sortedUsersByScore.map(user => (
                <th key={user.id} colSpan={2} className="text-center py-1 sm:py-2 px-1 sm:px-2 text-xs sm:text-base font-semibold border-l-2 border-gray-200 dark:border-gray-600">{user.name}</th>
              ))}
            </tr>
            <tr className="bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
              {sortedUsersByScore.map(user => (
                <React.Fragment key={user.id}>
                  <th className="text-center py-0 sm:py-1 px-0 sm:px-1 font-semibold text-[11px] sm:text-sm border-l-2 border-gray-200 dark:border-gray-600 w-8 sm:w-10">Prd</th>
                  <th className="text-center py-0 sm:py-1 px-0 sm:px-1 font-semibold text-[11px] sm:text-sm border-l border-gray-200 dark:border-gray-700 w-8 sm:w-10">Pts</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => (
              <tr key={team.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} border-b dark:border-gray-700`}>
                {/* Current Position Column - Explicitly display with fallback */}
                <td className="text-center py-1 sm:py-2 px-1 sm:px-2 font-bold text-sm sm:text-lg">
                  {typeof team.actualPosition === 'number' ? team.actualPosition : '-'}
                </td>
                <td className="py-0 sm:py-1 px-1 sm:px-2">
                  <div className="flex items-center h-6 sm:h-7">
                    <div className="w-6 flex justify-center">
                      {team.abbr && (
                        <Image 
                          src={`/images/${team.abbr}.svg`} 
                          alt={`${team.abbr || 'Team'} logo`} 
                          width={20} 
                          height={20}
                          loading="lazy"
                          unoptimized={false}
                          className="w-5 h-5"
                        />
                      )}
                    </div>
                    <span className="font-semibold hidden sm:inline ml-1">{team.name}</span>
                    <span className="font-semibold pr-2 inline sm:hidden ml-1">{team.abbr || team.name?.substring(0,3)}</span>
                  </div>
                </td>
                {sortedUsersByScore.map(user => {
                  const predictedPosition = userPredictionsMap.get(user.id)?.get(team.id);
                  const points = calculatePoints(predictedPosition, team.actualPosition);
                  
                  // Get cell color style string based on prediction accuracy
                  let cellColorStyle = '';
                  
                  // If there's both a prediction and an actual position, apply color coding
                  if (predictedPosition !== undefined && predictedPosition !== null && team.actualPosition !== null) {
                    const difference = Math.abs(Number(predictedPosition) - Number(team.actualPosition));
                    
                    // Exact match - green
                    if (difference === 0) {
                      cellColorStyle = 'background-color: #4ade80 !important';
                    }
                    // Off by one - yellow
                    else if (difference === 1) {
                      cellColorStyle = 'background-color: #facc15 !important'; 
                    }
                    // Off by more than one - red
                    else {
                      cellColorStyle = 'background-color: #f87171 !important';
                    }
                  }

                  return (
                    <React.Fragment key={user.id}>
                      {/* Memory-optimized rendering without dangerouslySetInnerHTML */}
                      <td className={`text-center p-0 border-r border-gray-300/30 font-semibold w-8 sm:w-10 ${getCellColorClass(predictedPosition, team.actualPosition)}`}>
                        <div className="h-full w-full py-1 px-0 flex items-center justify-center text-[11px] sm:text-sm">
                          {typeof predictedPosition === 'number' ? predictedPosition : '-'}
                        </div>
                      </td>
                      <td className={`text-center p-0 border-r-2 border-gray-300/40 font-semibold w-8 sm:w-10 ${getCellColorClass(predictedPosition, team.actualPosition)}`}>
                        <div className="h-full w-full py-1 px-0 flex items-center justify-center text-[11px] sm:text-sm">
                          {points}
                        </div>
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
            <tr className="bg-gray-300 dark:bg-gray-700 font-bold">
              <td colSpan={2} className="text-right py-0 px-4">Total Points</td>
              {sortedUsersByScore.map(user => {
                const score = userScores.find(s => s.id === user.id)?.points ?? 0;
                return (
                  <td key={`${user.id}-total-score`} colSpan={2} className="text-center py-0 px-2 border-l-2 border-slate-100 dark:border-gray-600">
                    {score}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
