import { Objectifs } from "@/types/objectifs";
import { isAfter, isEqual, startOfDay } from "date-fns";

export const filterInProgress = (goals: Objectifs[]) => {
    return goals.filter( (item) =>  item.sousEtapes.some(etape => etape.state === false) && 
          (
            isAfter( startOfDay(new Date(item.datefin)), startOfDay(new Date()) ) 
            ||
            isEqual( startOfDay(new Date(item.datefin)), startOfDay(new Date()) )
          ) 
    );
}