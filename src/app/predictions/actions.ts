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
    // Drizzle doesn't support ON CONFLICT for Postgres yet in its core API
    // We'll delete existing predictions and insert new ones in a transaction
    await db.transaction(async (tx) => {
      await tx.delete(predictions).where(eq(predictions.userId, userId));
      
      const newPredictions = predictionsList.map(p => ({
        userId,
        teamId: p.teamId,
        predictedPosition: p.position,
      }));

      if (newPredictions.length > 0) {
        await tx.insert(predictions).values(newPredictions);
      }
    });

    revalidatePath('/'); // Revalidate home page if it shows prediction status
    revalidatePath('/predictions');
  } catch (error) {
    console.error('Error submitting predictions:', error);
    return { error: 'A database error occurred. Please try again.' };
  }

  redirect('/'); // Redirect to home page after successful submission
}
