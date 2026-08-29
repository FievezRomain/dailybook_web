import { z } from 'zod';
import { contactSchema, createContactSchema, updateContactSchema } from '../schemas/contact';

export type Contact = z.infer<typeof contactSchema>;
export type CreateContactInput = z.input<typeof createContactSchema>;
export type UpdateContactInput = z.input<typeof updateContactSchema>;
