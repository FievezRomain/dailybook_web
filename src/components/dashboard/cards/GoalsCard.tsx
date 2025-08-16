"use client";

import { getObjectifs } from "@/services/objectifs";
import { ObjectiveList } from "@/components/objectives/ObjectiveList";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Objectifs } from "@/types/objectifs";
import { filterInProgress } from "@/utils/goalsUtils";
import useSWR from "swr";

type Props = {
    height?: number;
};

const GoalsCard = ({ height = 4 }: Props) => {
    const { data: goals, isLoading: isLoadingGoals } = useSWR(['objectifs'], () => getObjectifs());
    const rowHeightPx = 30;
    const computedMaxHeight = height * rowHeightPx;

    const goalsFiltered = filterInProgress(goals || []);

    return (
        <Card className="h-full overflow-hidden">
            <CardHeader className="text-lg font-semibold">Objectifs</CardHeader>
            <CardContent className="space-y-2 overflow-y-auto pr-2" style={{ maxHeight: `${computedMaxHeight - 60}px` }}>
                {isLoadingGoals ? (
                    <>
                        {[...Array(2)].map((_, index) => (
                            <div key={index} className="flex flex-col space-y-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        ))}
                    </>
                ) : (
                    goalsFiltered.length === 0 ? (
                        <p className="text-muted-foreground">Aucun objectif en cours</p>
                    ) : (
                        <ObjectiveList objectives={goalsFiltered} />
                    )

                )
                }
            </CardContent>
        </Card>
    );
}

export default GoalsCard;
