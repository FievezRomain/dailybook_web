import useSWR from "swr";
import * as noteService from "@/services/notes";
import { Note } from "@/types/note";

export function useNotesData() {
  const { data, error, isLoading, mutate } = useSWR<Note[]>("/api/notes", noteService.getNotes);

  return {
    notes: data,
    isLoading,
    isError: error,
    mutate,
  };
}