import useSWR from "swr";
import * as groupService from "@/services/groups";
import { Group } from "@/types/group";

export function useGroupsData() {
  const { data, error, isLoading, mutate } = useSWR<Group[]>("/api/groups", groupService.getGroups);

  return {
    groups: data,
    isLoading,
    isError: error,
    mutate,
  };
}