import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StatisticsContent from './StatisticsContent';

const mocks = vi.hoisted(() => ({ currentUser: vi.fn(), animals: vi.fn(), statistics: vi.fn(), premiumError: vi.fn() }));
vi.mock('@/features/user/hooks/use-current-user', () => ({ useCurrentUser: mocks.currentUser }));
vi.mock('@/features/animals/hooks/use-animals', () => ({ useAnimalsQuery: mocks.animals }));
vi.mock('../hooks/use-statistics', () => ({ useStatisticsQuery: mocks.statistics }));
vi.mock('@/shared/components/feedback/PremiumGate', () => ({
  PremiumNotice: () => <div>Statistiques · Premium</div>,
  usePremiumGate: () => ({ handlePremiumError: mocks.premiumError }),
}));

describe('StatisticsContent', () => {
  beforeEach(() => {
    mocks.animals.mockReturnValue({ animals: [{ id: 4, nom: 'Vasco', provenance: 'owner' }], isLoading: false, isError: false, refetch: vi.fn() });
    mocks.statistics.mockReturnValue({ data: { statistic: [{ date: '2026-08-01', count: 2, events: [] }] }, isPending: false, isError: false, error: null, refetch: vi.fn() });
  });

  it('explique le gate sans masquer la destination à un compte Gratuit', () => {
    mocks.currentUser.mockReturnValue({ isPremium: false, isLoading: false });
    render(<StatisticsContent />);
    expect(screen.getAllByText('Statistiques · Premium').length).toBeGreaterThan(0);
  });

  it('calcule puis accompagne le résultat Premium de valeurs textuelles', () => {
    mocks.currentUser.mockReturnValue({ isPremium: true, isLoading: false });
    render(<StatisticsContent />);
    fireEvent.click(screen.getByRole('checkbox', { name: /Vasco/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Afficher les statistiques' }));
    expect(screen.getByText('01/08/2026')).toBeVisible();
    expect(screen.getByRole('table')).toHaveTextContent('2');
  });
});
