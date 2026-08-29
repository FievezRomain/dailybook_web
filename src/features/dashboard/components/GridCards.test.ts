import { describe, expect, it } from 'vitest';
import { parseDashboardLayouts } from './GridCards';

describe('parseDashboardLayouts', () => {
  it('utilise la disposition par défaut sans préférence enregistrée', () => {
    const layouts = parseDashboardLayouts('');

    expect(layouts.lg?.map(({ i }) => i)).toEqual([
      'welcome', 'today', 'upcoming', 'late', 'objectives',
    ]);
  });

  it('ignore une préférence locale invalide', () => {
    expect(parseDashboardLayouts('{invalid').lg).toHaveLength(5);
    expect(parseDashboardLayouts(JSON.stringify({ lg: 'invalid' })).lg).toHaveLength(5);
  });

  it('restaure une disposition enregistrée valide', () => {
    const serialized = JSON.stringify({
      lg: [{ i: 'welcome', x: 1, y: 0, w: 2, h: 2 }],
    });

    expect(parseDashboardLayouts(serialized).lg).toEqual([
      { i: 'welcome', x: 1, y: 0, w: 2, h: 2 },
    ]);
  });
});
