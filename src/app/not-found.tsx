import { getCurrentUser } from 'lib/auth/server/getCurrentUser';
import ResponsiveAppBar from "@/components/ResponsiveAppBar";
import NotFoundContent from '@/components/NotFoundContent';

export default async function NotFound(){
    const user = await getCurrentUser();
    if (user) {
        return (
            <div>
                <ResponsiveAppBar/>
                <NotFoundContent/>
        </div>
        )
    } else {
        return (
            <NotFoundContent/>
        );
    }

}