import { describe, expect, it } from 'vitest';

import { statisticsQueryKey } from './use-statistics';

describe('statisticsQueryKey', () => {
  it('produit la même clé quelle que soit l’ordre des animaux', () => {
    const dates = { dateDebut: '2026-01-01', dateFin: '2026-12-31' };

    expect(statisticsQueryKey('poids', { ...dates, animaux: [3, 1, 2] })).toEqual(
      statisticsQueryKey('poids', { ...dates, animaux: [1, 2, 3] }),
    );
  });
});
