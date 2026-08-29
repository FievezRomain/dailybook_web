'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContact, deleteContact, getContacts, updateContact } from '../api/contacts-api';
import type { Contact, CreateContactInput, UpdateContactInput } from '../types/contact';

export const contactsQueryKey = ['contacts'] as const;

export function useContactsQuery() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: contactsQueryKey, queryFn: getContacts, staleTime: 30_000 });
  const create = useMutation({
    mutationFn: createContact,
    onSuccess: (contact) => queryClient.setQueryData<Contact[]>(contactsQueryKey, (current = []) => [...current, contact]),
  });
  const update = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateContactInput }) => updateContact(id, input),
    onSuccess: (contact) => queryClient.setQueryData<Contact[]>(
      contactsQueryKey,
      (current = []) => current.map((item) => item.id === contact.id ? contact : item),
    ),
  });
  const remove = useMutation({
    mutationFn: deleteContact,
    onSuccess: (_result, id) => queryClient.setQueryData<Contact[]>(
      contactsQueryKey,
      (current = []) => current.filter((contact) => contact.id !== id),
    ),
  });

  return {
    contacts: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    createContact: (input: CreateContactInput) => create.mutateAsync(input),
    updateContact: (id: number, input: UpdateContactInput) => update.mutateAsync({ id, input }),
    deleteContact: (id: number) => remove.mutateAsync(id),
    refetch: query.refetch,
    isMutating: create.isPending || update.isPending || remove.isPending,
  };
}
