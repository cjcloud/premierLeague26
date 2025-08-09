import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { teams, predictions } from '@/db/schema';
import { PredictionForm } from '@/components/prediction-form';
import { eq } from 'drizzle-orm';

export default async function PredictionsPage() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.id) {
    redirect('/login');
  }

  const allTeams = await db.query.teams.findMany();
  const userPredictions = await db.query.predictions.findMany({
    where: eq(predictions.userId, session.id),
  });

  return (
    <div className="container mx-auto py-10">
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">Welcome, {session.name}!</p>
      <PredictionForm teams={allTeams} initialPredictions={userPredictions} />
    </div>
  );
}
