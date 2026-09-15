import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import ContactsContent from '@/features/contacts/components/ContactsContent';

export default async function ContactsPage({ searchParams }: { searchParams: Promise<{ create?: string }> }) {
  const { create } = await searchParams;
  return withAuthPage(async () => <ContactsContent key={create === '1' ? 'create' : 'list'} startCreating={create === '1'} />);
}
