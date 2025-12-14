import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import ObjectifsContent from './ObjectifsContent';

export default async function ObjectifsPage() {
        return withAuthPage(async (user) => {
                return <ObjectifsContent />;
        });
}
