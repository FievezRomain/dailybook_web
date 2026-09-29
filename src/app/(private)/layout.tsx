import { PrivateLayout } from '@/shared/components/layout/PrivateLayout';
import { getCurrentUser } from '@/lib/auth/server/getCurrentUser';
import { redirect } from 'next/navigation';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <PrivateLayout>{children}</PrivateLayout>;
}
