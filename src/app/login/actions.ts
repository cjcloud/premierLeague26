"use server";

import { db } from '@/db';
import { users } from '@/db/schema';
import { getSession } from '@/lib/session';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function login(
  prevState: { error: string } | void | undefined,
  formData: FormData
): Promise<{ error: string } | void> {
  const code = formData.get('code') as string;

  if (!code || code.length === 0) {
    return { error: 'Access code cannot be empty.' };
  }

  let foundUser;
  try {
    foundUser = await db.query.users.findFirst({
      where: eq(users.accessCode, code),
    });
  } catch (error) {
    console.error('Database error during login:', error);
    return { error: 'A database error occurred. Please try again.' };
  }

  if (!foundUser) {
    return { error: 'Invalid access code. Please try again.' };
  }

  try {
    const session = await getSession();
    session.isLoggedIn = true;
    session.id = foundUser.id;
    session.name = foundUser.name;
    session.isAdmin = foundUser.isAdmin === 1;
    await session.save();
  } catch (error) {
    console.error('Session error during login:', error);
    return { error: 'A session error occurred. Please try again.' };
  }

  redirect('/');
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect('/login');
}
