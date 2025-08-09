import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="container max-w-2xl mx-auto px-4 py-8" style={{ marginTop: '30px' }}>
      <div className="flex flex-col items-center justify-center gap-6">
        <h2 className="sm:text-md md:text-xl lg:text-2xl font-bold text-center">Welcome to Premier League Predictions</h2>
        <p className="text-muted-foreground sm:text-xs md:text-md text-center max-w-md">
          Make your selections before aug 15th at 7pm
        </p>
        <div className="sm:text-xs md:text-md flex gap-4">
          <Link href="/leaderboard">
            <Button size="default" className="sm:text-xs md:text-md">View Leaderboard</Button>
          </Link>
          <Link href="/predictions">
            <Button size="default" variant="outline">Make Predictions</Button>
          </Link>
        </div>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="sm:text-xs md:text-md font-bold mt-4">Points System</p>
        <p className="sm:text-xs md:text-md">Correct prediction = 2 points</p> 
        <p className="sm:text-xs md:text-md">Near miss = 1 point</p>
        <p className="sm:text-xs md:text-md font-bold mt-4">Bonus Points</p>
        {/* <p className="sm:text-xs md:text-md">Champion = 1 point</p> */}
        <p className="sm:text-xs md:text-md">Top 4 (Prediction and Actual) = 1 point</p>
        <p className="sm:text-xs md:text-md">Relegation Zone (Prediction and Actual) = 1 point</p>
      </div>
        <div className="mt-24 sm:text-xs md:text-md flex gap-4 text-red-700">
          <p>Brought to you by Don't be such aC*nt productions</p>
        </div>
      </div>
    </main>
  );
}
