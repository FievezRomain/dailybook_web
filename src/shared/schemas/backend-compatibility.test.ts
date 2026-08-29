import { describe, expect, it } from 'vitest';
import { animalSchema } from '@/features/animals/schemas/animal';
import { eventSchema } from '@/features/events/schemas/event';
import { groupSchema } from '@/features/groups/schemas/group';
import { objectiveSchema } from '@/features/objectives/schemas/objective';
import { storedFilenameSchema } from './file';

describe('compatibilité des lectures backend', () => {
  it('normalise les valeurs historiques sans assouplir les mutations', () => {
    const event = eventSchema.parse({
      id: 1,
      nom: 'Visite',
      dateevent: '2026-08-25',
      eventtype: 'medical',
      state: 'planned',
      documents: [{ name: '1720000000000_compte rendu.pdf' }],
      shared_groups: null,
    });
    expect(event.shared_groups).toEqual([]);
    expect(event.documents[0].name).toBe('1720000000000_compte rendu.pdf');

    expect(animalSchema.parse({ id: 1, provenance: 'owner', image: 'ancien_portrait.jpg' }).image)
      .toBe('ancien_portrait.jpg');

    const objective = objectiveSchema.parse({
      id: 1,
      title: 'Progresser',
      datedebut: '2026-08-25T00:00:00',
      datefin: '2026-09-25 00:00:00',
    });
    expect(objective.datedebut).toBe('2026-08-25');
    expect(objective.datefin).toBe('2026-09-25');

    expect(groupSchema.parse({
      id: 1,
      name: 'Écurie',
      nb_members: 1,
      created_at: '2026-08-25T10:30:00.123456',
      data: { animals: [], members: [] },
    }).created_at).toBe('2026-08-25T10:30:00.123456');
  });

  it.each(['../secret.pdf', 'folder/file.pdf', 'folder\\file.pdf', '\u0000payload.jpg'])
  ('refuse un nom de fichier dangereux: %s', (filename) => {
    expect(() => storedFilenameSchema.parse(filename)).toThrow();
  });
});
