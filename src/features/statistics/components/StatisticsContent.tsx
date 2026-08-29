'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BarChart3, CalendarRange } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { PremiumNotice, usePremiumGate } from '@/shared/components/feedback/PremiumGate';
import { PageHeader, PageShell, PageTitle } from '@/shared/components/layout/PageShell';
import { useCurrentUser } from '@/features/user/hooks/use-current-user';
import { useAnimalsQuery } from '@/features/animals/hooks/use-animals';
import { useStatisticsQuery } from '../hooks/use-statistics';
import type { EventStatistics, PhysicalStatistics, StatisticsChart, StatisticsQueryInput, StatisticsType } from '../types/statistics';

const statisticTypes: { value: StatisticsType; label: string }[] = [
  { value: 'depenses', label: 'Dépenses' }, { value: 'entrainements', label: 'Entraînements' },
  { value: 'balades', label: 'Balades' }, { value: 'poids', label: 'Poids' },
  { value: 'tailles', label: 'Taille' }, { value: 'alimentations', label: 'Alimentation' },
  { value: 'concours', label: 'Concours' },
];

function defaultDates() {
  const end = new Date();
  const start = new Date(end);
  start.setMonth(start.getMonth() - 3);
  const format = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return { dateDebut: format(start), dateFin: format(end) };
}

function AccessibleChart({ chart }: { chart: StatisticsChart }) {
  const values = chart.datasets.flatMap((dataset) => dataset.data).filter((value): value is number => value !== null);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;
  const x = (index: number) => chart.labels.length <= 1 ? 50 : 5 + (index / (chart.labels.length - 1)) * 90;
  const y = (value: number) => 95 - ((value - min) / range) * 90;

  return <div className="space-y-4">
    <svg viewBox="0 0 100 100" className="h-64 w-full overflow-visible text-primary" role="img" aria-label="Évolution des valeurs sur la période">
      <line x1="5" y1="95" x2="95" y2="95" className="stroke-border" strokeWidth="0.8" />
      {chart.datasets.map((dataset, datasetIndex) => {
        const points = dataset.data.map((value, index) => value === null ? null : `${x(index)},${y(value)}`).filter(Boolean).join(' ');
        return <g key={`${dataset.label ?? 'série'}-${datasetIndex}`} className={datasetIndex % 2 ? 'text-foreground' : 'text-primary'}>
          <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray={datasetIndex % 2 ? '4 2' : undefined} vectorEffect="non-scaling-stroke" />
          {dataset.data.map((value, index) => value === null ? null : <circle key={index} cx={x(index)} cy={y(value)} r="1.5" fill="currentColor"><title>{`${dataset.label ?? 'Valeur'}, ${chart.labels[index] ?? index + 1} : ${value}`}</title></circle>)}
        </g>;
      })}
    </svg>
    <div className="overflow-x-auto"><table className="w-full min-w-lg text-left text-sm"><caption className="sr-only">Valeurs détaillées du graphique</caption><thead><tr className="border-b"><th className="p-2">Période</th>{chart.datasets.map((dataset, index) => <th key={index} className="p-2">{dataset.label || `Série ${index + 1}`}</th>)}</tr></thead><tbody>{chart.labels.map((label, labelIndex) => <tr key={`${label}-${labelIndex}`} className="border-b"><th className="p-2 font-medium">{label || `Point ${labelIndex + 1}`}</th>{chart.datasets.map((dataset, datasetIndex) => <td key={datasetIndex} className="p-2 tabular-nums">{dataset.data[labelIndex] ?? '—'}</td>)}</tr>)}</tbody></table></div>
  </div>;
}

function PhysicalResult({ result }: { result: PhysicalStatistics }) {
  return <div className="space-y-6"><AccessibleChart chart={result.statistic} /><div><h3 className="mb-3 font-semibold">Historique détaillé</h3>{result.history.length ? <div className="overflow-x-auto"><table className="w-full min-w-lg text-left text-sm"><thead><tr className="border-b"><th className="p-2">Date</th><th className="p-2">Valeur</th><th className="p-2">Unité</th></tr></thead><tbody>{result.history.map((entry) => <tr key={entry.id} className="border-b"><td className="p-2">{new Date(`${entry.date}T12:00:00`).toLocaleDateString('fr-FR')}</td><td className="p-2 tabular-nums">{entry.value}</td><td className="p-2">{entry.unity || '—'}</td></tr>)}</tbody></table></div> : <p className="text-sm text-muted-foreground">Aucune mesure sur cette période.</p>}</div></div>;
}

function EventResult({ result }: { result: EventStatistics }) {
  if (!result.statistic.length) return <p className="text-sm text-muted-foreground">Aucun événement sur cette période.</p>;
  return <div className="overflow-x-auto"><table className="w-full min-w-lg text-left text-sm"><caption className="sr-only">Résultats statistiques détaillés</caption><thead><tr className="border-b"><th className="p-2">Date</th><th className="p-2">Indicateur</th><th className="p-2">Nombre</th><th className="p-2">Valeur exacte</th></tr></thead><tbody>{result.statistic.map((item, index) => <tr key={`${item.date ?? 'résultat'}-${index}`} className="border-b"><td className="p-2">{item.date ? new Date(`${item.date}T12:00:00`).toLocaleDateString('fr-FR') : '—'}</td><td className="p-2">{item.name || 'Résultat'}</td><td className="p-2 tabular-nums">{item.count ?? item.events.length}</td><td className="p-2 tabular-nums">{item.exact_value ?? item.value ?? '—'}</td></tr>)}</tbody></table></div>;
}

export default function StatisticsContent() {
  const { isPremium, isLoading: isUserLoading } = useCurrentUser();
  const animalsQuery = useAnimalsQuery();
  const { handlePremiumError } = usePremiumGate();
  const initialDates = useMemo(() => defaultDates(), []);
  const [type, setType] = useState<StatisticsType>('depenses');
  const [selectedAnimals, setSelectedAnimals] = useState<number[]>([]);
  const [dateDebut, setDateDebut] = useState(initialDates.dateDebut);
  const [dateFin, setDateFin] = useState(initialDates.dateFin);
  const [submitted, setSubmitted] = useState<StatisticsQueryInput | null>(null);
  const input = submitted ?? { animaux: [], dateDebut, dateFin };
  const statistics = useStatisticsQuery(type, input, Boolean(isPremium && submitted));
  const handledError = useRef<unknown>(undefined);

  useEffect(() => {
    if (!statistics.error || handledError.current === statistics.error) return;
    handledError.current = statistics.error;
    void handlePremiumError(statistics.error, 'statistics');
  }, [statistics.error, handlePremiumError]);

  if (isUserLoading) return <PageShell><p aria-live="polite">Chargement des droits…</p></PageShell>;

  return <PageShell className="pb-24">
    <PageHeader><div><PageTitle>Statistiques</PageTitle><p className="text-muted-foreground">Analysez les tendances du suivi de vos animaux sur une période choisie.</p></div><span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"><BarChart3 className="size-4" /> Premium</span></PageHeader>
    {!isPremium ? <PremiumNotice feature="statistics" /> : <>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><CalendarRange className="size-5" /> Filtres</CardTitle></CardHeader><CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2"><span className="text-sm font-medium">Indicateur</span><select className="h-9 rounded-control border bg-background px-3 text-sm" value={type} onChange={(event) => { setType(event.target.value as StatisticsType); setSubmitted(null); }}>{statisticTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label className="grid gap-2"><span className="text-sm font-medium">Du</span><Input type="date" value={dateDebut} max={dateFin} onChange={(event) => { setDateDebut(event.target.value); setSubmitted(null); }} /></label>
          <label className="grid gap-2"><span className="text-sm font-medium">Au</span><Input type="date" value={dateFin} min={dateDebut} onChange={(event) => { setDateFin(event.target.value); setSubmitted(null); }} /></label>
        </div>
        <fieldset><legend className="mb-2 text-sm font-medium">Animaux</legend>{animalsQuery.isLoading ? <p className="text-sm text-muted-foreground">Chargement des animaux…</p> : animalsQuery.isError ? <div role="alert"><p className="text-sm text-destructive">Les animaux sont indisponibles.</p><Button className="mt-2" size="sm" variant="outline" onClick={() => void animalsQuery.refetch()}>Réessayer</Button></div> : !animalsQuery.animals?.length ? <p className="text-sm text-muted-foreground">Ajoutez un animal avant de calculer des statistiques.</p> : <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{animalsQuery.animals.map((animal) => <label key={animal.id} className="flex cursor-pointer items-center gap-3 rounded-control border p-3"><input type="checkbox" checked={selectedAnimals.includes(animal.id)} onChange={(event) => { setSelectedAnimals((current) => event.target.checked ? [...current, animal.id] : current.filter((id) => id !== animal.id)); setSubmitted(null); }} /><span><span className="block font-medium">{animal.nom || 'Animal sans nom'}</span><span className="block text-xs text-muted-foreground">{animal.provenance === 'shared' ? 'Partagé' : 'Propriétaire'}</span></span></label>)}</div>}</fieldset>
        <Button disabled={!selectedAnimals.length || !dateDebut || !dateFin || dateDebut > dateFin} onClick={() => setSubmitted({ animaux: selectedAnimals, dateDebut, dateFin })}>Afficher les statistiques</Button>
      </CardContent></Card>

      {submitted && <Card aria-live="polite"><CardHeader><CardTitle>{statisticTypes.find((item) => item.value === type)?.label}</CardTitle></CardHeader><CardContent>{statistics.isPending ? <p className="text-muted-foreground">Calcul des statistiques…</p> : statistics.isError ? <div role="alert"><p>Les statistiques sont indisponibles.</p><Button className="mt-2" variant="outline" onClick={() => void statistics.refetch()}>Réessayer</Button></div> : statistics.data && 'history' in statistics.data ? <PhysicalResult result={statistics.data} /> : statistics.data ? <EventResult result={statistics.data} /> : null}</CardContent></Card>}
    </>}
  </PageShell>;
}
