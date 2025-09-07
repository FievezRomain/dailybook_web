'use client';

import { createContext, useContext } from "react";
import { useNotesData } from "@/hooks/useNotesData";
import * as noteService from "@/services/notes";
import * as Sentry from "@sentry/react";
import { Note } from "@/types/note";

type NoteContextType = {
  notes: Note[] | undefined;
  isLoading: boolean;
  isError: any;
  addNote: (note: Partial<Note>) => Promise<void>;
  updateNote: (id: number, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  refresh: () => void;
};

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const { notes, isLoading, isError, mutate } = useNotesData();

  const addNote = async (note: Partial<Note>) => {
    try {
      await noteService.addNote(note);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la création de la note");
    }
  };

  const updateNote = async (id: number, note: Partial<Note>) => {
    try {
      await noteService.updateNote(id, note);
      await mutate();
    } catch (err: any) {
      Sentry.captureException(err);
      throw new Error(err?.message || "Erreur lors de la modification de la note");
    }
  };

  const deleteNote = async (id: number) => {
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
        isError,
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