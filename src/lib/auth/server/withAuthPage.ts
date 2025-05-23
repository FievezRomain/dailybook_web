import { redirect } from 'next/navigation';
import { getCurrentUser } from './getCurrentUser';

export async function withAuthPage<T>(
  callback: (user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) => Promise<T>
): Promise<T> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return callback(user);
}

