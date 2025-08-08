'use server';

import { db } from '@/db';
import { predictions } from '@/db/schema';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

interface TeamPrediction {
  teamId: number;
  position: number;
}

export async function submitPredictions(predictionsList: TeamPrediction[]) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return { error: 'You must be logged in to submit predictions.' };
  }

  const userId = session.id as number;

  try {
    // The Neon serverless driver does not support transactions. 
    // We will perform delete and insert operations sequentially.
    
    // 1. Delete existing predictions for the user
    await db.delete(predictions).where(eq(predictions.userId, userId));

    // 2. Prepare the new predictions for insertion
    const newPredictions = predictionsList.map(p => ({
      userId,
      teamId: p.teamId,
      predictedPosition: p.position,
    }));

    // 3. Insert the new predictions
    if (newPredictions.length > 0) {
      await db.insert(predictions).values(newPredictions);
    }

    // Revalidate paths to ensure fresh data is shown
    revalidatePath('/leaderboard');
    revalidatePath('/predictions');

  } catch (error) {
    console.error('Error submitting predictions:', error);
    return { error: 'A database error occurred. Please try again.' };
  }

  // Redirect to the leaderboard after successful submission
  redirect('/leaderboard');
}
