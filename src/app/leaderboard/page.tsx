import React from 'react';

export const dynamic = 'force-dynamic';
import { getUsersWithPredictions } from '@/lib/db/queries/users';
import { getTeams } from '@/lib/db/queries/teams';
import Image from 'next/image';

// Helper function to determine the background color for prediction cells
const getCellColor = (predicted: number | undefined | null, actual: number | null): string => {
    if (predicted === undefined || predicted === null || actual === null) {
        return 'bg-transparent'; // Default for no prediction or no actual position
    }
    if (predicted === actual) {
        return 'bg-green-200 dark:bg-green-800'; // Correct
    }
    if (Math.abs(predicted - actual) === 1) {
        return 'bg-yellow-200 dark:bg-yellow-800'; // Off by one
    }
    return 'bg-red-200 dark:bg-red-800'; // More than 1 off
};

// Helper function to calculate points
const calculatePoints = (predictedPosition: number | undefined | null, actualPosition: number | null) => {
  let points = 0;
  if (predictedPosition !== undefined && predictedPosition !== null && actualPosition !== null) {
    const diff = Math.abs(predictedPosition - actualPosition);
    if (diff === 0) points = 2; // Exact prediction
    if (diff === 1) points = 1; // Off by one
  }
  return points;
};

const LeaderboardPage = async () => {
  const users = await getUsersWithPredictions();
  const teams = await getTeams();

  const sortedTeams = [...teams].sort((a, b) => (a.actualPosition ?? 99) - (b.actualPosition ?? 99));

  const userPredictionsMap = new Map<number, Map<number, number>>();
  users.forEach(user => {
    const predictions = new Map<number, number>();
    user.predictions.forEach(p => {
      predictions.set(p.teamId, p.predictedPosition);
    });
    userPredictionsMap.set(user.id, predictions);
  });

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
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
              <th rowSpan={2} className="text-center py-2 px-2 font-semibold align-middle">Pos</th>
              <th rowSpan={2} className="text-left py-2 px-4 font-semibold align-middle">Team</th>
              {sortedUsersByScore.map(user => (
                <th key={user.id} colSpan={2} className="text-center py-2 px-2 font-semibold border-l-2 border-gray-400 dark:border-gray-600">{user.name}</th>
              ))}
            </tr>
            <tr className="bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
              {sortedUsersByScore.map(user => (
                <React.Fragment key={user.id}>
                  <th className="text-center py-1 px-2 font-semibold text-sm border-l-2 border-gray-400 dark:border-gray-600">Prd</th>
                  <th className="text-center py-1 px-2 font-semibold text-sm border-l border-gray-200 dark:border-gray-700">Pts</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team, index) => (
              <tr key={team.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} border-b dark:border-gray-700`}>
                <td className="text-center py-2 px-2 font-medium">{team.actualPosition ?? '-'}</td>
                <td className="py-2 px-4">
                  <div className="flex items-center gap-2">
                    <Image src={`/images/${team.abbr}.svg`} alt={`${team.name} logo`} width={24} height={24} />
                    <span className="font-semibold">{team.name}</span>
                  </div>
                </td>
                {sortedUsersByScore.map(user => {
                  const predictedPosition = userPredictionsMap.get(user.id)?.get(team.id);
                  const points = calculatePoints(predictedPosition, team.actualPosition);
                  const cellColor = getCellColor(predictedPosition, team.actualPosition);

                  return (
                    <React.Fragment key={user.id}>
                      <td className={`text-center py-2 px-2 border-l-2 border-gray-400 dark:border-gray-600 font-bold ${cellColor}`}>
                        {predictedPosition ?? '-'}
                      </td>
                      <td className={`text-center py-2 px-2 border-l border-gray-200 dark:border-gray-700 font-bold ${cellColor}`}>
                        {points}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
            <tr className="bg-gray-200 dark:bg-gray-700 font-bold">
              <td colSpan={2} className="text-right py-2 px-4">Total Points</td>
              {sortedUsersByScore.map(user => {
                const score = userScores.find(s => s.id === user.id)?.points ?? 0;
                return (
                  <td key={`${user.id}-total-score`} colSpan={2} className="text-center py-2 px-2 border-l-2 border-gray-400 dark:border-gray-600">
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
