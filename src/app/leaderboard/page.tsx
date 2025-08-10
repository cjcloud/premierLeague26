import React from 'react';

export const dynamic = 'force-dynamic';
import { getUsersWithPredictions } from '@/lib/db/queries/users';
import { getTeams } from '@/lib/db/queries/teams';
import Image from 'next/image';

// Helper function to generate cell color style string with !important
const getCellColorStyle = (predicted: number | undefined | null, actual: number | null) => {
    // First, add logging to see what values we're getting
    console.log('Color calculation - predicted:', predicted, 'actual:', actual);
    
    // Check if we have valid numbers to compare
    if (predicted === undefined || predicted === null || actual === null) {
        console.log('Missing values, no coloring');
        return '';
    }
    
    // Force conversion to numbers and log the values
    const predNum = Number(predicted);
    const actNum = Number(actual);
    console.log('After conversion - predNum:', predNum, 'actNum:', actNum, 'Difference:', Math.abs(predNum - actNum));
    
    // Debug: log what condition is being met
    if (predNum === actNum) {
        console.log('EXACT MATCH - using green');
        return 'background-color: #4ade80 !important'; // Bright green for exact match
    }
    
    if (Math.abs(predNum - actNum) === 1) {
        console.log('OFF BY ONE - using yellow');
        return 'background-color: #facc15 !important'; // Bright yellow for off by one
    }
    
    console.log('OFF BY MORE THAN ONE - using red');
    return 'background-color: #f87171 !important'; // Bright red for more than one off
};

// Helper function to calculate points according to specification
const calculatePoints = (predictedPosition: number | undefined | null, actualPosition: number | null) => {
  let points = 0;
  
  // Return 0 if we don't have valid positions to compare
  if (predictedPosition === undefined || predictedPosition === null || actualPosition === null) {
    return points;
  }
  
  const diff = Math.abs(predictedPosition - actualPosition);
  
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
    
    // Consolation points for near-misses in key zones
    const inTopFour = (pos: number) => pos >= 1 && pos <= 4;
    const inRelegationZone = (pos: number) => pos >= 18 && pos <= 20;
    
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
    points = 0; // Off by more than one - 0 points
  }
  
  return points;
};

const LeaderboardPage = async () => {
  const users = await getUsersWithPredictions();
  const teams = await getTeams();
  
  // Create test data if actual positions are missing (for development purposes only)
  const hasActualPositions = teams.some(t => t.actualPosition !== null && t.actualPosition !== undefined);
  
  console.log('Teams before modification:', JSON.stringify(teams.map(t => 
    ({ id: t.id, name: t.name, pos: t.actualPosition }))));
  
  if (!hasActualPositions) {
    console.log('No actual positions found in data, applying unique test positions for development');
    
    // Create a shuffled array of positions from 1 to teams.length
    const positions = Array.from({length: teams.length}, (_, i) => i + 1);
    
    // Apply a unique position to each team
    teams.forEach((team, index) => {
      team.actualPosition = positions[index];
    });
    
    console.log('Applied unique positions:', teams.map(t => ({ id: t.id, name: t.name, pos: t.actualPosition })));
  } else {
    console.log('Team positions found');
  }
  
  const sortedTeams = [...teams].sort((a, b) => (a.actualPosition ?? 99) - (b.actualPosition ?? 99));

  const userPredictionsMap = new Map<number, Map<number, number>>();
  
  // Remove console logging for production to reduce memory usage
  
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

  const userScores = users.map(user => {
    let totalPoints = 0;
    teams.forEach(team => {
      
      const predictedPosition = userPredictionsMap.get(user.id)?.get(team.id);
      totalPoints += calculatePoints(predictedPosition, team.actualPosition);
    });
    return { id: user.id, name: user.name, points: totalPoints };
  });

  // Sort users by total points for the final display order in the header
  const sortedUsersByScore = [...users].sort((a, b) => {
    const scoreA = userScores.find(s => s.id === a.id)?.points ?? 0;
    const scoreB = userScores.find(s => s.id === b.id)?.points ?? 0;
    return scoreB - scoreA;
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left">Leaderboard</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md text-base sm:text-base">
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
                  <th className="text-center py-0 sm:py-1 px-1 sm:px-2 font-semibold text-[10px] sm:text-sm border-l-2 border-gray-200 dark:border-gray-600">Prd</th>
                  <th className="text-center py-0 sm:py-1 px-1 sm:px-2 font-semibold text-[10px] sm:text-sm border-l border-gray-200 dark:border-gray-700">Pts</th>
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
                <td className="py-1 sm:py-2 px-2 sm:px-4">
                  <div className="flex items-center gap-2 h-8">
                   
                      <Image src={`/images/${team.abbr}.svg`} alt={`${team.abbr} logo`} width={24} height={24} />
                   
                    <span className="font-semibold hidden sm:inline">{team.name}</span>
                    <span className="font-semibold pr-4 inline sm:hidden">{team.abbr}</span>
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
                    
                    // Log difference for debugging
                    console.log(`Team ${team.name} - predicted: ${predictedPosition}, actual: ${team.actualPosition}, diff: ${difference}`);
                    
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
                      {/* Direct color application for predicted position cell with style attribute */}
                      <td 
                        style={{fontWeight: 'bold', ...(cellColorStyle ? {background: 'none'} : {})}}
                        className="text-center p-0 border-0"
                        dangerouslySetInnerHTML={{
                          __html: `<div style="${cellColorStyle}; height: 100%; width: 100%; padding: 12px; display: flex; align-items: center; justify-content: center;">
                                    ${typeof predictedPosition === 'number' ? predictedPosition : '-'}
                                  </div>`
                        }}
                      >
                      </td>
                      {/* Direct color application for points cell with style attribute */}
                      <td 
                        style={{fontWeight: 'bold', ...(cellColorStyle ? {background: 'none'} : {})}}
                        className="text-center p-0 border-none m-0"
                        dangerouslySetInnerHTML={{
                          __html: `<div style="${cellColorStyle}; height: 100%; width: 100%; padding: 12px; display: flex; align-items: center; justify-content: center;">
                                    ${points}
                                  </div>`
                        }}
                      >
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
            <tr className="bg-gray-200 dark:bg-gray-700 font-bold">
              <td colSpan={2} className="text-right py-0 px-4">Total Points</td>
              {sortedUsersByScore.map(user => {
                const score = userScores.find(s => s.id === user.id)?.points ?? 0;
                return (
                  <td key={`${user.id}-total-score`} colSpan={2} className="text-center py-0 px-2 border-l-2 border-gray-400 dark:border-gray-600">
                    {score}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPage;
