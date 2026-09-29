'use client';

import { Eye } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useColorVisionMode } from '@/shared/theme/color-vision';

export function ColorVisionToggle() {
  const { mode, setMode } = useColorVisionMode();
  const enabled = mode === 'accessible';

  return (
    <Button
      type="button"
      variant={enabled ? 'secondary' : 'ghost'}
      size="icon"
      aria-pressed={enabled}
      title={enabled ? 'Désactiver les couleurs accessibles' : 'Activer les couleurs accessibles'}
      onClick={() => setMode(enabled ? 'standard' : 'accessible')}
    >
      <Eye className="size-5" aria-hidden="true" />
      <span className="sr-only">{enabled ? 'Désactiver' : 'Activer'} le mode couleurs accessibles</span>
    </Button>
  );
}
