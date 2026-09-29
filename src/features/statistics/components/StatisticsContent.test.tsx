import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StatisticsContent from './StatisticsContent';

const mocks = vi.hoisted(() => ({ currentUser: vi.fn(), animals: vi.fn(), statistics: vi.fn(), premiumError: vi.fn(), openEvent: vi.fn() }));
const expenseEvent = {
  id: 8,
  nom: 'Achat de matériel',
  dateevent: '2026-08-01',
  animaux: [4],
  eventtype: 'depense',
  state: 'Terminé',
  depense: 45,
  categoriedepense: 'equipement',
  documents: [],
  shared_groups: [],
  todisplay: true,
};
vi.mock('@/features/user/hooks/use-current-user', () => ({ useCurrentUser: mocks.currentUser }));
vi.mock('@/features/animals/hooks/use-animals', () => ({ useAnimalsQuery: mocks.animals }));
vi.mock('../hooks/use-statistics', () => ({ useStatisticsQuery: mocks.statistics }));
vi.mock('@/features/events/context/event-drawer-context', () => ({ useEventDrawer: () => ({ openDrawer: mocks.openEvent }) }));
vi.mock('@/shared/components/feedback/PremiumGate', () => ({
  PremiumNotice: () => <div>Statistiques · Premium</div>,
  usePremiumGate: () => ({ handlePremiumError: mocks.premiumError }),
}));

describe('StatisticsContent', () => {
  beforeEach(() => {
    mocks.animals.mockReturnValue({ animals: [{ id: 4, nom: 'Vasco', provenance: 'owner' }], isLoading: false, isError: false, refetch: vi.fn(), updateAnimalImage: vi.fn() });
    mocks.statistics.mockReturnValue({ data: { statistic: [{ date: '2026-08-01', count: 2, events: [expenseEvent] }] }, isPending: false, isError: false, error: null, refetch: vi.fn() });
  });

  it('explique le gate sans masquer la destination à un compte Gratuit', () => {
    mocks.currentUser.mockReturnValue({ isPremium: false, isLoading: false });
    render(<StatisticsContent />);
    expect(screen.getAllByText('Statistiques · Premium').length).toBeGreaterThan(0);
  });

  it('calcule puis accompagne le résultat Premium de valeurs textuelles', () => {
    mocks.currentUser.mockReturnValue({ isPremium: true, isLoading: false });
    render(<StatisticsContent />);
    fireEvent.click(screen.getByRole('button', { name: 'Vasco' }));
    expect(screen.queryByRole('columnheader', { name: 'Date' })).not.toBeInTheDocument();
    expect(screen.getByRole('table')).toHaveTextContent('2');
    expect(screen.getByLabelText('Résumé des résultats')).toHaveTextContent('Dernière valeur');
    expect(screen.queryByRole('heading', { name: 'Achat de matériel' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Résultat' }));
    expect(screen.getByRole('heading', { name: 'Achat de matériel' })).toBeVisible();
  });

  it('sélectionne tous les animaux sans rendre le graphique indispensable', () => {
    mocks.currentUser.mockReturnValue({ isPremium: true, isLoading: false });
    mocks.animals.mockReturnValue({ animals: [{ id: 4, nom: 'Vasco', provenance: 'owner' }, { id: 5, nom: 'Moka', provenance: 'shared' }], isLoading: false, isError: false, refetch: vi.fn() });
    render(<StatisticsContent />);
    fireEvent.click(screen.getByRole('button', { name: 'Tous les animaux' }));
    expect(screen.getByRole('button', { name: 'Vasco' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Moka/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: 'Analyser la période' })).not.toBeInTheDocument();
  });

  it('affiche tous les indicateurs dans le même ordre que sur mobile', () => {
    mocks.currentUser.mockReturnValue({ isPremium: true, isLoading: false });
    render(<StatisticsContent />);

    expect(
      screen
        .getAllByRole('tab')
        .map((tab) => tab.getAttribute('aria-label')),
    ).toEqual([
      'Dépenses',
      'Alimentation',
      'Entraînements',
      'Concours',
      'Balades',
      'Poids',
      'Taille',
    ]);
    expect(document.querySelector('[data-icon-name="expense"]')).toHaveAttribute('data-icon-provider', 'material-community');
    expect(document.querySelector('[data-icon-name="food"]')).toHaveAttribute('data-icon-provider', 'material-community');
    expect(document.querySelector('[data-icon-name="training"]')).toHaveAttribute('data-icon-provider', 'material-community');
    expect(document.querySelector('[data-icon-name="trophy"]')).toHaveAttribute('data-icon-provider', 'material-community');
    expect(document.querySelector('[data-icon-name="walk"]')).toHaveAttribute('data-icon-provider', 'material-community');
    expect(document.querySelector('[data-icon-name="weight"]')).toHaveAttribute('data-icon-provider', 'material-community');
    expect(document.querySelector('[data-icon-name="size"]')).toHaveAttribute('data-icon-provider', 'material-community');
  });

  it('reprend le suivi alimentaire mobile avec une courbe et deux historiques', () => {
    mocks.currentUser.mockReturnValue({ isPremium: true, isLoading: false });
    mocks.statistics.mockImplementation((type: string) => ({
      data: type === 'alimentations' ? {
        statistic: {
          labels: ['01/08', '15/08'],
          datasets: [{ label: 'Quantité', data: [400, 450] }],
        },
        history: [
          { id: 1, idanimal: 4, date: '2026-08-15', value: 'Granulés', type: 'food' },
          { id: 2, idanimal: 4, date: '2026-08-15', value: 450, unity: 'g', type: 'quantity' },
        ],
      } : type === 'poids' ? {
        statistic: {
          labels: ['01/08', '15/08'],
          datasets: [{ label: 'Poids', data: [420, 425] }],
        },
        history: [
          { id: 3, idanimal: 4, date: '2026-08-15', value: 425, unity: 'kg', type: 'weight' },
        ],
      } : { statistic: [{ date: '2026-08-01', count: 2, events: [expenseEvent] }] },
      isPending: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    }));
    render(<StatisticsContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Vasco' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Alimentation' }));

    expect(screen.getByRole('img', { name: /Courbe de Quantité/ })).toBeVisible();
    expect(screen.getByText('Dernière quantité')).toBeVisible();
    expect(screen.getAllByText('450 g').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Historique des aliments' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Historique des quantités' })).toBeVisible();
    expect(screen.getByText('Granulés')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Évolution du poids' })).toBeVisible();
    expect(screen.getByRole('img', { name: /Courbe de Poids/ })).toBeVisible();
  });

  it('demande un seul animal pour le poids, la taille et l’alimentation', () => {
    mocks.currentUser.mockReturnValue({ isPremium: true, isLoading: false });
    mocks.animals.mockReturnValue({ animals: [{ id: 4, nom: 'Vasco', provenance: 'owner' }, { id: 5, nom: 'Moka', provenance: 'shared' }], isLoading: false, isError: false, refetch: vi.fn(), updateAnimalImage: vi.fn() });
    render(<StatisticsContent />);

    fireEvent.click(screen.getByRole('button', { name: 'Tous les animaux' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Poids' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Sélectionnez un seul animal');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Le poids, la taille et l’alimentation sont des suivis individuels qui ne peuvent pas être mélangés entre plusieurs animaux.',
    );
    expect(mocks.statistics).toHaveBeenLastCalledWith(
      'poids',
      expect.objectContaining({ animaux: [4, 5] }),
      false,
    );

    fireEvent.click(screen.getByRole('radio', { name: 'Vasco' }));
    expect(screen.queryByText('Sélectionnez un seul animal')).not.toBeInTheDocument();
    expect(mocks.statistics).toHaveBeenLastCalledWith(
      'poids',
      expect.objectContaining({ animaux: [4] }),
      true,
    );
  });
});
