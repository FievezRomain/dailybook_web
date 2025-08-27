'use client';

import React, { useEffect, useState } from 'react';
import { Responsive, WidthProvider, Layouts, Layout } from 'react-grid-layout';
import WelcomeCard from './cards/WelcomeCard';
import GoalsCard from './cards/GoalsCard';
import TodayTasksCard from './cards/TodayTasksCard';
import UpcomingTasksCard from './cards/UpcomingTasksCard';
import LateTasksCard from './cards/LateTasksCard';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Button } from '../ui';

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

const GridCards = () => {
    const [layouts, setLayouts] = useState<Layouts | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('dashboardLayouts');
        setLayouts(saved ? JSON.parse(saved) : defaultLayouts);
    }, []);

    if (!layouts) return null;

    const layoutLg = layouts.lg;

    const getHeight = (id: string) => {
        const item = layoutLg.find(i => i.i === id);
        return item ? item.h * rowHeight : undefined;
    };

    const resetLayout = () => {
        localStorage.removeItem('dashboardLayouts');
        setLayouts(defaultLayouts); // Recharge la version par défaut
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
                    localStorage.setItem('dashboardLayouts', JSON.stringify(allLayouts));
                    setLayouts(allLayouts);
                }}
                draggableHandle=".drag-handle"
                isResizable
                isDraggable
            >
                <div key="welcome"><WelcomeCard height={getHeight('welcome')} /></div>
                <div key="upcoming"><UpcomingTasksCard height={getHeight('upcoming')} /></div>
                <div key="today"><TodayTasksCard height={getHeight('today')} /></div>
                <div key="late"><LateTasksCard height={getHeight('late')} /></div>
                <div key="objectives"><GoalsCard height={getHeight('objectives')} /></div>
            </ResponsiveGridLayout>
        </div>
    );
};

export default GridCards;
