import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import { getEvents } from '@/api/events';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/constants/cookies';
import CalendarContent from './CalendarContent';

export default async function DashboardPage() {
        return withAuthPage(async (user) => {
                const cookiesStore = await cookies();
                const token = cookiesStore.get(SESSION_COOKIE_NAME)?.value;

                if (!token) throw new Error('Token manquant');

                const events = token ? await getEvents(token) : [];

                return <CalendarContent email={user.email!} initialEvents={events} token={token} />;
        });
}