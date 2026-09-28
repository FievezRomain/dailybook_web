"use client";

import { GripVertical, RotateCcw } from "lucide-react";
import { useMemo, useSyncExternalStore } from "react";
import {
  Responsive,
  WidthProvider,
  type Layout,
  type Layouts,
} from "react-grid-layout";

import GoalsCard from "./cards/GoalsCard";
import TodayTasksCard from "./cards/TodayTasksCard";
import UpcomingTasksCard from "./cards/UpcomingTasksCard";
import { Button } from "@/shared/components/ui/button";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);
const moduleIds = ["today", "upcoming", "objectives"] as const;
type ModuleId = (typeof moduleIds)[number];

const moduleLabels: Record<ModuleId, string> = {
  today: "Aujourd’hui",
  upcoming: "Prochains jours",
  objectives: "Objectifs",
};

const defaultLayouts: Layouts = {
  lg: [
    { i: "today", x: 0, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
    { i: "upcoming", x: 3, y: 0, w: 3, h: 4, minW: 2, minH: 2 },
    { i: "objectives", x: 0, y: 4, w: 6, h: 6, minW: 2, minH: 4 },
  ],
  md: [
    { i: "today", x: 0, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
    { i: "upcoming", x: 3, y: 0, w: 3, h: 4, minW: 2, minH: 2 },
    { i: "objectives", x: 0, y: 4, w: 6, h: 6, minW: 2, minH: 4 },
  ],
  sm: [
    { i: "today", x: 0, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
    { i: "upcoming", x: 3, y: 0, w: 3, h: 4, minW: 2, minH: 2 },
    { i: "objectives", x: 0, y: 4, w: 6, h: 6, minW: 2, minH: 4 },
  ],
  xs: [
    { i: "today", x: 0, y: 0, w: 1, h: 4, minW: 1, minH: 3 },
    { i: "upcoming", x: 0, y: 4, w: 1, h: 3, minW: 1, minH: 2 },
    { i: "objectives", x: 0, y: 7, w: 1, h: 6, minW: 1, minH: 4 },
  ],
};

const storageKey = "vasco:dashboard-layouts";
const layoutVersion = 6;
const layoutChangeEvent = "vasco-dashboard-layouts-change";

function cloneDefaultLayouts(): Layouts {
  return Object.fromEntries(
    Object.entries(defaultLayouts).map(([breakpoint, layout]) => [
      breakpoint,
      layout.map((item) => ({ ...item })),
    ]),
  );
}

function subscribeToLayouts(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(layoutChangeEvent, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(layoutChangeEvent, onStoreChange);
  };
}

function getLayoutsSnapshot() {
  return localStorage.getItem(storageKey) ?? "";
}

function isValidLayout(layout: unknown): layout is Layout[] {
  if (!Array.isArray(layout) || layout.length !== moduleIds.length)
    return false;
  const ids = new Set(
    layout.map((item) =>
      item && typeof item === "object" ? (item as { i?: unknown }).i : null,
    ),
  );
  return (
    moduleIds.every((id) => ids.has(id)) &&
    layout.every((item) => {
      if (!item || typeof item !== "object") return false;
      const value = item as Record<string, unknown>;
      return (
        typeof value.i === "string" &&
        ["x", "y", "w", "h"].every((key) => typeof value[key] === "number")
      );
    })
  );
}

export function parseDashboardLayouts(serialized: string): Layouts {
  if (!serialized) return cloneDefaultLayouts();
  try {
    const candidate: unknown = JSON.parse(serialized);
    if (!candidate || typeof candidate !== "object")
      return cloneDefaultLayouts();
    const payload = candidate as { version?: unknown; layouts?: unknown };
    if (
      payload.version !== layoutVersion ||
      !payload.layouts ||
      typeof payload.layouts !== "object"
    )
      return cloneDefaultLayouts();
    const layouts = payload.layouts as Record<string, unknown>;
    return ["lg", "md", "sm", "xs"].every((breakpoint) =>
      isValidLayout(layouts[breakpoint]),
    )
      ? (layouts as Layouts)
      : cloneDefaultLayouts();
  } catch {
    return cloneDefaultLayouts();
  }
}

export function serializeDashboardLayouts(layouts: Layouts) {
  return JSON.stringify({ version: layoutVersion, layouts });
}

function persistLayouts(layouts: Layouts) {
  localStorage.setItem(storageKey, serializeDashboardLayouts(layouts));
  window.dispatchEvent(new Event(layoutChangeEvent));
}

function Tile({
  children,
  id,
}: {
  children: React.ReactNode;
  id: ModuleId;
}) {
  return (
    <div className="relative h-full">
      <button
        type="button"
        className="drag-handle absolute top-3 right-3 z-10 grid size-9 cursor-grab touch-none place-items-center rounded-full border bg-card text-muted-foreground shadow-xs hover:bg-muted active:cursor-grabbing"
        aria-label={`Déplacer ${moduleLabels[id]} par glisser-déposer`}
      >
        <GripVertical aria-hidden="true" className="size-4" />
      </button>
      {children}
    </div>
  );
}

export default function GridCards() {
  const serializedLayouts = useSyncExternalStore(
    subscribeToLayouts,
    getLayoutsSnapshot,
    () => "",
  );
  const layouts = useMemo(
    () => parseDashboardLayouts(serializedLayouts),
    [serializedLayouts],
  );
  return (
    <section aria-label="Tuiles de l’accueil" className="pb-8">
      <div className="mb-2 flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => persistLayouts(cloneDefaultLayouts())}
        >
          <RotateCcw aria-hidden="true" className="size-4" />
          Réinitialiser les tuiles
        </Button>
      </div>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 0 }}
        cols={{ lg: 6, md: 6, sm: 6, xs: 1 }}
        rowHeight={72}
        margin={[12, 12]}
        onLayoutChange={(_, allLayouts) => persistLayouts(allLayouts)}
        draggableHandle=".drag-handle"
        resizeHandles={["se"]}
        isResizable
        isDraggable
      >
        <div key="today">
          <Tile id="today">
            <TodayTasksCard />
          </Tile>
        </div>
        <div key="upcoming">
          <Tile id="upcoming">
            <UpcomingTasksCard />
          </Tile>
        </div>
        <div key="objectives">
          <Tile id="objectives">
            <GoalsCard />
          </Tile>
        </div>
      </ResponsiveGridLayout>
    </section>
  );
}
