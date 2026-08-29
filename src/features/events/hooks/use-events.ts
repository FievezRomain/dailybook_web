'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEvent, deleteEvent, getEventHighlights, getEvents, patchEvent, updateEvent,
} from '../api/events-api';
import type {
  CreateEventInput, PatchEventInput, RecurrenceScope, UpdateEventInput,
} from '../types/event';

export const eventsQueryKey = ['events'] as const;
export const eventHighlightsQueryKey = (year: number) => ['events', 'highlights', year] as const;

export function useEventsQuery() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: eventsQueryKey, queryFn: getEvents, staleTime: 30_000 });
  const setEvents = (events: Awaited<ReturnType<typeof getEvents>>) => queryClient.setQueryData(eventsQueryKey, events);
  const create = useMutation({ mutationFn: createEvent, onSuccess: setEvents });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateEventInput }) => updateEvent(id, input), onSuccess: setEvents,
  });
  const patch = useMutation({
    mutationFn: ({ id, input }: { id: number; input: PatchEventInput }) => patchEvent(id, input), onSuccess: setEvents,
  });
  const remove = useMutation({
    mutationFn: ({ id, scope }: { id: number; scope?: RecurrenceScope }) => deleteEvent(id, scope), onSuccess: setEvents,
  });

  return {
    events: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    createEvent: (input: CreateEventInput) => create.mutateAsync(input),
    updateEvent: (id: number, input: UpdateEventInput) => update.mutateAsync({ id, input }),
    patchEvent: (id: number, input: PatchEventInput) => patch.mutateAsync({ id, input }),
    deleteEvent: (id: number, scope?: RecurrenceScope) => remove.mutateAsync({ id, scope }),
    refetch: query.refetch,
    isMutating: create.isPending || update.isPending || patch.isPending || remove.isPending,
  };
}

export function useEventHighlights(year: number) {
  return useQuery({
    queryKey: eventHighlightsQueryKey(year),
    queryFn: () => getEventHighlights(year),
    staleTime: 5 * 60_000,
  });
}
