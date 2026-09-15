import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import GridCards from './GridCards';

vi.mock('react-grid-layout', () => ({
  Responsive: ({ children, isDraggable, isResizable, resizeHandles }: { children: React.ReactNode; isDraggable?: boolean; isResizable?: boolean; resizeHandles?: string[] }) => (
    <div
      data-testid="dashboard-grid"
      data-draggable={String(isDraggable)}
      data-resizable={String(isResizable)}
      data-resize-handles={resizeHandles?.join(',')}
    >
      {children}
    </div>
  ),
  WidthProvider: (Component: React.ComponentType<{ children: React.ReactNode }>) => Component,
}));
vi.mock('@/features/weather/components/WeatherCard', () => ({ WeatherCard: () => <article>Météo</article> }));
vi.mock('./cards/TodayTasksCard', () => ({ default: () => <article>Aujourd’hui</article> }));
vi.mock('./cards/UpcomingTasksCard', () => ({ default: () => <article>Prochains jours</article> }));
vi.mock('./cards/GoalsCard', () => ({ default: () => <article>Objectifs</article> }));

describe('organisation des tuiles Home', () => {
  beforeEach(() => window.localStorage.clear());

  it('permet directement le déplacement et le redimensionnement des tuiles', () => {
    render(<GridCards />);

    const handles = screen.getAllByRole('button', { name: /par glisser-déposer/ });
    expect(handles).toHaveLength(4);
    handles.forEach((handle) => expect(handle).toHaveClass('top-3', 'right-3'));
    expect(screen.queryByRole('button', { name: 'Organiser les tuiles' })).not.toBeInTheDocument();
    expect(screen.getByTestId('dashboard-grid')).toHaveAttribute('data-draggable', 'true');
    expect(screen.getByTestId('dashboard-grid')).toHaveAttribute('data-resizable', 'true');
    expect(screen.getByTestId('dashboard-grid')).toHaveAttribute('data-resize-handles', 'se');
  });

  it('restaure la disposition initiale depuis la page Home', () => {
    window.localStorage.setItem('vasco:dashboard-layouts', JSON.stringify({ version: 2, layouts: { lg: [], md: [], sm: [], xs: [] } }));
    render(<GridCards />);

    fireEvent.click(screen.getByRole('button', { name: 'Réinitialiser les tuiles' }));

    const saved = JSON.parse(window.localStorage.getItem('vasco:dashboard-layouts') ?? '{}');
    expect(saved.layouts.lg.find((item: { i: string }) => item.i === 'objectives')).toMatchObject({ x: 0, y: 4, w: 4 });
    expect(saved.layouts.lg.find((item: { i: string }) => item.i === 'upcoming')).toMatchObject({ x: 4, y: 3, h: 4 });
  });
});
