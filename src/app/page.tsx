import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="container max-w-2xl mx-auto px-4 py-8" style={{ marginTop: '30px' }}>
      <div className="flex flex-col items-center justify-center gap-6">
        <h2 className="sm:text-md md:text-xl lg:text-2xl font-bold text-center">Welcome to Premier League Predictions</h2>
        <p className="text-muted-foreground sm:text-xs md:text-md text-center max-w-md">
          Test your football knowledge and compete with others. Predict match outcomes and climb the leaderboard!
        </p>
        <div className="sm:text-xs md:text-md flex gap-4">
          <Link href="/leaderboard">
            <Button size="default" className="sm:text-xs md:text-md">View Leaderboard</Button>
          </Link>
          <Link href="/predictions">
            <Button size="default" variant="outline">Make Predictions</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
