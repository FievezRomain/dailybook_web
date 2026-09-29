import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import ProfileContent from '@/features/user/components/ProfileContent';

export default async function ProfilePage() {
  return withAuthPage(async () => <ProfileContent />);
}
