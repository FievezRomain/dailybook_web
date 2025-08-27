import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import CalendarContent from './CalendarContent';

export default async function CalendarPage() {
        return withAuthPage(async (user) => {
                return <CalendarContent />;
        });
}