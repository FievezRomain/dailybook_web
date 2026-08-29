import { z } from 'zod';
import {
  createObjectiveSchema, objectiveSchema, objectiveSubtaskSchema, subtaskStateSchema, updateObjectiveSchema,
} from '../schemas/objective';

export type Objective = z.infer<typeof objectiveSchema>;
export type ObjectiveSubtask = z.infer<typeof objectiveSubtaskSchema>;
export type CreateObjectiveInput = z.input<typeof createObjectiveSchema>;
export type UpdateObjectiveInput = z.input<typeof updateObjectiveSchema>;
export type SubtaskStateInput = z.input<typeof subtaskStateSchema>;
