import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import WishesContent from '@/features/wishes/components/WishesContent';

export default async function WishesPage({ searchParams }: { searchParams: Promise<{ create?: string }> }) {
  const { create } = await searchParams;
  return withAuthPage(async () => <WishesContent key={create === '1' ? 'create' : 'list'} startCreating={create === '1'} />);
}
