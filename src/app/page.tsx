import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="container max-w-2xl mx-auto px-4 py-8" style={{ marginTop: '30px' }}>
      <div className="flex flex-col items-center justify-center gap-6">
        <h2 className="sm:text-md md:text-xl lg:text-2xl font-bold text-center">Welcome to Premier League Predictions</h2>
        <p className="text-muted-foreground sm:text-xs md:text-md text-center max-w-md">
          Make your selections before Aug 15th at 7pm
        </p>
        <div className="sm:text-xs md:text-md flex gap-4">
          <Link href="/leaderboard">
            <Button size="default" className="sm:text-[10px] md:text-md">View Leaderboard</Button>
          </Link>
          <Link href="/predictions">
            <Button size="default" variant="outline">Make Predictions</Button>
          </Link>
        </div>
      <div className="mx-auto px-4 py-4 rounded-lg bg-slate-200">
        <p className="sm:text-[6px] md:text-lg font-bold mt-4">Points System</p>
        <p className="sm:text-[6px] md:text-lg">Correct prediction = 2 points</p> 
        <p className="sm:text-[6px] md:text-lg">Near miss = 1 point</p>

        <p className="sm:text-[6px] md:text-lg font-bold mt-4">Bonus Points</p>
        {/* <p className="sm:text-xs md:text-md">Champion = 1 point</p> */}
        <p className="sm:text-[6px] md:text-lg">Top 4 (Prediction and Actual) = additional 1 point</p>
        <p className="sm:text-[8px] md:text-lg">Relegation Zone (Prediction and Actual) = additional 1 point</p>
      </div>
        <div className="sm:mt-16 md:mt-24 lg:mt-24 sm:text-[6px] md:text-[8px] flex gap-4">
          <p>Brought to you by <span className="text-red-600 font-bold"> Dont Be aC*nt </span>productions</p>
        </div>
      </div>
    </main>
  );
}
