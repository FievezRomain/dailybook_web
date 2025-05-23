import { redirect } from 'next/navigation';
import { getCurrentUser } from './getCurrentUser';

export async function withGuestPage<T>(
  callback: () => Promise<T>
): Promise<T> {
  const user = await getCurrentUser();

  if (user) {
    redirect('/dashboard');
  }

  return callback();
}
