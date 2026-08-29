import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import NotesContent from '@/features/notes/components/NotesContent';

export default async function NotesPage({ searchParams }: { searchParams: Promise<{ create?: string }> }) {
  const { create } = await searchParams;
  return withAuthPage(async () => <NotesContent startCreating={create === '1'} />);
}
