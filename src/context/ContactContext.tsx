'use client';

import { createContext, useContext } from "react";
import { useContactsData } from "@/hooks/useContactsData";
import * as contactService from "@/services/contacts";
import * as Sentry from "@sentry/react";
import { Contact } from "@/types/contact";

type ContactContextType = {
  contacts: Contact[] | undefined;
  isLoading: boolean;
  isError: any;
  addContact: (contact: Partial<Contact>) => Promise<void>;
  updateContact: (id: number, contact: Partial<Contact>) => Promise<void>;
  deleteContact: (id: number) => Promise<void>;
  refresh: () => void;
};

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const { contacts, isLoading, isError, mutate } = useContactsData();

  const addContact = async (contact: Partial<Contact>) => {
    try {
      await contactService.addContact(contact);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la création du contact");
    }
  };

  const updateContact = async (id: number, contact: Partial<Contact>) => {
    try {
      await contactService.updateContact(id, contact);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la modification du contact");
    }
  };

  const deleteContact = async (id: number) => {
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
        isError,
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