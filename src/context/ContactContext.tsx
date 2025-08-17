'use client';

import { createContext, useContext } from "react";
import useSWR from "swr";
import { Contact } from "@/types/contact";
import * as contactService from "@/services/contacts";
import * as Sentry from "@sentry/react";

type ContactContextType = {
  contacts: Contact[] | undefined;
  isLoading: boolean;
  isError: any;
  addContact: (contact: Partial<Contact>) => Promise<void>;
  updateContact: (id: string, contact: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  refresh: () => void;
};

const ContactContext = createContext<ContactContextType | undefined>(undefined);

const fetcher = async () => {
  return await contactService.getContacts();
};

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR("/api/contacts", fetcher);

  const contacts: Contact[] | undefined = data;

  const addContact = async (contact: Partial<Contact>) => {
    try {
      await contactService.addContact(contact as any);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la création du contact");
    }
  };

  const updateContact = async (id: string, contact: Partial<Contact>) => {
    try {
      await contactService.updateContact(id, contact);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la modification du contact");
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await contactService.deleteContact(id);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la suppression du contact");
    }
  };

  const refresh = () => mutate();

  return (
    <ContactContext.Provider
      value={{
        contacts,
        isLoading,
        isError: error,
        addContact,
        updateContact,
        deleteContact,
        refresh,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
}

export function useContacts() {
  const ctx = useContext(ContactContext);
  if (!ctx) throw new Error("useContacts must be used within ContactProvider");
  return ctx;
}