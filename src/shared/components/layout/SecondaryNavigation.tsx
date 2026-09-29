import Link from 'next/link'

import { cn } from '@/lib/utils'

export type SecondaryNavigationItem = {
  href: string
  label: string
  description?: string
}

export function SecondaryNavigation({
  items,
  currentPath,
  label = 'Navigation secondaire',
  className,
}: {
  items: readonly SecondaryNavigationItem[]
  currentPath: string
  label?: string
  className?: string
}) {
  return (
    <nav aria-label={label} className={cn('flex gap-1 overflow-x-auto rounded-control bg-muted p-1 md:grid md:overflow-visible', className)}>
      {items.map((item) => {
        const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'min-h-10 shrink-0 rounded-control px-3 py-2 text-sm font-semibold outline-none transition-colors duration-[var(--motion-fast)] focus-visible:ring-[3px] focus-visible:ring-ring/50',
              active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:bg-card/60 hover:text-foreground',
            )}
          >
            <span className="block">{item.label}</span>
            {item.description ? <span className="mt-0.5 hidden text-xs font-normal text-muted-foreground lg:block">{item.description}</span> : null}
          </Link>
        )
      })}
    </nav>
  )
}
