'use client';

import { Card, CardContent } from '@/shared/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCurrentUser } from '@/features/user/hooks/use-current-user';

const WelcomeCard = () => {
    const today = format(new Date(), 'EEEE d MMMM yyyy', { locale: fr });
    const formattedToday = today.charAt(0).toUpperCase() + today.slice(1);
    const { user, isLoading, isError } = useCurrentUser();
    return (
        <Card className="h-full overflow-hidden">
            <CardContent className="p-6 h-full flex flex-col justify-between">
                <div className="flex justify-between gap-6 flex-col md:flex-row">
                    <div>
                        <h2 className="text-xl font-bold mb-2">Bienvenue {!isLoading && !isError && user && user.name} !</h2>
                        <p className="text-muted-foreground mb-4">{formattedToday}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default WelcomeCard;
