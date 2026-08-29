"use client";

import { EventList } from "@/features/events/components/EventList";
import { Card, CardHeader, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useEventsQuery } from "@/features/events/hooks/use-events";
import { filterToday } from "@/features/events/utils/events";

type Props = {
  height?: number;
};

const TodayTasksCard = ({ height = 4 }: Props) => {
  const { events, isLoading: isLoadingEvents } = useEventsQuery();
  const rowHeightPx = 30;
  const computedMaxHeight = height * rowHeightPx;

  const eventsFiltered = filterToday(events || []);

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="text-lg font-semibold">Aujourd’hui</CardHeader>
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

export default TodayTasksCard;
