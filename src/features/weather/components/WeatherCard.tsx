'use client';

import { useState } from 'react';
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Droplets, LocateFixed, Sun, Wind } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { WebApiError } from '@/shared/api/api-error';
import { useWeatherQuery } from '../hooks/use-weather';
import type { WeatherQuery } from '../types/weather';

type LocationState = 'idle' | 'requesting' | 'ready' | 'denied' | 'unavailable';

function condition(symbolCode: string) {
  const code = symbolCode.replace(/_(?:day|night|polartwilight)$/, '');
  if (code.includes('thunder')) return { label: 'Orages', Icon: CloudLightning };
  if (code.includes('snow') || code.includes('sleet')) return { label: 'Neige', Icon: CloudSnow };
  if (code.includes('rain')) return { label: 'Pluie', Icon: CloudRain };
  if (code.includes('fog')) return { label: 'Brouillard', Icon: CloudFog };
  if (code === 'clearsky') return { label: 'Ciel dégagé', Icon: Sun };
  if (code.includes('fair') || code.includes('partlycloudy')) return { label: 'Éclaircies', Icon: CloudSun };
  return { label: 'Nuageux', Icon: Cloud };
}

function activityHint(temperature: number, precipitation: number, windSpeed: number) {
  if (precipitation >= 1) return 'Pluie attendue : prévoyez une protection adaptée pour les sorties.';
  if (windSpeed >= 40) return 'Vent soutenu : vérifiez les conditions avant une activité extérieure.';
  if (temperature >= 28) return 'Chaleur marquée : privilégiez les heures fraîches et prévoyez de l’eau.';
  if (temperature <= 2) return 'Température basse : adaptez la durée et l’équipement des sorties.';
  return 'Les conditions sont plutôt favorables aux activités extérieures.';
}

export function WeatherCard() {
  const [locationState, setLocationState] = useState<LocationState>('idle');
  const [location, setLocation] = useState<WeatherQuery | null>(null);
  const weather = useWeatherQuery(location);

  function requestLocation() {
    if (!navigator.geolocation) { setLocationState('unavailable'); return; }
    setLocationState('requesting');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({
          latitude: Math.round(coords.latitude * 100) / 100,
          longitude: Math.round(coords.longitude * 100) / 100,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        });
        setLocationState('ready');
      },
      (error) => setLocationState(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable'),
      { enableHighAccuracy: false, maximumAge: 15 * 60_000, timeout: 10_000 },
    );
  }

  return <Card className="overflow-hidden">
    <CardHeader><CardTitle className="flex items-center gap-2"><CloudSun className="size-5" /> Météo locale</CardTitle></CardHeader>
    <CardContent aria-live="polite">
      {locationState === 'idle' && <div className="flex flex-col items-start gap-3"><p className="text-sm text-muted-foreground">Vasco utilise votre position approximative uniquement pour demander la météo. Elle n’est pas enregistrée.</p><Button onClick={requestLocation}><LocateFixed className="size-4" /> Utiliser ma position</Button></div>}
      {locationState === 'requesting' && <p className="text-sm text-muted-foreground">Autorisez la géolocalisation dans votre navigateur…</p>}
      {locationState === 'denied' && <div role="status" className="space-y-3"><p className="font-medium">Géolocalisation refusée</p><p className="text-sm text-muted-foreground">Vous pouvez autoriser la localisation pour Vasco dans les réglages de votre navigateur, puis réessayer.</p><Button variant="outline" onClick={requestLocation}>Réessayer</Button></div>}
      {locationState === 'unavailable' && <div role="status" className="space-y-3"><p className="font-medium">Localisation indisponible</p><p className="text-sm text-muted-foreground">Votre position n’a pas pu être obtenue. Vérifiez les réglages du navigateur ou réessayez plus tard.</p><Button variant="outline" onClick={requestLocation}>Réessayer</Button></div>}
      {locationState === 'ready' && weather.isPending && <p className="text-sm text-muted-foreground">Chargement des prévisions…</p>}
      {locationState === 'ready' && weather.isError && <div role="alert" className="space-y-3"><p className="font-medium">{weather.error instanceof WebApiError && weather.error.code === 'WEATHER_NOT_CONFIGURED' ? 'Météo non configurée' : 'Météo indisponible'}</p><p className="text-sm text-muted-foreground">{weather.error instanceof Error ? weather.error.message : 'Les prévisions ne peuvent pas être chargées.'}</p><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => void weather.refetch()}>Réessayer</Button><Button variant="ghost" onClick={requestLocation}>Actualiser la position</Button></div></div>}
      {locationState === 'ready' && weather.data && (() => {
        const currentCondition = condition(weather.data.current.symbolCode);
        const CurrentIcon = currentCondition.Icon;
        return <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_2fr]">
            <section className="rounded-surface bg-primary/5 p-surface"><div className="flex items-center gap-3"><CurrentIcon className="size-10 text-primary" /><div><p className="text-3xl font-bold tabular-nums">{weather.data.current.temperature} °C</p><p className="font-medium">{currentCondition.label}</p></div></div><div className="mt-4 grid grid-cols-3 gap-2 text-sm"><span className="flex items-center gap-1"><Droplets className="size-4" /> {weather.data.current.humidity} %</span><span className="flex items-center gap-1"><Wind className="size-4" /> {weather.data.current.windSpeed} m/s</span><span>Pluie : {weather.data.current.precipitationNextHour} mm</span></div></section>
            <section><h3 className="mb-3 font-semibold">Prévisions</h3><div className="grid gap-3 sm:grid-cols-3">{weather.data.days.map((day) => { const item = condition(day.symbolCode); const Icon = item.Icon; return <article key={day.date} className="rounded-surface border p-3"><p className="font-medium">{new Date(`${day.date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}</p><div className="my-2 flex items-center gap-2"><Icon className="size-5 text-primary" /><span className="text-sm">{item.label}</span></div><p className="font-semibold tabular-nums">{day.temperatureMin}° / {day.temperatureMax}°</p><p className="mt-1 text-xs text-muted-foreground">Pluie {day.precipitation} mm · Vent {day.windSpeedMax} m/s</p></article>; })}</div></section>
          </div>
          <p className="rounded-control bg-muted p-3 text-sm">{activityHint(weather.data.current.temperature, weather.data.days[0]?.precipitation ?? 0, weather.data.days[0]?.windSpeedMax ?? 0)}</p>
          <p className="text-xs text-muted-foreground">Position arrondie, non enregistrée · <a className="underline" href={weather.data.attribution.url} target="_blank" rel="noopener noreferrer">{weather.data.attribution.label}</a></p>
        </div>;
      })()}
    </CardContent>
  </Card>;
}
