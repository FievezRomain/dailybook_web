import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import AnimalsContent from '@/features/animals/components/AnimalsContent';

export default async function AnimalsPage() {
        return withAuthPage(async () => {
                return <AnimalsContent />;
        });
}
