'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createNote, deleteNote, getNotes, updateNote } from '../api/notes-api';
import type { CreateNoteInput, Note, UpdateNoteInput } from '../types/note';

export const notesQueryKey = ['notes'] as const;

export function useNotesQuery() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: notesQueryKey, queryFn: getNotes, staleTime: 30_000 });
  const create = useMutation({
    mutationFn: createNote,
    onSuccess: (note) => queryClient.setQueryData<Note[]>(notesQueryKey, (current = []) => [note, ...current]),
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateNoteInput }) => updateNote(id, input),
    onSuccess: (note) => queryClient.setQueryData<Note[]>(
      notesQueryKey,
      (current = []) => current.map((item) => item.id === note.id ? note : item),
    ),
  });
  const remove = useMutation({
    mutationFn: deleteNote,
    onSuccess: (_result, id) => queryClient.setQueryData<Note[]>(
      notesQueryKey,
      (current = []) => current.filter((note) => note.id !== id),
    ),
  });

  return {
    notes: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    createNote: (input: CreateNoteInput) => create.mutateAsync(input),
    updateNote: (id: number, input: UpdateNoteInput) => update.mutateAsync({ id, input }),
    deleteNote: (id: number) => remove.mutateAsync(id),
    refetch: query.refetch,
    isMutating: create.isPending || update.isPending || remove.isPending,
  };
}
