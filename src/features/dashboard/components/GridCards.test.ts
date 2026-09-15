import { describe, expect, it } from 'vitest';
import { parseDashboardLayouts, serializeDashboardLayouts } from './GridCards';

describe('parseDashboardLayouts', () => {
  it('utilise la disposition par défaut sans préférence enregistrée', () => {
    const layouts = parseDashboardLayouts('');

    expect(layouts.lg?.map(({ i }) => i)).toEqual([
      'today', 'weather', 'upcoming', 'objectives',
    ]);
    expect(layouts.lg).toEqual([
      { i: 'today', x: 0, y: 0, w: 4, h: 4, minW: 2, minH: 3 },
      { i: 'weather', x: 4, y: 0, w: 2, h: 3, minW: 2, minH: 3 },
      { i: 'upcoming', x: 4, y: 3, w: 2, h: 4, minW: 2, minH: 2 },
      { i: 'objectives', x: 0, y: 4, w: 4, h: 3, minW: 2, minH: 2 },
    ]);
  });

  it('ignore une préférence locale invalide', () => {
    expect(parseDashboardLayouts('{invalid').lg).toHaveLength(4);
    expect(parseDashboardLayouts(JSON.stringify({ lg: 'invalid' })).lg).toHaveLength(4);
  });

  it('restaure une disposition enregistrée valide', () => {
    const desktop = [
      { i: 'today', x: 0, y: 0, w: 4, h: 4 },
      { i: 'weather', x: 4, y: 0, w: 2, h: 2 },
      { i: 'upcoming', x: 4, y: 2, w: 2, h: 2 },
      { i: 'objectives', x: 0, y: 4, w: 6, h: 3 },
    ];
    const compact = desktop.map((item, index) => ({ ...item, x: 0, y: index * 2, w: 1 }));
    const layouts = { lg: desktop, md: desktop, sm: desktop, xs: compact };
    const serialized = serializeDashboardLayouts(layouts);

    expect(parseDashboardLayouts(serialized).lg).toEqual(desktop);
  });

  it('écarte une ancienne disposition contenant les modules supprimés', () => {
    const serialized = JSON.stringify({
      lg: [{ i: 'welcome', x: 0, y: 0, w: 2, h: 2 }],
      md: [],
      sm: [],
    });

    expect(parseDashboardLayouts(serialized).lg?.map(({ i }) => i)).toEqual([
      'today', 'weather', 'upcoming', 'objectives',
    ]);
  });

  it('migre une disposition de l’ancien format vers la nouvelle composition', () => {
    const oldLayout = [
      { i: 'weather', x: 0, y: 0, w: 6, h: 4 },
      { i: 'today', x: 0, y: 4, w: 3, h: 4 },
      { i: 'upcoming', x: 3, y: 4, w: 3, h: 4 },
      { i: 'objectives', x: 0, y: 8, w: 6, h: 4 },
    ];

    const layouts = parseDashboardLayouts(JSON.stringify({ lg: oldLayout, md: oldLayout, sm: oldLayout }));
    expect(layouts.lg?.[0]?.i).toBe('today');
    expect(layouts.lg?.find(({ i }) => i === 'weather')).toMatchObject({ w: 2, h: 3 });
  });
});
