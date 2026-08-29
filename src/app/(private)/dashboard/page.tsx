import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import DashboardContent from '@/features/dashboard/components/DashboardContent';

export default async function DashboardPage() {
  return withAuthPage(async () => {
    return <DashboardContent />;
  });
}
