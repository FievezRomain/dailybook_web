import { describe, expect, it } from 'vitest';

import type { Objective } from '../types/objective';
import { filterInProgress, isObjectiveCompleted, isObjectiveExpired, isObjectiveInProgress } from './objectives';

function objective(datefin: string | undefined, states: boolean[]) {
  return {
    id: 1,
    title: 'Progression',
    animaux: [],
    datefin,
    sousetapes: states.map((state, index) => ({ id: index + 1, etape: `Étape ${index + 1}`, state, order: index + 1 })),
  } as Objective;
}

describe('objective business status', () => {
  const today = new Date(2026, 9, 7, 12);

  it('keeps an objective active only while a step remains and its end date is not past', () => {
    expect(isObjectiveInProgress(objective('2026-10-07', [true, false]), today)).toBe(true);
    expect(isObjectiveInProgress(objective('2026-10-08', [false]), today)).toBe(true);
    expect(isObjectiveInProgress(objective('2026-10-06', [false]), today)).toBe(false);
    expect(isObjectiveInProgress(objective('2026-10-08', [true]), today)).toBe(false);
  });

  it('distinguishes completed and expired objectives', () => {
    expect(isObjectiveCompleted(objective('2026-10-06', [true, true]))).toBe(true);
    expect(isObjectiveExpired(objective('2026-10-06', [true, false]), today)).toBe(true);
    expect(filterInProgress([
      objective('2026-10-06', [false]),
      { ...objective('2026-10-08', [false]), id: 2 },
    ], today).map(({ id }) => id)).toEqual([2]);
  });
});
