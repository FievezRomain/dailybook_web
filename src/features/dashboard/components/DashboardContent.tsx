'use client';

import GridCards from "./GridCards";
import { useAnimalsQuery } from '@/features/animals/hooks/use-animals';
import { FirstAccessOnboarding, useOnboardingComplete } from './FirstAccessOnboarding';
import { GroupOnboarding } from '@/features/groups/components/GroupOnboarding';
import { PageShell } from '@/shared/components/layout/PageShell';
import * as React from 'react';

export default function DashboardContent() {
        const animalsQuery = useAnimalsQuery();
        const { complete: onboardingComplete, setComplete: completeOnboarding } = useOnboardingComplete();

        React.useEffect(() => {
          if (!animalsQuery.isLoading && animalsQuery.animals?.length) completeOnboarding();
        }, [animalsQuery.animals, animalsQuery.isLoading, completeOnboarding]);

        if (!animalsQuery.isLoading && !animalsQuery.isError && !animalsQuery.animals?.length && !onboardingComplete) {
          return <FirstAccessOnboarding onSkip={completeOnboarding} />;
        }

        return <PageShell className="space-y-4"><GroupOnboarding /><GridCards /></PageShell>;
}
