'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Crown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { PremiumComparison, PremiumNotice as PremiumNoticePrimitive } from '@/shared/components/ui/premium';
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
        <DialogContent className="sm:max-w-[860px]">
          <DialogHeader>
            <div className="mb-1 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Crown className="size-5" /></div>
            <DialogTitle>{content?.title} · Premium</DialogTitle>
            <DialogDescription>{content?.description}</DialogDescription>
          </DialogHeader>

          {showComparison && (
            <PremiumComparison
              layout="wide"
              essentialAction={<Button variant="outline" onClick={close}>Conserver Essentiel</Button>}
              premiumAction={<Button asChild><Link href="/profile" onClick={close}>Voir mon abonnement</Link></Button>}
            />
          )}

          {!showComparison && <DialogFooter>
            <Button variant="ghost" onClick={close}>Plus tard</Button>
            <Button onClick={() => setShowComparison(true)}>Comparer les offres</Button>
          </DialogFooter>}
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
    <PremiumNoticePrimitive className={className} context={compact ? 'card' : 'inline'} title={content.title} description={content.description} onAction={() => openPremiumDialog(feature)} />
  );
}
