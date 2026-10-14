import { describe, expect, it } from 'vitest';

import { createContactSchema } from '@/features/contacts/schemas/contact';
import { createEventSchema, patchEventSchema } from '@/features/events/schemas/event';
import { createGroupSchema, inviteMembersSchema } from '@/features/groups/schemas/group';
import { createNoteSchema } from '@/features/notes/schemas/note';
import { createObjectiveSchema } from '@/features/objectives/schemas/objective';
import { openUserSessionSchema, updateCurrentUserSchema } from '@/features/user/schemas/user';
import { createWishSchema } from '@/features/wishes/schemas/wish';
import { STORAGE_TEXT_LIMITS } from '@/shared/constants/storage-limits';

describe('database-aligned storage limits', () => {
  it('uses the same group limits on every client', () => {
    expect(createGroupSchema.safeParse({
      name: 'a'.repeat(STORAGE_TEXT_LIMITS.groupName),
      informations: 'a'.repeat(STORAGE_TEXT_LIMITS.groupInformation),
    }).success).toBe(true);
    expect(createGroupSchema.safeParse({ name: 'a'.repeat(STORAGE_TEXT_LIMITS.groupName + 1) }).success).toBe(false);
    expect(createGroupSchema.safeParse({ name: 'Groupe', informations: 'a'.repeat(STORAGE_TEXT_LIMITS.groupInformation + 1) }).success).toBe(false);
  });

  it('aligns contacts, notes and wishes with varchar(50)', () => {
    expect(createContactSchema.safeParse({ nom: 'a'.repeat(50), email_contact: `${'a'.repeat(38)}@example.com` }).success).toBe(true);
    expect(createContactSchema.safeParse({ nom: 'a'.repeat(51) }).success).toBe(false);
    expect(createContactSchema.safeParse({ nom: 'Alice', email_contact: `${'a'.repeat(39)}@example.com` }).success).toBe(false);
    expect(createNoteSchema.safeParse({ titre: 'a'.repeat(50) }).success).toBe(true);
    expect(createNoteSchema.safeParse({ titre: 'a'.repeat(51) }).success).toBe(false);
    expect(createWishSchema.safeParse({ nom: 'a'.repeat(50), destinataire: 'a'.repeat(50) }).success).toBe(true);
    expect(createWishSchema.safeParse({ nom: 'a'.repeat(51) }).success).toBe(false);
  });

  it('aligns objectives with varchar(200) and varchar(100)', () => {
    const base = { sousetapes: [{ etape: 'Étape' }] };
    expect(createObjectiveSchema.safeParse({ ...base, title: 'a'.repeat(200), temporalityobjectif: 'a'.repeat(100) }).success).toBe(true);
    expect(createObjectiveSchema.safeParse({ ...base, title: 'a'.repeat(201) }).success).toBe(false);
    expect(createObjectiveSchema.safeParse({ ...base, title: 'Objectif', temporalityobjectif: 'a'.repeat(101) }).success).toBe(false);
  });

  it.each([
    ['nom', STORAGE_TEXT_LIMITS.eventName],
    ['lieu', STORAGE_TEXT_LIMITS.eventText],
    ['specialiste', STORAGE_TEXT_LIMITS.eventText],
    ['categoriedepense', STORAGE_TEXT_LIMITS.eventCategory],
    ['discipline', STORAGE_TEXT_LIMITS.eventText],
    ['epreuve', STORAGE_TEXT_LIMITS.eventText],
    ['dossart', STORAGE_TEXT_LIMITS.eventText],
    ['placement', STORAGE_TEXT_LIMITS.eventText],
    ['traitement', STORAGE_TEXT_LIMITS.eventText],
    ['state', STORAGE_TEXT_LIMITS.eventState],
    ['frequencetype', STORAGE_TEXT_LIMITS.eventState],
    ['frequencevalue', STORAGE_TEXT_LIMITS.eventState],
  ] as const)('aligns event %s with its persisted limit', (field, maximum) => {
    const base = { nom: 'Événement', dateevent: '2026-10-14', animaux: [1], eventtype: 'autre' };
    expect(createEventSchema.safeParse({ ...base, [field]: 'a'.repeat(maximum) }).success).toBe(true);
    expect(createEventSchema.safeParse({ ...base, [field]: 'a'.repeat(maximum + 1) }).success).toBe(false);
  });

  it('aligns partial events and account identities', () => {
    expect(patchEventSchema.safeParse({ state: 'a'.repeat(20), placement: 'a'.repeat(100) }).success).toBe(true);
    expect(patchEventSchema.safeParse({ state: 'a'.repeat(21) }).success).toBe(false);
    expect(openUserSessionSchema.safeParse({ firstName: 'a'.repeat(20), expotoken: 'a'.repeat(100) }).success).toBe(true);
    expect(openUserSessionSchema.safeParse({ firstName: 'a'.repeat(21) }).success).toBe(false);
    expect(updateCurrentUserSchema.safeParse({ prenom: 'a'.repeat(20) }).success).toBe(true);
    expect(updateCurrentUserSchema.safeParse({ prenom: 'a'.repeat(21) }).success).toBe(false);
    expect(inviteMembersSchema.safeParse({ members: [`${'a'.repeat(64)}@example-long.fr`] }).success).toBe(true);
    expect(inviteMembersSchema.safeParse({ members: [`${'a'.repeat(64)}@example-long.com`] }).success).toBe(false);
  });
});
