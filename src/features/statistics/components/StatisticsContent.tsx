"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BarChart3,
  ChartNoAxesCombined,
  Gauge,
} from "lucide-react";

import { AnimalSelector } from "@/features/animals/components/AnimalSelector";
import { useAnimalsQuery } from "@/features/animals/hooks/use-animals";
import { useEventDrawer } from "@/features/events/context/event-drawer-context";
import { mapEventData } from "@/features/events/utils/events";
import { useCurrentUser } from "@/features/user/hooks/use-current-user";
import {
  PremiumNotice,
  usePremiumGate,
} from "@/shared/components/feedback/PremiumGate";
import { PageHeader, PageShell } from "@/shared/components/layout/PageShell";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { DateInput } from "@/shared/components/ui/form-feedback";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { SystemState } from "@/shared/components/ui/system-state";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/shared/components/ui/icons";
import { EventActivityHeatmap } from "./EventActivityHeatmap";
import { ActivityExactTable } from "./ActivityExactTable";
import { ExpenseBreakdown } from "./ExpenseBreakdown";
import { useStatisticsQuery } from "../hooks/use-statistics";
import type {
  EventStatistics,
  PhysicalStatistics,
  StatisticHistoryEntry,
  StatisticsChart,
  StatisticsQueryInput,
  StatisticsType,
} from "../types/statistics";

type TypeConfig = {
  label: string;
  description: string;
  unit: string;
  icon: IconName;
  visual: "bars" | "donut" | "line" | "heatmap";
};

const typeConfig: Record<StatisticsType, TypeConfig> = {
  depenses: {
    label: "Dépenses",
    description: "Répartition des montants engagés",
    unit: "€",
    icon: "expense",
    visual: "donut",
  },
  entrainements: {
    label: "Entraînements",
    description: "Régularité des séances réalisées",
    unit: "",
    icon: "training",
    visual: "heatmap",
  },
  balades: {
    label: "Balades",
    description: "Fréquence des sorties dans le temps",
    unit: "",
    icon: "walk",
    visual: "heatmap",
  },
  poids: {
    label: "Poids",
    description: "Évolution des mesures enregistrées",
    unit: "kg",
    icon: "weight",
    visual: "line",
  },
  tailles: {
    label: "Taille",
    description: "Évolution de la croissance",
    unit: "cm",
    icon: "size",
    visual: "line",
  },
  alimentations: {
    label: "Alimentation",
    description: "Évolution des quantités enregistrées",
    unit: "",
    icon: "food",
    visual: "line",
  },
  concours: {
    label: "Concours",
    description: "Participation et résultats enregistrés",
    unit: "",
    icon: "trophy",
    visual: "heatmap",
  },
};

const chartColors = [
  "var(--event-rdv)",
  "var(--event-balade)",
  "var(--event-concours)",
  "var(--event-autre)",
  "var(--primary)",
  "var(--event-soins)",
];

const physicalEventTypes = new Set<StatisticsType>(["balades", "entrainements", "concours"]);
const singleAnimalTypes = new Set<StatisticsType>([
  "alimentations",
  "poids",
  "tailles",
]);
const statisticsTypeOrder: StatisticsType[] = [
  "depenses",
  "alimentations",
  "entrainements",
  "concours",
  "balades",
  "poids",
  "tailles",
];

function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function defaultDates() {
  const end = new Date();
  const start = new Date(end);
  start.setMonth(start.getMonth() - 3);
  return { dateDebut: localDate(start), dateFin: localDate(end) };
}

function formatPeriodDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function applyPreset(months: number) {
  const end = new Date();
  const start = new Date(end);
  start.setMonth(start.getMonth() - months);
  return { start: localDate(start), end: localDate(end) };
}

function eventItemValue(item: EventStatistics["statistic"][number]) {
  return Number(
    item.exact_value ?? item.value ?? item.count ?? item.events.length ?? 0,
  );
}

function ChartFrame({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Card className="gap-0 overflow-hidden rounded-[24px] p-0 shadow-surface xl:col-span-8">
      <header className="flex items-start gap-3 border-b bg-muted/20 px-5 py-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-primary/10 text-primary">
          <ChartNoAxesCombined className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
            Visualisation principale
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">
            {title}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </Card>
  );
}

function LineChart({ chart, unit }: { chart: StatisticsChart; unit: string }) {
  const values = chart.datasets
    .flatMap((dataset) => dataset.data)
    .filter((value): value is number => value !== null);
  if (!values.length)
    return (
      <SystemState
        title="Pas encore de courbe"
        description="Ajoutez plusieurs mesures datées sur cette période pour faire apparaître une évolution."
      />
    );
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max((max - min) * 0.15, 1);
  const chartMin = min - padding;
  const chartMax = max + padding;
  const x = (index: number) =>
    chart.labels.length <= 1
      ? 320
      : 48 + (index / (chart.labels.length - 1)) * 560;
  const y = (value: number) =>
    252 - ((value - chartMin) / (chartMax - chartMin || 1)) * 210;
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4">
        {chart.datasets.map((dataset, index) => (
          <span
            key={`${dataset.label}-${index}`}
            className="inline-flex items-center gap-2 text-xs font-medium"
          >
            <span
              className="h-0.5 w-7"
              style={{
                backgroundColor: chartColors[index % chartColors.length],
              }}
            />
            {dataset.label || `Série ${index + 1}`}
          </span>
        ))}
      </div>
      <svg
        viewBox="0 0 640 290"
        className="h-auto min-h-64 w-full overflow-visible"
        role="img"
        aria-label={`Courbe de ${chart.datasets.map((dataset) => dataset.label || "la série").join(", ")} sur ${chart.labels.length} périodes. Les valeurs exactes sont disponibles dans le tableau.`}
      >
        {[0, 1, 2, 3, 4].map((line) => {
          const lineY = 42 + line * 52.5;
          const label = chartMax - ((chartMax - chartMin) / 4) * line;
          return (
            <g key={line}>
              <line
                x1="48"
                x2="608"
                y1={lineY}
                y2={lineY}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray="3 5"
              />
              <text
                x="40"
                y={lineY + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[10px]"
              >
                {label.toFixed(1)}
                {unit}
              </text>
            </g>
          );
        })}
        {chart.datasets.map((dataset, datasetIndex) => {
          const points = dataset.data
            .map((value, index) =>
              value === null ? null : `${x(index)},${y(value)}`,
            )
            .filter(Boolean)
            .join(" ");
          const color = chartColors[datasetIndex % chartColors.length];
          return (
            <g key={`${dataset.label}-${datasetIndex}`}>
              <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={datasetIndex % 2 ? "8 5" : undefined}
                vectorEffect="non-scaling-stroke"
              />
              {dataset.data.map((value, index) =>
                value === null ? null : (
                  <circle
                    key={index}
                    cx={x(index)}
                    cy={y(value)}
                    r="5"
                    fill="var(--card)"
                    stroke={color}
                    strokeWidth="3"
                    tabIndex={0}
                    role="graphics-symbol"
                    aria-label={`${dataset.label || "Valeur"}, ${chart.labels[index] || index + 1} : ${value} ${unit}`}
                  >
                    <title>{`${chart.labels[index] || index + 1} : ${value} ${unit}`}</title>
                  </circle>
                ),
              )}
            </g>
          );
        })}
        {chart.labels.map((label, index) =>
          chart.labels.length <= 7 ||
          index % Math.ceil(chart.labels.length / 7) === 0 ? (
            <text
              key={`${label}-${index}`}
              x={x(index)}
              y="278"
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {label.slice(0, 10)}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}

function EventBars({
  result,
  unit,
}: {
  result: EventStatistics;
  unit: string;
}) {
  const items = result.statistic.slice(-12);
  const values = items.map(eventItemValue);
  const max = Math.max(...values, 1);
  if (!items.length)
    return (
      <SystemState
        title="Aucune activité sur la période"
        description="Élargissez la période ou choisissez d’autres animaux pour alimenter ce graphique."
      />
    );
  return (
    <svg
      viewBox="0 0 640 300"
      className="h-auto min-h-64 w-full overflow-visible"
      role="img"
      aria-label={`Histogramme de ${items.length} résultats. Les valeurs exactes sont disponibles dans le tableau.`}
    >
      {[0, 1, 2, 3, 4].map((line) => (
        <line
          key={line}
          x1="45"
          x2="620"
          y1={35 + line * 55}
          y2={35 + line * 55}
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
      ))}
      {items.map((item, index) => {
        const slot = 565 / items.length;
        const value = values[index];
        const height = (value / max) * 205;
        const barX = 50 + index * slot;
        return (
          <g
            key={`${item.date}-${item.name}-${index}`}
            tabIndex={0}
            role="graphics-symbol"
            aria-label={`${item.name || item.date || `Résultat ${index + 1}`} : ${value}${unit}`}
          >
            <rect
              x={barX}
              y={240 - height}
              width={Math.max(slot - 9, 8)}
              height={height}
              rx="5"
              fill={chartColors[index % chartColors.length]}
              opacity="0.9"
            >
              <title>{`${item.name || item.date || `Résultat ${index + 1}`} : ${value}${unit}`}</title>
            </rect>
            <text
              x={barX + Math.max(slot - 9, 8) / 2}
              y="260"
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {(item.name || item.date || `${index + 1}`).slice(0, 8)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ExpenseDonut({ result }: { result: EventStatistics }) {
  const items = result.statistic.filter((item) => eventItemValue(item) > 0);
  const total = items.reduce((sum, item) => sum + eventItemValue(item), 0);
  const circumference = 2 * Math.PI * 72;
  if (!items.length || !total)
    return (
      <SystemState
        title="Aucune dépense sur la période"
        description="Les catégories apparaîtront ici dès qu’une dépense sera enregistrée."
      />
    );
  const segments = items.map((item, index) => {
    const value = eventItemValue(item);
    const previousTotal = items
      .slice(0, index)
      .reduce((sum, previous) => sum + eventItemValue(previous), 0);
    return {
      item,
      value,
      length: (value / total) * circumference,
      dashOffset: -((previousTotal / total) * circumference),
    };
  });
  return (
    <div className="grid items-center gap-6 md:grid-cols-[minmax(260px,0.9fr)_1.1fr]">
      <svg
        viewBox="0 0 200 200"
        className="mx-auto size-full max-h-80 max-w-80"
        role="img"
        aria-label={`Répartition de ${total.toLocaleString("fr-FR")} euros sur ${items.length} catégories`}
      >
        <circle
          cx="100"
          cy="100"
          r="72"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="24"
        />
        {segments.map(({ item, value, length, dashOffset }, index) => (
          <circle
            key={`${item.name}-${index}`}
            cx="100"
            cy="100"
            r="72"
            fill="none"
            stroke={chartColors[index % chartColors.length]}
            strokeWidth="24"
            strokeDasharray={`${length} ${circumference - length}`}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 100 100)"
            tabIndex={0}
            role="graphics-symbol"
            aria-label={`${item.name || "Autre"} : ${value.toLocaleString("fr-FR")} euros`}
          >
            <title>{`${item.name || "Autre"} : ${value.toLocaleString("fr-FR")} €`}</title>
          </circle>
        ))}
        <text
          x="100"
          y="95"
          textAnchor="middle"
          className="fill-muted-foreground text-[10px]"
        >
          TOTAL
        </text>
        <text
          x="100"
          y="116"
          textAnchor="middle"
          className="fill-foreground text-[18px] font-semibold"
        >
          {total.toLocaleString("fr-FR")} €
        </text>
      </svg>
      <ul className="space-y-2">
        {segments.map(({ item, value }, index) => (
          <li
            key={`${item.name}-${index}`}
            className="flex items-center gap-3 rounded-[14px] bg-muted/35 px-3 py-2.5"
          >
            <span
              className="size-2.5 rounded-full"
              style={{
                backgroundColor: chartColors[index % chartColors.length],
              }}
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {item.name || "Autre"}
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {value.toLocaleString("fr-FR")} €
            </span>
            <span className="w-10 text-right text-xs text-muted-foreground">
              {Math.round((value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function foodQuantityEntries(result: PhysicalStatistics) {
  return result.history
    .filter(
      (entry) => entry.type === "quantity" && Number.isFinite(Number(entry.value)),
    )
    .sort((left, right) => left.date.localeCompare(right.date));
}

function FoodResultSummary({ result }: { result: PhysicalStatistics }) {
  const quantities = foodQuantityEntries(result);
  const latest = quantities.at(-1);
  const first = quantities.at(0);
  const variation =
    latest && first ? Number(latest.value) - Number(first.value) : undefined;
  const formatQuantity = (entry?: StatisticHistoryEntry) =>
    entry
      ? `${Number(entry.value).toLocaleString("fr-FR")}${entry.unity ? ` ${entry.unity}` : ""}`
      : "—";

  return (
    <aside
      className="space-y-3 xl:col-span-4"
      aria-label="Résumé de l’alimentation"
    >
      <Card className="relative overflow-hidden rounded-[24px] border-primary/25 bg-primary p-5 text-primary-foreground shadow-surface">
        <Icon
          name="food"
          size={112}
          className="absolute -bottom-7 -right-7 opacity-10"
          aria-hidden="true"
        />
        <p className="text-xs font-medium opacity-75">Dernière quantité</p>
        <p className="mt-2 text-4xl font-semibold tracking-[-0.04em] tabular-nums">
          {formatQuantity(latest)}
        </p>
        <p className="mt-5 text-xs opacity-75">
          {latest
            ? `Enregistrée le ${formatPeriodDate(latest.date)}`
            : "Aucune quantité sur la période"}
        </p>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-[20px] p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Nombre d’entrées</p>
          <p className="mt-2 text-xl font-semibold tabular-nums">
            {result.history.length}
          </p>
        </Card>
        <Card className="rounded-[20px] p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Évolution</p>
          <p className="mt-2 text-xl font-semibold tabular-nums">
            {variation === undefined
              ? "—"
              : `${variation > 0 ? "+" : ""}${variation.toLocaleString("fr-FR")}${latest?.unity ? ` ${latest.unity}` : ""}`}
          </p>
        </Card>
      </div>
    </aside>
  );
}

function FoodHistorySections({ result }: { result: PhysicalStatistics }) {
  const ordered = [...result.history].sort((left, right) =>
    right.date.localeCompare(left.date),
  );
  const foods = ordered.filter((entry) => entry.type === "food");
  const quantities = ordered.filter((entry) => entry.type === "quantity");

  return (
    <section className="grid gap-4 lg:grid-cols-2" aria-label="Historique alimentaire">
      <FoodHistoryCard
        title="Historique des aliments"
        entries={foods}
        empty="Aucun aliment renseigné sur cette période."
        formatValue={(entry) => String(entry.value)}
      />
      <FoodHistoryCard
        title="Historique des quantités"
        entries={quantities}
        empty="Aucune quantité renseignée sur cette période."
        formatValue={(entry) =>
          `${Number(entry.value).toLocaleString("fr-FR")}${entry.unity ? ` ${entry.unity}` : ""}`
        }
      />
    </section>
  );
}

function FoodHistoryCard({
  title,
  entries,
  empty,
  formatValue,
}: {
  title: string;
  entries: StatisticHistoryEntry[];
  empty: string;
  formatValue: (entry: StatisticHistoryEntry) => string;
}) {
  return (
    <Card className="gap-0 overflow-hidden rounded-[24px] p-0 shadow-surface">
      <header className="border-b bg-muted/20 px-5 py-4">
        <h2 className="text-lg font-semibold">{title}</h2>
      </header>
      {entries.length ? (
        <ul className="divide-y px-5">
          {entries.map((entry) => (
            <li key={entry.id} className="flex min-h-12 items-center gap-4 py-3">
              <span className="min-w-0 flex-1 text-sm text-muted-foreground">
                {formatPeriodDate(entry.date)}
              </span>
              <span className="text-right text-sm font-semibold">
                {formatValue(entry)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-6 text-sm text-muted-foreground">{empty}</p>
      )}
    </Card>
  );
}

function FoodWeightComparison({
  filters,
}: {
  filters: StatisticsQueryInput;
}) {
  const weightStatistics = useStatisticsQuery("poids", filters);

  return (
    <section aria-label="Comparaison entre l’alimentation et le poids">
      <ChartFrame
        title="Évolution du poids"
        description="Même animal et même période que l’alimentation, pour comparer les deux évolutions."
      >
        {weightStatistics.isPending ? (
          <Skeleton className="h-72 w-full rounded-[20px]" />
        ) : weightStatistics.isError ? (
          <SystemState
            state="error"
            title="Le poids est indisponible"
            description="La statistique d’alimentation reste affichée. Vous pouvez réessayer de charger le poids."
            primaryAction={{
              label: "Réessayer",
              onClick: () => void weightStatistics.refetch(),
            }}
          />
        ) : weightStatistics.data ? (
          <LineChart chart={weightStatistics.data.statistic} unit="kg" />
        ) : (
          <SystemState
            title="Aucune mesure de poids"
            description="Ajoutez des mesures de poids pour les comparer à l’alimentation sur cette période."
          />
        )}
      </ChartFrame>
    </section>
  );
}

function ResultSummary({
  result,
  config,
}: {
  result: EventStatistics | PhysicalStatistics;
  config: TypeConfig;
}) {
  const values =
    "history" in result
      ? [...result.history]
          .sort((left, right) => left.date.localeCompare(right.date))
          .map((entry) => Number(entry.value))
          .filter(Number.isFinite)
      : result.statistic.map(eventItemValue);
  const latest = values.at(-1);
  const average = values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : undefined;
  const variation = values.length > 1 ? values.at(-1)! - values[0] : undefined;
  const format = (value?: number) =>
    value === undefined
      ? "—"
      : `${Number.isInteger(value) ? value : value.toFixed(1)}${config.unit ? ` ${config.unit}` : ""}`;
  return (
    <aside
      className="space-y-3 xl:col-span-4"
      aria-label="Résumé des résultats"
    >
      <Card className="relative overflow-hidden rounded-[24px] border-primary/25 bg-primary p-5 text-primary-foreground shadow-surface">
        <Gauge
          className="absolute -bottom-6 -right-6 size-28 opacity-10"
          aria-hidden="true"
        />
        <p className="text-xs font-medium opacity-75">Dernière valeur</p>
        <p className="mt-2 text-4xl font-semibold tracking-[-0.04em] tabular-nums">
          {format(latest)}
        </p>
        <p className="mt-5 text-xs opacity-75">
          {values.length} observation{values.length > 1 ? "s" : ""} dans la
          sélection
        </p>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-[20px] p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Moyenne</p>
          <p className="mt-2 text-xl font-semibold tabular-nums">
            {format(average)}
          </p>
        </Card>
        <Card className="rounded-[20px] p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Évolution</p>
          <p className="mt-2 text-xl font-semibold tabular-nums">
            {variation === undefined
              ? "—"
              : `${variation > 0 ? "+" : ""}${format(variation)}`}
          </p>
        </Card>
      </div>
      <Card className="rounded-[20px] bg-muted/35 p-4 shadow-none">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Lecture rapide
        </p>
        <p className="mt-2 text-sm leading-6">
          {values.length < 2
            ? "Une seconde observation permettra de faire apparaître une tendance."
            : variation === 0
              ? "La valeur est stable entre le premier et le dernier relevé."
              : variation! > 0
                ? "La tendance progresse sur la période sélectionnée."
                : "La tendance diminue sur la période sélectionnée."}
        </p>
      </Card>
    </aside>
  );
}

function ExactTable({
  result,
}: {
  result: EventStatistics | PhysicalStatistics;
}) {
  return (
    <Card className="gap-0 overflow-hidden rounded-[24px] p-0 shadow-surface">
      <header className="border-b bg-muted/20 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
          Données sources
        </p>
        <h2 className="mt-1 text-lg font-semibold">Valeurs exactes</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Alternative accessible au graphique et historique vérifiable.
        </p>
      </header>
      <div className="overflow-x-auto p-5">
        <table className="w-full min-w-[620px] text-left text-sm">
          <caption className="sr-only">
            Valeurs détaillées des statistiques
          </caption>
          {"history" in result ? (
            <>
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Valeur</th>
                  <th className="px-3 py-2 font-medium">Unité</th>
                  <th className="px-3 py-2 font-medium">Type</th>
                </tr>
              </thead>
              <tbody>
                {result.history.map((entry) => (
                  <tr key={entry.id} className="border-b last:border-0">
                    <td className="px-3 py-3">
                      {formatPeriodDate(entry.date)}
                    </td>
                    <td className="px-3 py-3 font-semibold tabular-nums">
                      {entry.value}
                    </td>
                    <td className="px-3 py-3">{entry.unity || "—"}</td>
                    <td className="px-3 py-3">{entry.type || "Mesure"}</td>
                  </tr>
                ))}
              </tbody>
            </>
          ) : (
            <>
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Indicateur</th>
                  <th className="px-3 py-2 font-medium">Nombre</th>
                  <th className="px-3 py-2 font-medium">Valeur exacte</th>
                </tr>
              </thead>
              <tbody>
                {result.statistic.map((item, index) => (
                  <tr
                    key={`${item.date}-${item.name}-${index}`}
                    className="border-b last:border-0"
                  >
                    <td className="px-3 py-3">
                      {item.date ? formatPeriodDate(item.date) : "—"}
                    </td>
                    <td className="px-3 py-3 font-medium">
                      {item.name || "Résultat"}
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {item.count ?? item.events.length}
                    </td>
                    <td className="px-3 py-3 font-semibold tabular-nums">
                      {item.exact_value ?? item.value ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          )}
        </table>
      </div>
    </Card>
  );
}

export default function StatisticsContent() {
  const { isPremium, isLoading: isUserLoading } = useCurrentUser();
  const animalsQuery = useAnimalsQuery();
  const { openDrawer: openEventDrawer } = useEventDrawer();
  const { handlePremiumError } = usePremiumGate();
  const initialDates = useMemo(() => defaultDates(), []);
  const animals = animalsQuery.animals ?? [];
  const [type, setType] = useState<StatisticsType>("depenses");
  const [selectedAnimals, setSelectedAnimals] = useState<number[]>([]);
  const [dateDebut, setDateDebut] = useState(initialDates.dateDebut);
  const [dateFin, setDateFin] = useState(initialDates.dateFin);
  const requiresSingleAnimal = singleAnimalTypes.has(type);
  const hasValidAnimalSelection =
    selectedAnimals.length > 0 &&
    (!requiresSingleAnimal || selectedAnimals.length === 1);
  const hasValidFilters =
    hasValidAnimalSelection &&
    Boolean(dateDebut && dateFin && dateDebut <= dateFin);
  const activeFilters = { animaux: selectedAnimals, dateDebut, dateFin };
  const statistics = useStatisticsQuery(
    type,
    activeFilters,
    Boolean(isPremium && hasValidFilters),
  );
  const handledError = useRef<unknown>(undefined);
  const config = typeConfig[type];
  const includesSharedAnimals = selectedAnimals.some(
    (id) => animals.find((animal) => animal.id === id)?.provenance === "shared",
  );

  useEffect(() => {
    if (!statistics.error || handledError.current === statistics.error) return;
    handledError.current = statistics.error;
    void handlePremiumError(statistics.error, "statistics");
  }, [statistics.error, handlePremiumError]);
  const setPreset = (months: number) => {
    const preset = applyPreset(months);
    setDateDebut(preset.start);
    setDateFin(preset.end);
  };

  if (isUserLoading)
    return (
      <PageShell>
        <Skeleton className="h-48 w-full rounded-[24px]" />
      </PageShell>
    );

  return (
    <PageShell className="space-y-6 pb-24">
      <PageHeader className="items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Suivi
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-[-0.03em]">
            Vos données racontent une histoire
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Observez une tendance, comparez vos animaux et retrouvez chaque
            valeur qui compose le résultat.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold">
          <BarChart3 className="size-4 text-primary" aria-hidden="true" />
          Analyse Premium
        </span>
      </PageHeader>
      {!isPremium ? (
        <PremiumNotice feature="statistics" />
      ) : (
        <>
          <section
            aria-label="Paramètres statistiques"
            className="rounded-[24px] border bg-background p-4 shadow-surface sm:p-5"
          >
            <div>
              <span className="mb-2 block text-xs font-semibold">
                Indicateur
              </span>
              <div
                role="tablist"
                aria-label="Indicateur statistique"
                className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-7"
              >
                {statisticsTypeOrder.map((value) => {
                  const item = typeConfig[value];
                  const isSelected = type === value;
                  const isSingleAnimal = singleAnimalTypes.has(value);

                  return (
                    <button
                      key={value}
                      type="button"
                      role="tab"
                      aria-label={item.label}
                      aria-selected={isSelected}
                      className={cn(
                        "group flex min-h-20 min-w-0 items-center gap-2.5 overflow-hidden rounded-[16px] border px-3 py-3 text-left transition-[border-color,background-color,box-shadow,transform] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isSelected
                          ? "border-primary/45 bg-primary/[0.09] shadow-sm"
                          : "border-border/70 bg-card hover:border-primary/25 hover:bg-muted/35",
                      )}
                      onClick={() => setType(value)}
                    >
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-[11px] transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground group-hover:text-primary",
                        )}
                      >
                        <Icon name={item.icon} size={19} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block break-words text-xs font-semibold leading-snug">
                          {item.label}
                        </span>
                        {isSingleAnimal ? (
                          <span className="mt-1 block text-[10px] leading-none text-muted-foreground">
                            1 animal
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 grid gap-4 border-t pt-4 xl:grid-cols-[1fr_auto] xl:items-end">
              <div>
                <span className="mb-1.5 block text-xs font-semibold">
                  Période
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <label>
                    <span className="sr-only">Du</span>
                    <DateInput
                      aria-label="Du"
                      value={dateDebut}
                      max={dateFin}
                      onChange={(event) => setDateDebut(event.target.value)}
                    />
                  </label>
                  <label>
                    <span className="sr-only">Au</span>
                    <DateInput
                      aria-label="Au"
                      value={dateFin}
                      min={dateDebut}
                      onChange={(event) => setDateFin(event.target.value)}
                    />
                  </label>
                </div>
              </div>
              <div className="flex gap-1 rounded-control bg-muted/60 p-1">
                {[
                  { label: "1 mois", months: 1 },
                  { label: "3 mois", months: 3 },
                  { label: "1 an", months: 12 },
                ].map((preset) => (
                  <button
                    key={preset.months}
                    type="button"
                    className="min-h-9 rounded-[9px] px-3 text-xs font-semibold text-muted-foreground hover:bg-card hover:text-foreground"
                    onClick={() => setPreset(preset.months)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold">Animaux analysés</p>
                  <p className="text-[11px] text-muted-foreground">
                    Chaque modification actualise automatiquement l’analyse.
                  </p>
                </div>
                {!requiresSingleAnimal ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={!animals.length}
                    onClick={() =>
                      setSelectedAnimals(
                        selectedAnimals.length === animals.length
                          ? []
                          : animals.map((animal) => animal.id),
                      )
                    }
                  >
                    {selectedAnimals.length === animals.length && animals.length
                      ? "Aucun animal"
                      : "Tous les animaux"}
                  </Button>
                ) : null}
              </div>
              {animalsQuery.isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : animalsQuery.isError ? (
                <div role="alert" className="text-sm text-destructive">
                  Les animaux sont indisponibles.{" "}
                  <button
                    className="font-semibold underline"
                    onClick={() => void animalsQuery.refetch()}
                  >
                    Réessayer
                  </button>
                </div>
              ) : (
                <AnimalSelector
                  animals={animals}
                  selectedIds={selectedAnimals}
                  onChange={setSelectedAnimals}
                  onUpdateAnimalImage={animalsQuery.updateAnimalImage}
                  singleSelect={requiresSingleAnimal}
                />
              )}
            </div>
            <div className="mt-4 flex items-center gap-3 border-t pt-4">
              <span className="grid size-10 place-items-center rounded-[13px] bg-primary/10 text-primary">
                <Icon name={config.icon} size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">{config.label}</p>
                <p className="text-xs text-muted-foreground">
                  {hasValidFilters
                    ? "Analyse actualisée automatiquement"
                    : config.description}
                </p>
              </div>
            </div>
          </section>

          {requiresSingleAnimal && selectedAnimals.length > 1 ? (
            <Card
              role="alert"
              className="relative min-h-72 overflow-hidden rounded-[24px] border-dashed bg-muted/15 shadow-none"
            >
              <div className="relative z-10 mx-auto grid max-w-lg justify-items-center py-12 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-card text-primary shadow-surface">
                  <Icon name={config.icon} size={24} aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-xl font-semibold">
                  Sélectionnez un seul animal
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Le poids, la taille et l’alimentation sont des suivis
                  individuels qui ne peuvent pas être mélangés entre plusieurs
                  animaux.
                </p>
              </div>
            </Card>
          ) : !hasValidFilters ? (
            <Card className="relative min-h-72 overflow-hidden rounded-[24px] border-dashed bg-muted/15 shadow-none">
              <div
                aria-hidden="true"
                className="absolute inset-x-10 bottom-8 flex h-32 items-end gap-2 opacity-30"
              >
                {[35, 65, 48, 88, 58, 100, 76, 92].map((height, index) => (
                  <span
                    key={index}
                    className="flex-1 rounded-t-lg bg-primary"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="relative z-10 mx-auto grid max-w-lg justify-items-center py-12 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-card text-primary shadow-surface">
                  <BarChart3 className="size-6" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-xl font-semibold">
                  Choisissez ce que vous voulez comprendre
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Sélectionnez au moins un animal. L’analyse s’actualisera
                  ensuite à chaque changement de filtre.
                </p>
              </div>
            </Card>
          ) : (
            <section className="space-y-5" aria-live="polite">
              <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                    Analyse active
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">
                    {config.label}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedAnimals.length === 1
                      ? "1 animal"
                      : `${selectedAnimals.length} animaux`} ·{" "}
                    {formatPeriodDate(dateDebut)} — {formatPeriodDate(dateFin)}
                  </p>
                </div>
              </header>
              {includesSharedAnimals && (
                <div
                  role="status"
                  className="rounded-[16px] border border-info/30 bg-info/5 px-4 py-3 text-sm"
                >
                  <strong>Données partagées incluses.</strong> Certaines séries
                  peuvent être partielles selon les droits accordés par les
                  groupes.
                </div>
              )}
              {statistics.isPending ? (
                <div className="grid gap-5 xl:grid-cols-12">
                  <Skeleton className="h-[430px] rounded-[24px] xl:col-span-8" />
                  <Skeleton className="h-[430px] rounded-[24px] xl:col-span-4" />
                </div>
              ) : statistics.isError ? (
                <SystemState
                  state="error"
                  density="page"
                  title="Les statistiques sont indisponibles"
                  description="Vos paramètres sont conservés. Vous pouvez relancer le calcul."
                  primaryAction={{
                    label: "Réessayer",
                    onClick: () => void statistics.refetch(),
                  }}
                />
              ) : statistics.data ? (
                <>
                  <div className="grid gap-5 xl:grid-cols-12">
                    <ChartFrame
                      title={config.label}
                      description={config.description}
                    >
                      {"history" in statistics.data ? (
                        <LineChart
                          chart={statistics.data.statistic}
                          unit={config.unit}
                        />
                      ) : config.visual === "donut" ? (
                        <ExpenseDonut result={statistics.data} />
                      ) : config.visual === "heatmap" ? (
                        <EventActivityHeatmap
                          animals={animals}
                          dateDebut={dateDebut}
                          dateFin={dateFin}
                          label={config.label}
                          onOpenEvent={(event) => openEventDrawer(mapEventData(event))}
                          onUpdateAnimalImage={animalsQuery.updateAnimalImage}
                          result={statistics.data}
                        />
                      ) : (
                        <EventBars
                          result={statistics.data}
                          unit={config.unit}
                        />
                      )}
                    </ChartFrame>
                    {type === "alimentations" &&
                    "history" in statistics.data ? (
                      <FoodResultSummary result={statistics.data} />
                    ) : (
                      <ResultSummary result={statistics.data} config={config} />
                    )}
                  </div>
                  {type === "alimentations" &&
                  "history" in statistics.data ? (
                    <div className="space-y-5">
                      <FoodWeightComparison filters={activeFilters} />
                      <FoodHistorySections result={statistics.data} />
                    </div>
                  ) : type === "depenses" && !("history" in statistics.data) ? (
                    <ExpenseBreakdown
                      result={statistics.data}
                      animals={animals}
                      onUpdateAnimalImage={animalsQuery.updateAnimalImage}
                    />
                  ) : physicalEventTypes.has(type) && !("history" in statistics.data) ? (
                    <ActivityExactTable result={statistics.data} includeRanking={type === "concours"} />
                  ) : (
                    <ExactTable result={statistics.data} />
                  )}
                </>
              ) : null}
            </section>
          )}
        </>
      )}
    </PageShell>
  );
}
