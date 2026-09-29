import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import CalendarContent from '@/features/events/components/CalendarContent';

export default async function CalendarPage() {
        return withAuthPage(async () => {
                return <CalendarContent />;
        });
}
