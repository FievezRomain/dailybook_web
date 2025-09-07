import useSWR from "swr";
import * as wishService from "@/services/wishs";
import { Wish } from "@/types/wish";

export function useWishsData() {
  const { data, error, isLoading, mutate } = useSWR<Wish[]>("/api/wishs", wishService.getWishs);

  return {
    wishs: data,
    isLoading,
    isError: error,
    mutate,
  };
}