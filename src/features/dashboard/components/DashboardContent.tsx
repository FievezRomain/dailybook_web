'use client';

import GridCards from "./GridCards";
import { useAnimalsQuery } from '@/features/animals/hooks/use-animals';
import { FirstAccessOnboarding, useOnboardingComplete } from './FirstAccessOnboarding';
import { GroupOnboarding } from '@/features/groups/components/GroupOnboarding';
import { PageShell } from '@/shared/components/layout/PageShell';
import { WeatherCard } from '@/features/weather/components/WeatherCard';
import { useCurrentUser } from '@/features/user/hooks/use-current-user';
import * as React from 'react';

function formatHomeDate(date: Date) {
  const formatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
  return formatted.charAt(0).toLocaleUpperCase('fr-FR') + formatted.slice(1);
}

export default function DashboardContent() {
  const animalsQuery = useAnimalsQuery();
  const { user } = useCurrentUser();
  const { complete: onboardingComplete, setComplete: completeOnboarding } = useOnboardingComplete();
  const firstName = user?.name?.trim().split(/\s+/)[0];

  React.useEffect(() => {
    if (!animalsQuery.isLoading && animalsQuery.animals?.length) completeOnboarding();
  }, [animalsQuery.animals, animalsQuery.isLoading, completeOnboarding]);

  if (!animalsQuery.isLoading && !animalsQuery.isError && !animalsQuery.animals?.length && !onboardingComplete) {
    return <FirstAccessOnboarding onSkip={completeOnboarding} />;
  }

  return (
    <PageShell className="space-y-4">
      <section aria-labelledby="home-greeting" className="grid items-stretch gap-4 px-3 lg:grid-cols-[minmax(16rem,0.7fr)_minmax(0,1.3fr)]">
        <div className="flex flex-col justify-center py-2">
          <h1 id="home-greeting" className="text-xl font-bold tracking-tight sm:text-2xl">
            Bonjour{firstName ? ` ${firstName}` : ''}
          </h1>
          <time dateTime={new Date().toISOString().slice(0, 10)} className="mt-1 text-sm font-normal capitalize text-muted-foreground sm:text-base">
            {formatHomeDate(new Date())}
          </time>
        </div>
        <WeatherCard compact />
      </section>
      <GroupOnboarding />
      <GridCards />
    </PageShell>
  );
}
