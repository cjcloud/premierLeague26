import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="container max-w-2xl mx-auto px-4 py-8" style={{ marginTop: '30px' }}>
      <div className="flex flex-col items-center justify-center gap-6 ">
        <div className="flex flex-col items-center justify-center gap-2 space-y-1 leading-tight">
        <p className="text-sm sm:text-md md:text-xl lg:text-xl font-bold text-center leading-tight">Welcome to</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center">
            <Image 
                src="/favicon/favicon.ico" 
                width={48} 
                height={48} 
                alt="Premier League Logo" 
                className="object-contain w-12 h-12 md:w-16 md:h-16" 
            />
          </div>
          <div className="flex flex-col items-start justify-center space-y-[-1px] md:space-y-[-5px]">
            <p className="text-md sm:text-lg md:text-xl lg:text-xl font-bold leading-none">Premier League</p>
            <p className="text-sm sm:text-md md:text-lg lg:text-lg text-purple-600 font-bold leading-none">Predictions</p>
          </div>
        </div>
        
        </div>
        <p className="text-amber-600 text-sm sm:text-md md:text-md text-center max-w-md">
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
      <div className="mx-auto px-4 rounded-lg bg-slate-200">
        <p className="sm:text-[6px] md:text-lg font-bold">Points System</p>
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
