import { db } from '@/db';
import { teams } from '@/db/schema';

export const getTeams = async () => {
  const t = await db.select().from(teams);
  return t;
};
