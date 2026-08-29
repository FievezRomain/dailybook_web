'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Check, Crown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { cn } from '@/lib/utils';
import { premiumFeatures, type PremiumFeatureKey } from '@/shared/premium/premium-features';
import { isPremiumRequiredError } from '@/shared/premium/premium-error';
import { useCurrentUser } from '@/features/user/hooks/use-current-user';

type PremiumDialogContextValue = {
  openPremiumDialog: (feature: PremiumFeatureKey) => void;
};

const PremiumDialogContext = createContext<PremiumDialogContextValue | null>(null);

export function PremiumDialogProvider({ children }: { children: ReactNode }) {
  const [feature, setFeature] = useState<PremiumFeatureKey | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const content = feature ? premiumFeatures[feature] : null;

  function close() {
    setFeature(null);
    setShowComparison(false);
  }

  return (
    <PremiumDialogContext.Provider value={{ openPremiumDialog: (nextFeature) => { setFeature(nextFeature); setShowComparison(false); } }}>
      {children}
      <Dialog open={feature !== null} onOpenChange={(open) => { if (!open) close(); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Crown className="size-5" /></div>
            <DialogTitle>{content?.title} · Premium</DialogTitle>
            <DialogDescription>{content?.description}</DialogDescription>
          </DialogHeader>

          {showComparison && (
            <div className="grid gap-3 sm:grid-cols-2" aria-label="Comparatif des abonnements">
              <section className="rounded-overlay border p-surface">
                <h3 className="font-semibold">Gratuit</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0" /> Animaux, événements et historique</li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0" /> Participation aux groupes invités</li>
                </ul>
              </section>
              <section className="rounded-overlay border border-primary/40 bg-primary/5 p-surface">
                <h3 className="flex items-center gap-2 font-semibold"><Crown className="size-4 text-primary" /> Premium</h3>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /> Statistiques et tendances</li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /> Création et gestion des groupes</li>
                  <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" /> Documents médicaux et suivi photo</li>
                </ul>
              </section>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={close}>Plus tard</Button>
            {showComparison ? (
              <Button asChild><Link href="/profile" onClick={close}>Voir mon abonnement</Link></Button>
            ) : (
              <Button onClick={() => setShowComparison(true)}>Comparer les offres</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PremiumDialogContext.Provider>
  );
}

export function usePremiumDialog() {
  const context = useContext(PremiumDialogContext);
  if (!context) throw new Error('usePremiumDialog doit être utilisé dans PremiumDialogProvider.');
  return context;
}

export function usePremiumGate() {
  const { openPremiumDialog } = usePremiumDialog();
  const { refetch } = useCurrentUser();

  return {
    openPremiumDialog,
    async handlePremiumError(error: unknown, feature: PremiumFeatureKey) {
      if (!isPremiumRequiredError(error)) return false;
      await refetch();
      openPremiumDialog(feature);
      return true;
    },
  };
}

export function PremiumNotice({ feature, className, compact = false }: {
  feature: PremiumFeatureKey;
  className?: string;
  compact?: boolean;
}) {
  const { openPremiumDialog } = usePremiumDialog();
  const content = premiumFeatures[feature];

  return (
    <div className={cn('rounded-overlay border border-primary/30 bg-primary/5 p-4', compact && 'p-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 font-medium"><Crown className="size-4 text-primary" /> {content.title} · Premium</p>
          {!compact && <p className="mt-1 text-sm text-muted-foreground">{content.description}</p>}
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => openPremiumDialog(feature)}>En savoir plus</Button>
      </div>
    </div>
  );
}
