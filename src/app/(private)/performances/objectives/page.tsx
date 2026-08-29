import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import ObjectivesContent from '@/features/objectives/components/ObjectivesContent';

export default async function ObjectifsPage() {
        return withAuthPage(async () => {
                return <ObjectivesContent />;
        });
}
