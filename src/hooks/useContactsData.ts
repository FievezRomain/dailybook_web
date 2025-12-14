import useSWR from "swr";
import * as contactService from "@/services/contacts";
import { Contact } from "@/types/contact";

export function useContactsData() {
  const { data, error, isLoading, mutate } = useSWR<Contact[]>("/api/contacts", contactService.getContacts);

  return {
    contacts: data,
    isLoading,
    isError: error,
    mutate,
  };
}