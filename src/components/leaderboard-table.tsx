'use client';

import React from 'react';
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

// Define types for props
type Team = {
  id: number;
  name: string;
  abbr: string | null;
  actualPosition: number | null;
};

type UserScore = {
  id: number;
  name: string;
  points: number;
  predictions: Record<number | string, number | null>;
};

type LeaderboardTableProps = {
  teams: Team[];
  users: UserScore[];
};

export default function LeaderboardTable({ teams, users }: LeaderboardTableProps) {
  // Sort teams by actual position
  const sortedTeams = [...teams].sort((a, b) => (a.actualPosition ?? 99) - (b.actualPosition ?? 99));
  
  // Sort users by points (already done on server)
  const sortedUsers = users;

  return (
    <div className="overflow-x-auto -mx-4 px-1 sm:mx-0 sm:px-0">
      <div className="max-w-[100vw] overflow-hidden">
        <table className="w-full text-[11px] xs:text-xs sm:text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
              <th rowSpan={2} className="text-center py-1 sm:py-2 px-1 sm:px-2 text-xs sm:text-base font-semibold align-middle">Pos</th>
              <th rowSpan={2} className="text-left py-1 sm:py-2 px-2 sm:px-4 text-xs sm:text-base font-semibold align-middle">Team</th>
              {sortedUsers.map(user => (
                <th key={user.id} colSpan={2} className="text-center py-1 sm:py-2 px-1 sm:px-2 text-xs sm:text-base font-semibold border-l-2 border-gray-200 dark:border-gray-600">{user.name}</th>
              ))}
            </tr>
            <tr className="bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
              {sortedUsers.map(user => (
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
                          loading="eager"
                          priority={team.actualPosition !== null && team.actualPosition <= 5}
                          className="w-5 h-5"
                        />
                      )}
                    </div>
                    <span className="font-semibold hidden sm:inline ml-1">{team.name}</span>
                    <span className="font-semibold pr-2 inline sm:hidden ml-1">{team.abbr || team.name?.substring(0,3)}</span>
                  </div>
                </td>
                {sortedUsers.map(user => {
                  const predictedPosition = user.predictions[team.id];
                  // Points are pre-calculated on the server for each prediction
                  const points = user.predictions[`${team.id}_points`] || 0;
                  
                  return (
                    <React.Fragment key={user.id}>
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
              {sortedUsers.map(user => (
                <td key={`${user.id}-total-score`} colSpan={2} className="text-center py-0 px-2 border-l-2 border-slate-100 dark:border-gray-600">
                  {user.points}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
