import useSWR from "swr";
import * as objectiveService from "@/services/objectifs";
import { Objective } from "@/types/objective";

export function useObjectivesData() {
  const { data, error, isLoading, mutate } = useSWR<Objective[]>("/api/objectifs", objectiveService.getObjectifs);

  return {
    objectives: data,
    isLoading,
    isError: error,
    mutate,
  };
}