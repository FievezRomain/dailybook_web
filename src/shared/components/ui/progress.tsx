"use client"

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    value={value}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-transform duration-[var(--motion-base)] ease-[var(--ease-standard)] motion-reduce:transition-none"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

function ProgressDisplay({ className, label = 'Import en cours', status = 'active', value = 0, variant = 'linear' }: { className?: string; label?: string; status?: 'active' | 'complete' | 'error'; value?: number; variant?: 'linear' | 'circular' }) {
  const normalizedValue = status === 'complete' ? 100 : Math.min(100, Math.max(0, value))
  const valueText = status === 'error' ? 'Erreur' : `${normalizedValue} %`
  const statusLabel = status === 'complete' ? 'Terminé' : status === 'error' ? 'Réessayer' : 'En cours'

  if (variant === 'circular') return <div data-slot="progress-display" className={cn('grid w-[120px] justify-items-center gap-3', className)} aria-live="polite">
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={status === 'error' ? undefined : normalizedValue} aria-valuetext={valueText} className={cn('grid size-[88px] place-items-center rounded-full', status === 'complete' ? 'text-success' : status === 'error' ? 'text-destructive' : 'text-primary')} style={{ background: `conic-gradient(currentColor ${normalizedValue * 3.6}deg, var(--muted) 0deg)` }}><span className="grid size-[72px] place-items-center rounded-full bg-background text-lg font-semibold">{status === 'error' ? '!' : valueText}</span></div>
    <span className="text-xs font-medium text-muted-foreground">{statusLabel}</span>
  </div>

  return <div data-slot="progress-display" className={cn('grid w-80 gap-2', className)} aria-live="polite"><div className="flex items-center justify-between gap-3 text-xs"><span className="font-medium">{status === 'complete' ? 'Import terminé' : status === 'error' ? 'Import interrompu' : label}</span><span className={cn('font-semibold', status === 'complete' ? 'text-success' : status === 'error' ? 'text-destructive' : 'text-primary')}>{valueText}</span></div><Progress value={normalizedValue} aria-label={label} aria-valuetext={valueText} className={cn(status === 'complete' && '[&>div]:bg-success', status === 'error' && 'bg-destructive/15 [&>div]:bg-destructive')} /></div>
}

export { Progress, ProgressDisplay }
