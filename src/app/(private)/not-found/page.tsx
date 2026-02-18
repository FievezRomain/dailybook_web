import { withAuthPage } from '@/lib/auth/server/withAuthPage';
import NotFoundContent from './NotFoundContent';

export default function NotFoundPage(){
    return withAuthPage(async (user)=>{
        return <NotFoundContent/>;
    }
    );
}