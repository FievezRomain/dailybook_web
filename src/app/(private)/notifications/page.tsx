import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import NotificationsContent from '@/features/notifications/components/NotificationsContent';

export default async function NotificationsPage() {
  return withAuthPage(async () => <NotificationsContent />);
}
