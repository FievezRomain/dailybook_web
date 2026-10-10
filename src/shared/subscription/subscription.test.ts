import { describe, expect, it } from 'vitest';
import {
  FREE_ANIMAL_LIMIT,
  canCreateAnimal,
  getSubscriptionLabel,
  hasUnlimitedAnimals,
  isPremiumSubscription,
} from './subscription';

describe('subscription', () => {
  it('limite Gratuit à trois animaux', () => {
    expect(FREE_ANIMAL_LIMIT).toBe(3);
    expect(canCreateAnimal('Free', 2)).toBe(true);
    expect(canCreateAnimal('Free', 3)).toBe(false);
  });

  it('accorde un quota illimité à Premium et Pioneer sans confondre leurs droits', () => {
    expect(hasUnlimitedAnimals('Premium')).toBe(true);
    expect(hasUnlimitedAnimals('Pioneer')).toBe(true);
    expect(canCreateAnimal('Pioneer', 20)).toBe(true);
    expect(isPremiumSubscription('Pioneer')).toBe(false);
    expect(getSubscriptionLabel('Pioneer')).toBe('Pionnier');
  });
});
