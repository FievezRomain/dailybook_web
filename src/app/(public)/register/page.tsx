import RegisterForm from './RegisterForm';
import { withGuestPage } from '@/lib/auth/server/withGuestPage';

export default async function RegisterPage() {
  return withGuestPage(async () => {
    return <RegisterForm />;
  });
}
