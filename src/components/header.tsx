import { getSession } from '@/lib/session';
import Link from 'next/link';
import { logout } from '@/app/login/actions';
import { Button } from './ui/button';

export default async function Header() {
  const session = await getSession();

  return (
    <header className="bg-gray-100 dark:bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link href="/leaderboard">Premier League Predictions</Link>
        </h1>
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-4">
            <Link href="/leaderboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Leaderboard</Link>
            <Link href="/predictions" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Predictions</Link>
          </nav>
          {session.isLoggedIn ? (
            <form action={logout}>
              <Button variant="outline" size="sm">Logout</Button>
            </form>
          ) : (
            <Link href="/login">
              <Button variant="default" size="sm">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
