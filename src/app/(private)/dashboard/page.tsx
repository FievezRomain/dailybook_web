import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import DashboardContent from './DashboardContent';
import { getEvents } from '@/api/events';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/constants/cookies';

export default async function DashboardPage() {
  return withAuthPage(async (user) => {
    const cookiesStore = await cookies();
    const token = cookiesStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) throw new Error('Token manquant');

    const events = token ? await getEvents(token) : [];

    return <DashboardContent email={user.email!} initialEvents={events} token={token} />;
  });
}
