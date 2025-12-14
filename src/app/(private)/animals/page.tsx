import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import AnimalsContent from './AnimalsContent';

export default async function AnimalsPage() {
        return withAuthPage(async (user) => {
                return <AnimalsContent />;
        });
}