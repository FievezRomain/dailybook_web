'use client'

import { CalendarDays, PawPrint, Sparkles } from 'lucide-react'
import * as React from 'react'

import { useAnimalFormDrawer } from '@/features/animals/context/animal-form-drawer-context'
import { Button } from '@/shared/components/ui/button'
import { PageShell } from '@/shared/components/layout/PageShell'
import { getLocalDateString } from '@/shared/utils/dates'

const storageKey = 'vasco:onboarding-complete'
const changeEvent = 'vasco:onboarding-change'

function readComplete() {
  return window.localStorage.getItem(storageKey) === 'true'
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(changeEvent, onStoreChange)
  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(changeEvent, onStoreChange)
  }
}

export function useOnboardingComplete() {
  const complete = React.useSyncExternalStore(subscribe, readComplete, () => false)
  const setComplete = React.useCallback(() => {
    window.localStorage.setItem(storageKey, 'true')
    window.dispatchEvent(new Event(changeEvent))
  }, [])
  return { complete, setComplete }
}

export function FirstAccessOnboarding({ onSkip }: { onSkip: () => void }) {
  const { openDrawer } = useAnimalFormDrawer()

  return (
    <PageShell aria-labelledby="onboarding-title" className="space-y-8">
      <div className="h-3 overflow-hidden rounded-full bg-accent" aria-hidden="true"><div className="h-full w-1/3 rounded-full bg-primary" /></div>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_392px]">
        <div className="space-y-3">
          <p className="text-xs font-bold tracking-[0.08em] text-primary">ÉTAPE 1 SUR 3</p>
          <h2 id="onboarding-title" className="text-[clamp(2rem,5vw,2.375rem)] font-bold leading-tight">Bienvenue dans votre espace Vasco.</h2>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">En quelques instants, créez un espace qui suit vraiment le quotidien de vos animaux.</p>
        </div>
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[28px] bg-primary p-8 text-center text-primary-foreground lg:min-h-[300px]">
          <Sparkles aria-hidden="true" className="mb-6 size-16" />
          <p className="text-2xl font-bold">Un espace<br />à votre rythme</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[374px_374px_minmax(280px,1fr)]">
        <article className="rounded-[24px] bg-card p-8 shadow-surface">
          <PawPrint aria-hidden="true" className="mb-5 size-10 text-primary" />
          <h3 className="text-xl font-bold">Ajoutez un animal</h3>
          <p className="mt-2 text-sm text-muted-foreground">Commencez par celui qui vous accompagne au quotidien.</p>
          <p className="mt-8 text-xs font-semibold text-primary">Profil, santé, suivi physique</p>
        </article>
        <article className="rounded-[24px] bg-card p-8 shadow-surface">
          <CalendarDays aria-hidden="true" className="mb-5 size-10 text-primary" />
          <h3 className="text-xl font-bold">Organisez votre agenda</h3>
          <p className="mt-2 text-sm text-muted-foreground">Rendez-vous, soins et routines restent au même endroit.</p>
          <p className="mt-8 text-xs font-semibold text-primary">Événements, rappels, partage</p>
        </article>
        <aside className="rounded-[24px] bg-info/15 p-8 md:col-span-2 lg:col-span-1">
          <h3 className="text-xl font-bold">Votre vue, vos priorités</h3>
          <p className="mt-3 text-sm text-muted-foreground">L’accueil s’adapte à vos besoins et garde vos informations essentielles à portée de main.</p>
        </aside>
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <Button size="lg" onClick={() => openDrawer({ initialAnimal: { datenaissance: getLocalDateString() } })}>Commencer avec un animal <span aria-hidden="true">→</span></Button>
        <Button variant="ghost" onClick={onSkip}>Passer cette étape</Button>
      </div>
      <p className="text-sm text-muted-foreground">Vous pourrez tout modifier plus tard.</p>
    </PageShell>
  )
}
