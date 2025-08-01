'use client';

import { getEvents } from '@/api/events';
import { EventList } from '@/components/events/EventList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Event } from '@/types/event';
import { filterUpcoming } from '@/utils/eventsUtils';
import useSWR from 'swr';

type Props = {
    height?: number;
};

const UpcomingTasksCard = ({ height = 4 }: Props) => {
    const { data: events, isLoading: isLoadingEvents } = useSWR(['events'], () => getEvents());
    const rowHeightPx = 30;
    const computedMaxHeight = height * rowHeightPx;

    const tasks = [
        { title: 'Test', date: '25/07/2025' },
        { title: 'soins', date: '25/07/2025' },
    ];

    const eventsFiltered = filterUpcoming(events || []);

    return (
        <Card className="h-full overflow-hidden">
            <CardHeader className="text-lg font-semibold">
                <CardTitle>À venir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 overflow-y-auto pr-2" style={{ maxHeight: `${computedMaxHeight - 60}px` }}>
                {isLoadingEvents ? (
                    <>
                        {[...Array(2)].map((_, index) => (
                            <div key={index} className="flex flex-col space-y-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        ))}
                    </>
                    ) : (
                        <EventList events={eventsFiltered} />
                    )
                }
            </CardContent>
        </Card>
    );
}

export default UpcomingTasksCard;