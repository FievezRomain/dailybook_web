import { z } from 'zod';
import {
  createGroupSchema,
  deleteMemberSchema,
  groupAnimalSchema,
  groupSchema,
  invitationSchema,
  inviteMembersSchema,
  pendingAnimalShareSchema,
  proposeAnimalsSchema,
  respondAnimalShareSchema,
  respondInvitationSchema,
  updateGroupSchema,
} from '../schemas/group';

export type Group = z.infer<typeof groupSchema>;
export type GroupAnimal = z.infer<typeof groupAnimalSchema>;
export type GroupInvitation = z.infer<typeof invitationSchema>;
export type PendingAnimalShare = z.infer<typeof pendingAnimalShareSchema>;
export type CreateGroupInput = z.input<typeof createGroupSchema>;
export type UpdateGroupInput = z.input<typeof updateGroupSchema>;
export type InviteMembersInput = z.input<typeof inviteMembersSchema>;
export type RespondInvitationInput = z.input<typeof respondInvitationSchema>;
export type ProposeAnimalsInput = z.input<typeof proposeAnimalsSchema>;
export type RespondAnimalShareInput = z.input<typeof respondAnimalShareSchema>;
export type DeleteMemberInput = z.input<typeof deleteMemberSchema>;
