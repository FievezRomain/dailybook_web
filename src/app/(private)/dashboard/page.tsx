import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import DashboardContent from './DashboardContent';

export default async function DashboardPage() {
  return withAuthPage(async (user) => {
    return <DashboardContent />;
  });
}
