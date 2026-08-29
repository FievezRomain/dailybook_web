import { z } from 'zod';
import { createNoteSchema, noteSchema, updateNoteSchema } from '../schemas/note';

export type Note = z.infer<typeof noteSchema>;
export type CreateNoteInput = z.input<typeof createNoteSchema>;
export type UpdateNoteInput = z.input<typeof updateNoteSchema>;
