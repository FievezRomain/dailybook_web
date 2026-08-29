import { z } from 'zod';

const positiveId = z.number().int().positive();
const optionalText = z.string().nullable().optional();
const statusSchema = z.enum(['accepted', 'declined']);

export const groupIdSchema = z.coerce.number().int().positive();

const groupAnimalSummarySchema = z.object({
  id: positiveId,
  nom: optionalText,
  espece: optionalText,
});

const pendingMemberSchema = z.object({ email: z.string().email() });
const acceptedMemberSchema = z.object({
  user_id: positiveId,
  email: z.string().email(),
  prenom: optionalText,
  role: z.enum(['manager', 'member']),
});

export const groupSchema = z.object({
  id: positiveId,
  name: z.string(),
  informations: optionalText,
  created_at: z.string().regex(/^\d{4}-\d{2}-\d{2}[T ][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/).nullable().optional(),
  nb_members: z.number().int().nonnegative(),
  nb_animaux: z.number().int().nonnegative().optional().default(0),
  data: z.object({
    animals: z.array(z.discriminatedUnion('type', [
      z.object({ type: z.literal('pending'), items: z.array(groupAnimalSummarySchema) }),
      z.object({ type: z.literal('accepted'), items: z.array(groupAnimalSummarySchema) }),
    ])),
    members: z.array(z.discriminatedUnion('type', [
      z.object({ type: z.literal('pending'), items: z.array(pendingMemberSchema) }),
      z.object({ type: z.literal('accepted'), items: z.array(acceptedMemberSchema) }),
    ])),
  }),
});

export const groupListSchema = z.array(groupSchema);

const groupFields = {
  name: z.string().trim().min(1).max(255),
  informations: z.string().trim().max(2_000).nullable().optional(),
} as const;

export const createGroupSchema = z.object(groupFields).strict();
export const updateGroupSchema = z.object(groupFields).strict();
export const inviteMembersSchema = z.object({
  members: z.array(z.string().trim().email().max(320)).min(1).max(50),
}).strict();

export const invitationSchema = z.object({
  id: positiveId,
  group_id: positiveId,
  email: z.string().email(),
  proposed_by: positiveId,
  status: z.literal('pending'),
  group_name: z.string(),
  proposed_by_name: optionalText,
});
export const invitationListSchema = z.array(invitationSchema);
export const respondInvitationSchema = z.object({
  status: statusSchema,
  email: z.string().trim().email().max(320).optional(),
}).strict();

export const proposeAnimalsSchema = z.object({
  animals: z.array(positiveId).min(1).max(100),
}).strict();

export const groupAnimalSchema = z.object({
  id: positiveId,
  nom: optionalText,
  espece: optionalText,
  race: optionalText,
  sexe: optionalText,
  image: optionalText,
  informations: optionalText,
}).passthrough();
export const groupAnimalListSchema = z.array(groupAnimalSchema);

export const pendingAnimalShareSchema = z.object({
  id: positiveId,
  group_id: positiveId,
  animal_id: positiveId,
  proposed_by: positiveId,
  status: z.literal('pending'),
  animal_name: z.string(),
  proposed_by_name: optionalText,
});
export const pendingAnimalShareListSchema = z.array(pendingAnimalShareSchema);
export const respondAnimalShareSchema = z.object({
  status: statusSchema,
  animaux: z.array(positiveId).max(100).optional(),
}).strict();

export const deleteMemberSchema = z.object({
  email: z.string().trim().email().max(320),
}).strict();

export const optionalGroupResponseSchema = z.union([groupSchema, z.object({}).strict(), z.null()])
  .transform((value) => value && 'id' in value ? value : null);
export const memberMutationResponseSchema = z.union([
  groupSchema,
  z.object({ message: z.string() }).strict(),
  z.null(),
]).transform((value) => value && 'id' in value ? value : null);
