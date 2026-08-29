import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import GroupsContent from '@/features/groups/components/GroupsContent';

export default async function GroupsPage() {
  return withAuthPage(async () => <GroupsContent />);
}
