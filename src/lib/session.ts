import 'server-only';
import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

// This is the shape of our session data.
// You can add more properties here, but keep it minimal.
export type SessionData = {
  isLoggedIn?: boolean;
  id?: number;
  name?: string;
  isAdmin?: boolean;
}

// This is the iron-session wrapper around our session data.
export type Session = IronSession<SessionData>;

export const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'premier-league-preds-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export function getSession() {
  return getIronSession<SessionData>(cookies(), sessionOptions);
}
