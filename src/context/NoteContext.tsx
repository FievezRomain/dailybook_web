'use client';

import { createContext, useContext } from "react";
import useSWR from "swr";
import { Note } from "@/types/note";

type NoteContextType = {
  notes: Note[] | undefined;
  isLoading: boolean;
  isError: any;
  addNote: (note: Partial<Note>) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  refresh: () => void;
};

const NoteContext = createContext<NoteContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR("/api/notes", fetcher);

  const notes: Note[] | undefined = data;

  const addNote = async (note: Partial<Note>) => {
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
    await mutate();
  };

  const updateNote = async (id: string, note: Partial<Note>) => {
    await fetch(`/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
    await mutate();
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    await mutate();
  };

  const refresh = () => mutate();

  return (
    <NoteContext.Provider
      value={{
        notes,
        isLoading,
        isError: error,
        addNote,
        updateNote,
        deleteNote,
        refresh,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NoteContext);
  if (!ctx) throw new Error("useNotes must be used within NoteProvider");
  return ctx;
}