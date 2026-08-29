'use client';

import React, { useMemo, useSyncExternalStore } from 'react';
import { Responsive, WidthProvider, type Layouts } from 'react-grid-layout';
import WelcomeCard from './cards/WelcomeCard';
import GoalsCard from './cards/GoalsCard';
import TodayTasksCard from './cards/TodayTasksCard';
import UpcomingTasksCard from './cards/UpcomingTasksCard';
import LateTasksCard from './cards/LateTasksCard';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Button } from '@/shared/components/ui';

const ResponsiveGridLayout = WidthProvider(Responsive);

const defaultLayouts: Layouts = {
  lg: [
    { i: 'welcome', x: 0, y: 0, w: 2, h: 2 },
    { i: 'today', x: 2, y: 0, w: 2, h: 2 },
    { i: 'upcoming', x: 4, y: 2, w: 2, h: 4 },
    { i: 'late', x: 0, y: 2, w: 2, h: 2 },
    { i: 'objectives', x: 2, y: 2, w: 2, h: 2 },
  ],
  md: [
    { i: 'welcome', x: 0, y: 0, w: 3, h: 2 },
    { i: 'today', x: 3, y: 0, w: 3, h: 2 },
    { i: 'late', x: 3, y: 2, w: 3, h: 2 },
    { i: 'objectives', x: 0, y: 4, w: 3, h: 2 },
    { i: 'upcoming', x: 3, y: 4, w: 3, h: 2 }
  ],
  sm: [
    { i: 'welcome', x: 0, y: 0, w: 6, h: 3 },
    { i: 'today', x: 0, y: 2, w: 6, h: 2 },
    { i: 'late', x: 0, y: 6, w: 6, h: 2 },
    { i: 'objectives', x: 0, y: 8, w: 6, h: 2 },
    { i: 'upcoming', x: 0, y: 10, w: 6, h: 2 }
  ]
};

const rowHeight = 100;
const storageKey = 'dashboardLayouts';
const layoutChangeEvent = 'vasco-dashboard-layouts-change';

function subscribeToLayouts(onStoreChange: () => void) {
    window.addEventListener('storage', onStoreChange);
    window.addEventListener(layoutChangeEvent, onStoreChange);
    return () => {
        window.removeEventListener('storage', onStoreChange);
        window.removeEventListener(layoutChangeEvent, onStoreChange);
    };
}

function getLayoutsSnapshot() {
    return localStorage.getItem(storageKey) ?? '';
}

function getServerLayoutsSnapshot() {
    return '';
}

export function parseDashboardLayouts(serialized: string): Layouts {
    if (!serialized) return defaultLayouts;
    try {
        const candidate: unknown = JSON.parse(serialized);
        if (!candidate || typeof candidate !== 'object') return defaultLayouts;
        const values = Object.values(candidate);
        return values.length > 0 && values.every(Array.isArray) ? candidate as Layouts : defaultLayouts;
    } catch {
        return defaultLayouts;
    }
}

function persistLayouts(layouts?: Layouts) {
    if (layouts) localStorage.setItem(storageKey, JSON.stringify(layouts));
    else localStorage.removeItem(storageKey);
    window.dispatchEvent(new Event(layoutChangeEvent));
}

const GridCards = () => {
    const serializedLayouts = useSyncExternalStore(
        subscribeToLayouts,
        getLayoutsSnapshot,
        getServerLayoutsSnapshot,
    );
    const layouts = useMemo(() => parseDashboardLayouts(serializedLayouts), [serializedLayouts]);

    const layoutLg = layouts.lg ?? [];

    const getHeight = (id: string) => {
        const item = layoutLg.find(i => i.i === id);
        return item ? item.h * rowHeight : undefined;
    };

    const resetLayout = () => {
        persistLayouts();
    };

    return (
        <div className="pt-8 pb-8 px-0">
            <div className="flex justify-end mb-2">
                <Button
                    onClick={resetLayout}
                    className="px-4 py-2 text-sm font-medium text-white"
                    variant={"default"}
                >
                    Réinitialiser la disposition
                </Button>
            </div>
            <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768 }}
                cols={{ lg: 6, md: 6, sm: 6 }}
                rowHeight={rowHeight}
                onLayoutChange={(_, allLayouts) => {
                    persistLayouts(allLayouts);
                }}
                draggableHandle=".drag-handle"
                isResizable
                isDraggable
            >
                <div key="welcome"><WelcomeCard /></div>
                <div key="upcoming"><UpcomingTasksCard height={getHeight('upcoming')} /></div>
                <div key="today"><TodayTasksCard height={getHeight('today')} /></div>
                <div key="late"><LateTasksCard height={getHeight('late')} /></div>
                <div key="objectives"><GoalsCard height={getHeight('objectives')} /></div>
            </ResponsiveGridLayout>
        </div>
    );
};

export default GridCards;
