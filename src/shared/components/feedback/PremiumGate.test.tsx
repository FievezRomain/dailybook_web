import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PremiumDialogProvider, PremiumNotice } from './PremiumGate';

vi.mock('@/features/user/hooks/use-current-user', () => ({
  useCurrentUser: () => ({ refetch: vi.fn() }),
}));

describe('PremiumGate', () => {
  it('conserve la fonction visible et redirige vers la version Premium', () => {
    render(<PremiumDialogProvider><PremiumNotice feature="medicalDocuments" /></PremiumDialogProvider>);

    expect(screen.getByRole('complementary', { name: 'Documents médicaux · Premium' })).toBeVisible();
    const upgrade = screen.getByRole('link', { name: 'Passer en Premium' });
    expect(upgrade).toHaveAttribute('href', 'https://www.vascoandco.fr/produit/vasco-premium/');
    expect(upgrade).toHaveAttribute('target', '_blank');
    expect(upgrade).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
