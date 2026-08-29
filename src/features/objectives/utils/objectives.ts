import type { Objective } from "@/features/objectives/types/objective";
import { isAfter, isEqual, startOfDay } from "date-fns";

export const filterInProgress = (goals: Objective[]) => {
    return goals.filter( (item) =>  item.sousetapes.some(etape => etape.state === false) && 
          (!item.datefin ||
          (
            isAfter( startOfDay(new Date(item.datefin)), startOfDay(new Date()) ) 
            ||
            isEqual( startOfDay(new Date(item.datefin)), startOfDay(new Date()) )
          ))
    );
}
