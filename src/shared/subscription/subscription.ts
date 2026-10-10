export const FREE_ANIMAL_LIMIT = 3;

export type Subscription = 'Free' | 'Premium' | 'Pioneer';

export function isPremiumSubscription(subscription?: Subscription) {
  return subscription === 'Premium';
}

export function isPioneerSubscription(subscription?: Subscription) {
  return subscription === 'Pioneer';
}

export function hasUnlimitedAnimals(subscription?: Subscription) {
  return isPremiumSubscription(subscription) || isPioneerSubscription(subscription);
}

export function canCreateAnimal(subscription: Subscription | undefined, ownedAnimalCount: number) {
  return hasUnlimitedAnimals(subscription) || ownedAnimalCount < FREE_ANIMAL_LIMIT;
}

export function getSubscriptionLabel(subscription?: Subscription) {
  if (subscription === 'Premium') return 'Premium';
  if (subscription === 'Pioneer') return 'Pionnier';
  return 'Gratuit';
}
