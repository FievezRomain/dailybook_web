import { describe, expect, it } from 'vitest';

import {
  ANIMAL_FOOD_MAX_LENGTH,
  ANIMAL_SHORT_TEXT_MAX_LENGTH,
  animalHistoryMutationSchema,
  createAnimalSchema,
} from './animal';

describe('animal mutation limits', () => {
  it.each(['nom', 'espece', 'race', 'sexe', 'couleur', 'nompere', 'nommere'] as const)(
    'accepts 50 characters and rejects 51 for %s',
    (field) => {
      expect(createAnimalSchema.safeParse({ [field]: 'a'.repeat(ANIMAL_SHORT_TEXT_MAX_LENGTH) }).success).toBe(true);
      expect(createAnimalSchema.safeParse({ [field]: 'a'.repeat(ANIMAL_SHORT_TEXT_MAX_LENGTH + 1) }).success).toBe(false);
    },
  );

  it('accepts 100 food characters and rejects 101', () => {
    expect(createAnimalSchema.safeParse({ food: 'a'.repeat(ANIMAL_FOOD_MAX_LENGTH) }).success).toBe(true);
    expect(createAnimalSchema.safeParse({ food: 'a'.repeat(ANIMAL_FOOD_MAX_LENGTH + 1) }).success).toBe(false);
    expect(animalHistoryMutationSchema.safeParse({ item: 'food', value: 'a'.repeat(ANIMAL_FOOD_MAX_LENGTH) }).success).toBe(true);
    expect(animalHistoryMutationSchema.safeParse({ item: 'food', value: 'a'.repeat(ANIMAL_FOOD_MAX_LENGTH + 1) }).success).toBe(false);
  });
});
