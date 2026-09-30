'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEvent, deleteEvent, getEventHighlights, getEvents, patchEvent, updateEvent,
} from '../api/events-api';
import type { EventListQuery } from '../api/events-api';
import type {
  CreateEventInput, PatchEventInput, RecurrenceScope, UpdateEventInput,
} from '../types/event';

export const eventsQueryKey = ['events'] as const;
export const eventListQueryKey = (filters: EventListQuery = {}) => [...eventsQueryKey, 'list', filters] as const;
export const eventHighlightsQueryKey = (year: number) => ['events', 'highlights', year] as const;

export function useEventsQuery(filters: EventListQuery = {}, enabled = true) {
  const queryClient = useQueryClient();
  const queryKey = eventListQueryKey(filters);
  const query = useQuery({ queryKey, queryFn: () => getEvents(filters), staleTime: 30_000, enabled });
  const refreshEventLists = () => queryClient.invalidateQueries({ queryKey: eventsQueryKey });
  const create = useMutation({ mutationFn: createEvent, onSuccess: refreshEventLists });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateEventInput }) => updateEvent(id, input), onSuccess: refreshEventLists,
  });
  const patch = useMutation({
    mutationFn: ({ id, input }: { id: number; input: PatchEventInput }) => patchEvent(id, input), onSuccess: refreshEventLists,
  });
  const remove = useMutation({
    mutationFn: ({ id, scope }: { id: number; scope?: RecurrenceScope }) => deleteEvent(id, scope), onSuccess: refreshEventLists,
  });

  return {
    events: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    isRefetchError: query.isRefetchError,
    error: query.error,
    createEvent: (input: CreateEventInput) => create.mutateAsync(input),
    updateEvent: (id: number, input: UpdateEventInput) => update.mutateAsync({ id, input }),
    patchEvent: (id: number, input: PatchEventInput) => patch.mutateAsync({ id, input }),
    deleteEvent: (id: number, scope?: RecurrenceScope) => remove.mutateAsync({ id, scope }),
    refetch: query.refetch,
    refreshEventLists,
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
