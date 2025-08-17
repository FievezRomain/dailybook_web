'use client';

import { createContext, useContext } from "react";
import useSWR from "swr";
import { Note } from "@/types/note";
import * as noteService from "@/services/notes";
import * as Sentry from "@sentry/react";

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

const fetcher = async () => {
  return await noteService.getNotes();
};

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR("/api/notes", fetcher);

  const notes: Note[] | undefined = data;

  const addNote = async (note: Partial<Note>) => {
    try {
      await noteService.addNote(note as any);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la création de la note");
    }
  };

  const updateNote = async (id: string, note: Partial<Note>) => {
    try {
      await noteService.updateNote(id, note);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la modification de la note");
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await noteService.deleteNote(id);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la suppression de la note");
    }
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