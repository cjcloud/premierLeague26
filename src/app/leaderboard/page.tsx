import React from 'react';
import { getSession } from '@/lib/session';
import { Suspense } from 'react';
import { db } from '@/db';
import { users, teams, predictions } from '@/db/schema';
import { LeaderboardClient } from '@/components/leaderboard-client';

// Define types for clarity
interface Prediction {
  userId: number;
  teamId: number;
  predictedPosition: number;
}

interface User {
  id: number;
  name: string;
}

interface Team {
  id: number;
  apiId: number;
  name: string;
  abbr: string | null;
  actualPosition: number | null;
}

interface UserWithPredictions extends User {
  predictions: Prediction[];
}

interface UserScore {
  id: number;
  name: string;
  points: number;
}

async function getLeaderboardData() {
  const allUsersWithPredictions = await db.query.users.findMany({
    with: {
      predictions: true,
    },
  });

  const allTeams = await db.query.teams.findMany();

  return { allUsersWithPredictions, allTeams };
}

function calculateScores(
  usersWithPredictions: UserWithPredictions[],
  teams: Team[]
): UserScore[] {
  const teamActualPositions = new Map<number, number | null>();
  teams.forEach(team => {
    if (team.actualPosition !== null) {
      teamActualPositions.set(team.id, team.actualPosition);
    }
  });

  const scores = usersWithPredictions.map(user => {
    let totalPoints = 0;
    user.predictions.forEach(prediction => {
      const actual = teamActualPositions.get(prediction.teamId);
      const predicted = prediction.predictedPosition;

      if (actual === undefined || actual === null) {
        return; // Skip if no actual position data
      }

      const isTop4 = (pos: number) => pos >= 1 && pos <= 4;
      const isRelegation = (pos: number) => pos >= 18 && pos <= 20;

      // Rule 1: Exactly correct prediction
      if (predicted === actual) {
        totalPoints += 2; // Base points for correct prediction

        // Rule 3: Bonus for correct champion (2 base + 1 bonus)
        if (actual === 1) {
          totalPoints += 1;
        }
        // Rule 4: Bonus for correct top 4
        else if (isTop4(actual)) {
          totalPoints += 1;
        }
        // Rule 5: Bonus for correct relegation
        else if (isRelegation(actual)) {
          totalPoints += 1;
        }
      }
      // Rule 2 & 6/7: Prediction is off by one position
      else if (Math.abs(predicted - actual) === 1) {
        totalPoints += 1; // Base point for being off by one
        const inTop4Zone = isTop4(predicted) && isTop4(actual);
        const inRelegationZone = isRelegation(predicted) && isRelegation(actual);

        // Bonus point if the off-by-one is within a key zone
        if (inTop4Zone || inRelegationZone) {
          totalPoints += 1;
        }
      }
    });

    return {
      id: user.id,
      name: user.name,
      points: totalPoints,
    };
  });

  // Sort users by points, descending
  return scores.sort((a, b) => b.points - a.points);
}

export default async function LeaderboardPage() {
  const session = await getSession();

  const { allUsersWithPredictions, allTeams } = await getLeaderboardData();
  const userScores = calculateScores(allUsersWithPredictions, allTeams as Team[]);

  // Create a unique, sorted list of users for the header
  const uniqueUsers = allUsersWithPredictions.filter((user, index, self) =>
    index === self.findIndex((u) => u.name === user.name)
  );
  const sortedUsers = uniqueUsers.sort((a, b) => a.id - b.id);

  // Create a map for user predictions for easy lookup
  const userPredictionsMap = new Map<number, Map<number, number>>();
  allUsersWithPredictions.forEach(user => {
    const predictions = new Map<number, number>();
    user.predictions.forEach(p => {
      predictions.set(p.teamId, p.predictedPosition);
    });
    userPredictionsMap.set(user.id, predictions);
  });

  // Sort teams by actual position
  const sortedTeams = [...allTeams].sort((a, b) => (a.actualPosition ?? 99) - (b.actualPosition ?? 99));

  const getCellColor = (predicted: number | undefined, actual: number | null) => {
    if (predicted === undefined || actual === null) return 'bg-gray-100 dark:bg-gray-700'; // No prediction or data
    const diff = Math.abs(predicted - actual);
    if (diff === 0) return 'bg-green-200 dark:bg-green-800'; // Correct
    if (diff === 1) return 'bg-yellow-200 dark:bg-yellow-800'; // Off by one
    return 'bg-red-200 dark:bg-red-800'; // Off by more than one
  };

  type TextColorState = 'default' | 'correct' | 'off-by-one' | 'other';

  const textColorMap: Record<TextColorState, string> = {
    default: 'text-gray-800 dark:text-gray-300',
    correct: 'text-green-600 dark:text-green-400 font-bold',
    'off-by-one': 'text-orange-500 dark:text-orange-400',
    other: 'text-red-600 dark:text-red-400',
  };

  const getTextColorState = (predicted: number | undefined, actual: number | null): TextColorState => {
    if (predicted === undefined || actual === null) return 'default';
    const diff = Math.abs(predicted - actual);
    if (diff === 0) return 'correct';
    if (diff === 1) return 'off-by-one';
    return 'other';
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense fallback={null}>
        <LeaderboardClient isLoggedIn={session.isLoggedIn ?? false} username={session.name ?? null} />
      </Suspense>

      <h1 className="text-3xl font-bold mb-6 text-center md:text-left">Leaderboard</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
              <th rowSpan={2} className="text-center py-3 px-2 font-semibold align-middle">Pos</th>
              <th rowSpan={2} className="text-left py-3 px-4 font-semibold align-middle">Team</th>
              {sortedUsers.map(user => (
                <th key={user.id} colSpan={2} className="text-center py-3 px-4 font-semibold border-l-2 border-gray-400 dark:border-gray-600">{user.name}</th>
              ))}
            </tr>
            <tr className="bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
              {sortedUsers.map(user => (
                <React.Fragment key={user.id}>
                  <th className="text-center py-2 px-2 font-semibold text-sm border-l-2 border-gray-400 dark:border-gray-600">Prd</th>
                  <th className="text-center py-2 px-2 font-semibold text-sm border-l border-gray-200 dark:border-gray-700">Pts</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => {
              const rowColor = index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800';
              return (
                <tr key={team.id} className={`border-b dark:border-gray-700 ${rowColor}`}>
                  <td className="text-center py-3 px-2 font-bold">{team.actualPosition ?? '-'}</td>
                  <td className="py-3 px-4">
                    <span className="hidden md:inline">{team.name}</span>
                    <span className="md:hidden">{team.abbr || team.name}</span>
                  </td>
                  {sortedUsers.map(user => {
                    const predictedPosition = userPredictionsMap.get(user.id)?.get(team.id);
                    const actualPosition = team.actualPosition;
                    const pointsBgColorClass = getCellColor(predictedPosition, actualPosition);
                    const textColorState = getTextColorState(predictedPosition, actualPosition);
                    const textColorClass = textColorMap[textColorState];

                    let pointsContent: React.ReactNode = 0;
                    if (predictedPosition !== undefined && actualPosition !== null) {
                      let points = 0;
                      const isTop4 = (pos: number) => pos >= 1 && pos <= 4;
                      const isRelegation = (pos: number) => pos >= 18 && pos <= 20;
                      if (predictedPosition === actualPosition) {
                        points += 2;
                        if (actualPosition === 1) points += 1;
                        else if (isTop4(actualPosition)) points += 1;
                        else if (isRelegation(actualPosition)) points += 1;
                      } else if (Math.abs(predictedPosition - actualPosition) === 1) {
                        points += 1; // Base point for being off by one
                        const inTop4Zone = isTop4(predictedPosition) && isTop4(actualPosition);
                        const inRelegationZone = isRelegation(predictedPosition) && isRelegation(actualPosition);
                        // Bonus point if the off-by-one is within a key zone
                        if (inTop4Zone || inRelegationZone) { points += 1; }
                      }
                      pointsContent = points;
                    }

                    return (
                      <React.Fragment key={user.id}>
                        <td className={`text-center py-3 px-2 border-l-2 border-gray-400 dark:border-gray-600 text-slate-900 dark:text-slate-200 ${pointsBgColorClass}`}>
                          {predictedPosition ?? '-'}
                        </td>
                        <td className={`text-center py-3 px-2 border-l border-gray-200 dark:border-gray-700 text-slate-900 dark:text-slate-200 ${pointsBgColorClass}`}>
                          {pointsContent}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              );
            })}
            <tr className="bg-gray-200 dark:bg-gray-700 font-bold">
              <td colSpan={2} className="text-right py-3 px-4">Total Points</td>
              {sortedUsers.map(user => {
                const score = userScores.find(s => s.id === user.id)?.points ?? 0;
                return (
                  <td key={`${user.id}-score`} colSpan={2} className="text-center py-3 px-4 border-l-2 border-gray-400 dark:border-gray-600">
                    {score}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="md:hidden bg-gray-200 dark:bg-gray-700 rounded-lg shadow-md p-4 mt-6">
        <h2 className="text-xl font-bold mb-3 text-center">Total Points</h2>
        <div className="space-y-2 font-semibold">
          {sortedUsers.map(user => {
            const score = userScores.find(s => s.id === user.id)?.points ?? 0;
            return (
              <div key={`${user.id}-total`} className="flex justify-between">
                <span>{user.name}</span>
                <span>{score}</span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
