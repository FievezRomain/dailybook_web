import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

export function RatingStars({
  activeClassName = 'fill-primary text-primary',
  className,
  value,
}: {
  activeClassName?: string
  className?: string
  value: number
}) {
  const rating = Math.max(0, Math.min(5, Math.round(value)))

  return (
    <span
      role="img"
      aria-label={`${rating} étoile${rating > 1 ? 's' : ''} sur 5`}
      className={cn('inline-flex items-center gap-1', className)}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cn('size-4', index < rating ? activeClassName : 'fill-transparent text-muted-foreground/35')}
        />
      ))}
    </span>
  )
}
