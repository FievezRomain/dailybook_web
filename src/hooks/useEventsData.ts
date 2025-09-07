import useSWR from "swr";
import * as eventService from "@/services/events";
import { Event } from "@/types/event";

export function useEventsData() {
  const { data, error, isLoading, mutate } = useSWR<Event[]>("/api/events", eventService.getEvents);

  return {
    events: data,
    isLoading,
    isError: error,
    mutate,
  };
}