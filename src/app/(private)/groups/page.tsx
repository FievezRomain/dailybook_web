import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import GroupsContent from '@/features/groups/components/GroupsContent';

export default async function GroupsPage({ searchParams }: { searchParams: Promise<{ create?: string }> }) {
  const { create } = await searchParams;
  return withAuthPage(async () => <GroupsContent key={create === '1' ? 'create' : 'list'} startCreating={create === '1'} />);
}
