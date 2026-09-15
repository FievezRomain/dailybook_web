import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PremiumDialogProvider, PremiumNotice } from './PremiumGate';

vi.mock('@/features/user/hooks/use-current-user', () => ({
  useCurrentUser: () => ({ refetch: vi.fn() }),
}));

describe('PremiumGate', () => {
  it('conserve la fonction visible et ouvre une explication puis le comparatif', () => {
    render(<PremiumDialogProvider><PremiumNotice feature="medicalDocuments" /></PremiumDialogProvider>);

    expect(screen.getByRole('complementary', { name: 'Documents médicaux · Premium' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Découvrir Premium' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('L’historique de santé reste consultable');

    fireEvent.click(screen.getByRole('button', { name: 'Comparer les offres' }));
    expect(screen.getByLabelText('Comparatif des abonnements')).toHaveTextContent('Partage d’équipe');
    expect(screen.getByRole('link', { name: 'Voir mon abonnement' })).toHaveAttribute('href', '/profile');
  });
});
