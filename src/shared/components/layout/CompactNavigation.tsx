'use client'

import Link from 'next/link'

import { cn } from '@/lib/utils'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/shared/components/ui/drawer'
import { Icon, type IconName } from '@/shared/components/ui/icons'
import { isCurrentDestination, moreNavigation, primaryNavigation, trackingNavigation, type NavigationDestination } from './navigation'

function CompactMenu({ active, description, icon, items, label, navigationLabel, title }: {
  active: boolean
  description: string
  icon: IconName
  items: NavigationDestination[]
  label: string
  navigationLabel: string
  title: string
}) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button type="button" aria-current={active ? 'page' : undefined} className={cn('flex h-14 w-[62px] flex-col items-center justify-center gap-0.5 rounded-control p-1 text-[11px] font-medium text-muted-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50', active && 'text-primary')}>
          <span className={cn('flex h-7 w-9 items-center justify-center rounded-full', active && 'bg-accent')}><Icon name={icon} className="size-5" /></span>
          <span>{label}</span>
        </button>
      </DrawerTrigger>
      <DrawerContent size="expanded">
        <DrawerHeader><DrawerTitle>{title}</DrawerTitle><DrawerDescription>{description}</DrawerDescription></DrawerHeader>
        <nav aria-label={navigationLabel} className="grid gap-1">
          {items.map((item) => <Link key={item.href} href={item.href} className="flex min-h-11 items-center rounded-control px-3 text-sm font-semibold text-foreground hover:bg-muted">{item.label}</Link>)}
        </nav>
      </DrawerContent>
    </Drawer>
  )
}

export function CompactNavigation({ currentPath }: { currentPath: string }) {
  const moreActive = moreNavigation.some((item) => currentPath === item.href || currentPath.startsWith(`${item.href}/`))
  const trackingActive = currentPath.startsWith('/performances/')
  return (
    <nav aria-label="Navigation principale" className="fixed right-4 bottom-4 left-4 z-sticky mx-auto flex h-20 max-w-[358px] items-center justify-between rounded-surface border bg-card px-4 py-3 shadow-[0_10px_15px_rgba(26,13,8,0.14)] [@media(max-height:560px)]:right-0 [@media(max-height:560px)]:bottom-0 [@media(max-height:560px)]:left-0 [@media(max-height:560px)]:h-[72px] [@media(max-height:560px)]:max-w-none [@media(max-height:560px)]:rounded-b-none md:hidden">
      {primaryNavigation.map(({ href, label, icon }) => {
        if (label === 'Suivi') return <CompactMenu key={href} active={trackingActive} description="Choisir entre vos objectifs et vos statistiques." icon={icon!} items={trackingNavigation} label="Suivi" navigationLabel="Destinations de suivi" title="Suivi" />
        const active = isCurrentDestination(currentPath, href)
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={cn('flex h-14 w-[62px] flex-col items-center justify-center gap-0.5 rounded-control p-1 text-[11px] font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50', active ? 'text-primary' : 'text-muted-foreground')}>
            <span className={cn('flex h-7 w-9 items-center justify-center rounded-full', active && 'bg-accent')}>{icon && <Icon name={icon} className="size-5" />}</span>
            <span>{label}</span>
          </Link>
        )
      })}
      <CompactMenu active={moreActive} description="Accéder aux autres espaces Vasco." icon="otherMenu" items={moreNavigation} label="Autre" navigationLabel="Autres destinations" title="Autres destinations" />
    </nav>
  )
}
