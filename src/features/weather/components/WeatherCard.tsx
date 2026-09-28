"use client";

import { type FormEvent, useState } from "react";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  LocateFixed,
  MapPin,
  Search,
  Sun,
  Wind,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { WebApiError } from "@/shared/api/api-error";
import { Input } from "@/shared/components/ui/input";
import { searchWeatherLocations } from "../api/weather-api";
import { useWeatherQuery } from "../hooks/use-weather";
import type { WeatherLocation, WeatherQuery } from "../types/weather";

type LocationState = "idle" | "requesting" | "ready" | "denied" | "unavailable";

function condition(symbolCode: string) {
  const code = symbolCode.replace(/_(?:day|night|polartwilight)$/, "");
  if (code.includes("thunder"))
    return { label: "Orages", Icon: CloudLightning };
  if (code.includes("snow") || code.includes("sleet"))
    return { label: "Neige", Icon: CloudSnow };
  if (code.includes("rain")) return { label: "Pluie", Icon: CloudRain };
  if (code.includes("fog")) return { label: "Brouillard", Icon: CloudFog };
  if (code === "clearsky") return { label: "Ciel dégagé", Icon: Sun };
  if (code.includes("fair") || code.includes("partlycloudy"))
    return { label: "Éclaircies", Icon: CloudSun };
  return { label: "Nuageux", Icon: Cloud };
}

function activityHint(
  temperature: number,
  precipitation: number,
  windSpeed: number,
) {
  if (precipitation >= 1)
    return "Pluie attendue : prévoyez une protection adaptée pour les sorties.";
  if (windSpeed >= 40)
    return "Vent soutenu : vérifiez les conditions avant une activité extérieure.";
  if (temperature >= 28)
    return "Chaleur marquée : privilégiez les heures fraîches et prévoyez de l’eau.";
  if (temperature <= 2)
    return "Température basse : adaptez la durée et l’équipement des sorties.";
  return "Les conditions sont plutôt favorables aux activités extérieures.";
}

export function WeatherCard({ compact = false }: { compact?: boolean }) {
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [location, setLocation] = useState<WeatherQuery | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [locationSearchOpen, setLocationSearchOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationResults, setLocationResults] = useState<WeatherLocation[]>([]);
  const [locationSearchPending, setLocationSearchPending] = useState(false);
  const [locationSearchError, setLocationSearchError] = useState<string | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const weather = useWeatherQuery(location);

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationState("unavailable");
      return;
    }
    setLocationState("requesting");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({
          latitude: Math.round(coords.latitude * 100) / 100,
          longitude: Math.round(coords.longitude * 100) / 100,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        });
        setLocationAccuracy(coords.accuracy);
        setLocationState("ready");
      },
      (error) =>
        setLocationState(
          error.code === error.PERMISSION_DENIED ? "denied" : "unavailable",
        ),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 },
    );
  }

  async function submitLocationSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = locationSearch.trim();
    if (query.length < 2) return;
    setLocationSearchPending(true);
    setLocationSearchError(null);
    try {
      const results = await searchWeatherLocations(query);
      setLocationResults(results);
      if (!results.length) setLocationSearchError("Aucune ville trouvée. Précisez le nom ou le département.");
    } catch {
      setLocationResults([]);
      setLocationSearchError("La recherche de ville est temporairement indisponible.");
    } finally {
      setLocationSearchPending(false);
    }
  }

  function selectLocation(result: WeatherLocation) {
    setLocation({
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    });
    setLocationAccuracy(null);
    setLocationState("ready");
    setLocationSearchOpen(false);
    setLocationResults([]);
  }

  const locationSearchPanel = locationSearchOpen && (
    <div className="space-y-2 rounded-xl border bg-muted/25 p-3">
      <form className="flex gap-2" onSubmit={(event) => void submitLocationSearch(event)}>
        <Input
          value={locationSearch}
          onChange={(event) => setLocationSearch(event.target.value)}
          placeholder="Ville ou code postal"
          aria-label="Rechercher une ville pour la météo"
          className="h-9 min-w-0"
        />
        <Button type="submit" size="sm" loading={locationSearchPending} disabled={locationSearch.trim().length < 2}>
          <Search aria-hidden="true" className="size-4" />
          Rechercher
        </Button>
      </form>
      {locationSearchError && <p role="status" className="text-xs text-destructive">{locationSearchError}</p>}
      {locationResults.length > 0 && (
        <div className="grid gap-1" aria-label="Résultats de localisation">
          {locationResults.map((result) => (
            <button
              type="button"
              key={`${result.latitude}-${result.longitude}`}
              className="flex min-h-9 items-center gap-2 rounded-control px-2 text-left text-xs font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => selectLocation(result)}
            >
              <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-primary" />
              <span className="line-clamp-2">{result.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card className={`flex h-full min-h-0 flex-col gap-0 overflow-hidden py-0 ${compact ? "border-0 bg-transparent shadow-none" : "border-border/70 shadow-sm"}`}>
      {!compact && (
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b border-border/60 bg-muted/25 px-4 py-3 pr-14">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <CloudSun className="size-5" aria-hidden="true" />
          </span>
          <CardTitle role="heading" aria-level={2}>Météo locale</CardTitle>
        </CardHeader>
      )}
      <CardContent
        aria-live="polite"
        className={`min-h-0 flex-1 ${compact ? "overflow-visible p-0" : "overflow-y-auto p-3 sm:p-4"}`}
      >
        {locationState === "idle" && (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">
              Vasco utilise votre position approximative uniquement pour
              demander la météo. Elle n’est pas enregistrée.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={requestLocation}><LocateFixed className="size-4" /> Utiliser ma position</Button>
              <Button variant="outline" onClick={() => setLocationSearchOpen((open) => !open)}>Choisir une ville</Button>
            </div>
            {locationSearchPanel}
          </div>
        )}
        {locationState === "requesting" && (
          <p className="text-sm text-muted-foreground">
            Autorisez la géolocalisation dans votre navigateur…
          </p>
        )}
        {locationState === "denied" && (
          <div role="status" className="space-y-3">
            <p className="font-medium">Géolocalisation refusée</p>
            <p className="text-sm text-muted-foreground">
              Vous pouvez autoriser la localisation pour Vasco dans les réglages
              de votre navigateur, puis réessayer.
            </p>
            <Button variant="outline" onClick={requestLocation}>
              Réessayer
            </Button>
          </div>
        )}
        {locationState === "unavailable" && (
          <div role="status" className="space-y-3">
            <p className="font-medium">Localisation indisponible</p>
            <p className="text-sm text-muted-foreground">
              Votre position n’a pas pu être obtenue. Vérifiez les réglages du
              navigateur ou réessayez plus tard.
            </p>
            <Button variant="outline" onClick={requestLocation}>
              Réessayer
            </Button>
          </div>
        )}
        {locationState === "ready" && weather.isPending && (
          <p className="text-sm text-muted-foreground">
            Chargement des prévisions…
          </p>
        )}
        {locationState === "ready" && weather.isError && (
          <div role="alert" className="space-y-3">
            <p className="font-medium">
              {weather.error instanceof WebApiError &&
              weather.error.code === "WEATHER_NOT_CONFIGURED"
                ? "Météo non configurée"
                : "Météo indisponible"}
            </p>
            <p className="text-sm text-muted-foreground">
              {weather.error instanceof Error
                ? weather.error.message
                : "Les prévisions ne peuvent pas être chargées."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => void weather.refetch()}>
                Réessayer
              </Button>
              <Button variant="ghost" onClick={requestLocation}>
                Actualiser la position
              </Button>
            </div>
          </div>
        )}
        {locationState === "ready" &&
          weather.data &&
          (() => {
            const currentCondition = condition(weather.data.current.symbolCode);
            const CurrentIcon = currentCondition.Icon;
            return (
              <div className="space-y-3">
                <section className={compact ? "rounded-surface bg-primary/5 px-3 py-2.5" : "rounded-surface bg-primary/5 p-3"}>
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <p className="flex min-w-0 items-center gap-1.5 text-sm font-semibold">
                      <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="truncate">
                        {weather.data.location?.label ?? "Votre position actuelle"}
                      </span>
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-auto shrink-0 px-2 py-1 text-xs"
                      onClick={requestLocation}
                    >
                      Actualiser
                    </Button>
                  </div>
                  {locationAccuracy !== null && locationAccuracy >= 1_000 && (
                    <p className="mb-2 text-xs font-medium text-warning-foreground">
                      Position navigateur approximative à ±{locationAccuracy >= 10_000 ? `${Math.round(locationAccuracy / 1_000)} km` : `${Math.round(locationAccuracy)} m`}.
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    <CurrentIcon className="size-9 text-primary" />
                    <div>
                      <p className="text-2xl font-bold tabular-nums">
                        {weather.data.current.temperature} °C
                      </p>
                      <p className="text-sm font-medium">
                        {currentCondition.label}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Droplets className="size-3.5" />{" "}
                      {weather.data.current.humidity} %
                    </span>
                    <span className="flex items-center gap-1">
                      <Wind className="size-3.5" />{" "}
                      {weather.data.current.windSpeed} m/s
                    </span>
                    <span>
                      Pluie {weather.data.current.precipitationNextHour} mm
                    </span>
                  </div>
                  {weather.data.location && (
                    <a
                      className="mt-2 inline-block text-[11px] text-muted-foreground underline-offset-2 hover:underline"
                      href={weather.data.location.attribution.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {weather.data.location.attribution.label}
                    </a>
                  )}
                </section>
                <div className="flex flex-wrap gap-1">
                  {!compact && <Button type="button" size="sm" variant="ghost" aria-expanded={detailsExpanded} onClick={() => setDetailsExpanded((value) => !value)}>
                    {detailsExpanded ? "Masquer les prévisions" : "Voir les prévisions"}
                  </Button>}
                  <Button type="button" size="sm" variant="ghost" aria-expanded={locationSearchOpen} onClick={() => setLocationSearchOpen((open) => !open)}>
                    Choisir une autre ville
                  </Button>
                </div>
                {locationSearchPanel}
                {!compact && detailsExpanded && (
                  <div className="space-y-3">
                    <section>
                      <h3 className="mb-2 font-semibold">Prévisions</h3>
                      <div className="grid gap-2">
                        {weather.data.days.map((day) => {
                          const item = condition(day.symbolCode);
                          const Icon = item.Icon;
                          return (
                            <article
                              key={day.date}
                              className="flex items-center justify-between gap-2 rounded-control border p-2"
                            >
                              <div>
                                <p className="text-sm font-medium">
                                  {new Date(
                                    `${day.date}T12:00:00`,
                                  ).toLocaleDateString("fr-FR", {
                                    weekday: "short",
                                    day: "numeric",
                                  })}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.label}
                                </p>
                              </div>
                              <Icon className="size-5 shrink-0 text-primary" />
                              <p className="text-sm font-semibold tabular-nums">
                                {day.temperatureMin}° / {day.temperatureMax}°
                              </p>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                    <p className="rounded-control bg-muted p-3 text-xs">
                      {activityHint(
                        weather.data.current.temperature,
                        weather.data.days[0]?.precipitation ?? 0,
                        weather.data.days[0]?.windSpeedMax ?? 0,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Position arrondie, non enregistrée ·{" "}
                      <a
                        className="underline"
                        href={weather.data.attribution.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {weather.data.attribution.label}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
      </CardContent>
    </Card>
  );
}
