import { withGuestPage } from '@/lib/auth/server/withGuestPage';
import LoginForm from './LoginForm';

export default async function LoginPage() {
  return withGuestPage(async () => {
    return <LoginForm />;
  });
}
