'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function updateAccessCode(userId: number, newCode: string) {
  if (!newCode || newCode.length < 6) {
    return { error: 'Access code must be at least 6 characters long.' };
  }

  try {
    await db.update(users).set({ accessCode: newCode }).where(eq(users.id, userId));
    revalidatePath('/admin');
    return { success: 'Access code updated successfully.' };
  } catch (error) {
    console.error('Error updating access code:', error);
    return { error: 'An unexpected error occurred.' };
  }
}
