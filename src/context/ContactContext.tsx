'use client';

import { createContext, useContext } from "react";
import useSWR from "swr";
import { Contact } from "@/types/contact";

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

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR("/api/contacts", fetcher);

  const contacts: Contact[] | undefined = data;

  const addContact = async (contact: Partial<Contact>) => {
    await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
    });
    await mutate();
  };

  const updateContact = async (id: string, contact: Partial<Contact>) => {
    await fetch(`/api/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
    });
    await mutate();
  };

  const deleteContact = async (id: string) => {
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    await mutate();
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