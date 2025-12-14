import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import ProfilContent from './ProfilContent';

export default async function ProfilPage() {
        return withAuthPage(async (user) => {
                return <ProfilContent />;
        });
}
