import type { ComponentType } from 'react';
import type { z } from 'zod';
import type {
  createEventSchema, eventHighlightSchema, eventSchema, patchEventSchema, recurrenceScopeSchema, updateEventSchema,
} from '../schemas/event';

export type Event = z.infer<typeof eventSchema>;
export type CreateEventInput = z.input<typeof createEventSchema>;
export type UpdateEventInput = z.input<typeof updateEventSchema>;
export type PatchEventInput = z.input<typeof patchEventSchema>;
export type RecurrenceScope = z.infer<typeof recurrenceScopeSchema>;
export type EventHighlight = z.infer<typeof eventHighlightSchema>;
export type MappedEvent = Event & {
  icon: ComponentType<{ className?: string }>;
  color: string;
  titleType: string;
  delay?: number;
};
