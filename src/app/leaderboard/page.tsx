import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { db } from '@/db';


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

        // Rule 3: Bonus for correct champion
        if (actual === 1) {
          totalPoints += 2;
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
        // Consolation point only if both predicted and actual are in a key zone
        const inTop4Zone = isTop4(predicted) && isTop4(actual);
        const inRelegationZone = isRelegation(predicted) && isRelegation(actual);

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
    if (predicted === undefined || actual === null) return 'bg-gray-100'; // No prediction or data
    const diff = Math.abs(predicted - actual);
    if (diff === 0) return 'bg-green-200'; // Correct
    if (diff === 1) return 'bg-yellow-200'; // Off by one
    return 'bg-red-200'; // Off by more than one
  };

  return (
    <>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
        <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-center py-3 px-2 font-semibold">Pos</th>
                <th className="text-left py-3 px-4 font-semibold">Team</th>
                {sortedUsers.map(user => (
                  <th key={user.id} className="text-center py-3 px-4 font-semibold">{user.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map(team => {
                return (
                  <tr key={team.id} className="border-b hover:bg-gray-50">
                    <td className="text-center py-3 px-2 font-bold">{team.actualPosition ?? '-'}</td>
                    <td className="py-3 px-4">{team.name}</td>
                    {sortedUsers.map(user => {
                      const predictedPosition = userPredictionsMap.get(user.id)?.get(team.id);
                      const colorClass = getCellColor(predictedPosition, team.actualPosition);
                      return (
                        <td key={`${user.id}-${team.id}`} className={`text-center py-3 px-4 ${colorClass}`}>
                          {predictedPosition ?? '-'}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {/* Total Points Row */}
              <tr className="bg-gray-200 font-bold">
                <td colSpan={2} className="text-right py-3 px-4">Total Points</td>
                {sortedUsers.map(user => {
                  const score = userScores.find(s => s.id === user.id)?.points ?? 0;
                  return (
                    <td key={`${user.id}-score`} className="text-center py-3 px-4">
                      {score}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
