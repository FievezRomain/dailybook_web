import { LoaderCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

function Spinner({ className, label, size = 'medium', tone = 'brand' }: { className?: string; label?: string; size?: 'small' | 'medium' | 'large'; tone?: 'brand' | 'neutral' }) {
  return <span role="status" aria-label={label ? undefined : 'Chargement'} className={cn('inline-flex items-center gap-2', tone === 'brand' ? 'text-primary' : 'text-muted-foreground', className)}>
    <LoaderCircle aria-hidden="true" className={cn('animate-spin motion-reduce:animate-none', size === 'small' && 'size-4', size === 'medium' && 'size-6', size === 'large' && 'size-8')} />
    {label && <span className="text-xs font-medium text-foreground">{label}</span>}
  </span>
}

export { Spinner }
