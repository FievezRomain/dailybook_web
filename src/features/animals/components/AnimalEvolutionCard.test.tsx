import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AnimalEvolutionCard } from './AnimalEvolutionCard';

vi.mock('@/shared/components/feedback/PremiumGate', () => ({
  PremiumNotice: () => null,
  usePremiumGate: () => ({ handlePremiumError: vi.fn() }),
}));

vi.mock('@/features/animals/hooks/use-body-pictures', () => ({
  useBodyPictures: () => ({
    pictures: [],
    isLoading: false,
    error: null,
    addPicture: vi.fn(),
    deletePicture: vi.fn(),
    updatePictureUrl: vi.fn(),
    refetch: vi.fn(),
  }),
}));

describe('AnimalEvolutionCard', () => {
  it('masque l’état vide du suivi photo pour un compte gratuit', () => {
    render(<AnimalEvolutionCard idAnimal={12} isPremium={false} canEdit />);

    expect(screen.queryByText('Aucune photo de suivi')).not.toBeInTheDocument();
    expect(screen.queryByText(/Ajoutez une photo mensuelle/)).not.toBeInTheDocument();
  });

  it('conserve l’état vide du suivi photo pour un compte Premium', () => {
    render(<AnimalEvolutionCard idAnimal={12} isPremium canEdit />);

    expect(screen.getByText('Aucune photo de suivi')).toBeVisible();
    expect(screen.getByText(/Ajoutez une photo mensuelle/)).toBeVisible();
  });
});
