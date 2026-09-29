import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import StatisticsContent from '@/features/statistics/components/StatisticsContent';

export default async function StatisticsPage() {
  return withAuthPage(async () => <StatisticsContent />);
}
