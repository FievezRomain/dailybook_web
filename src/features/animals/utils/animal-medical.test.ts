import { describe, expect, it } from 'vitest';
import type { Event } from '@/features/events/types/event';
import { getAnimalMedicalDocuments, getAnimalMedicalEvents } from './animal-medical';

function event(overrides: Partial<Event>): Event {
  return {
    id: 1,
    nom: 'Vaccin',
    dateevent: '2026-08-01',
    animaux: [4],
    eventtype: 'soins',
    state: 'Terminé',
    documents: [],
    shared_groups: [],
    todisplay: true,
    ...overrides,
  };
}

describe('dossier médical animal', () => {
  it('conserve seulement les racines soins/rdv affichables et les trie du plus récent au plus ancien', () => {
    const result = getAnimalMedicalEvents([
      event({ id: 1, dateevent: '2026-06-01' }),
      event({ id: 2, eventtype: 'rdv', dateevent: '2026-08-01', todisplay: undefined }),
      event({ id: 3, idparent: 1 }),
      event({ id: 4, todisplay: false }),
      event({ id: 5, eventtype: 'balade' }),
      event({ id: 6, animaux: [9] }),
    ], 4);

    expect(result.map(({ id }) => id)).toEqual([2, 1]);
  });

  it('rattache chaque document à son événement médical', () => {
    expect(getAnimalMedicalDocuments([
      event({ id: 7, nom: 'Radiographie', documents: [{ name: `${'a'.repeat(32)}.pdf` }] }),
    ])).toEqual([expect.objectContaining({ eventId: 7, eventName: 'Radiographie' })]);
  });
});
