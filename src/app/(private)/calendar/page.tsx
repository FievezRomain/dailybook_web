import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import CalendarContent from './CalendarContent';

export default async function DashboardPage() {
        return withAuthPage(async (user) => {
                return <CalendarContent />;
        });
}