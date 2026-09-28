'use client'

import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { usePathname } from 'next/navigation'
import * as React from 'react'

import { NotificationBell } from '@/features/notifications/components/NotificationBell'
import { IconButton } from '@/shared/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'
import UserButton from '@/features/user/components/UserButton'
import { GlobalCreate } from './GlobalCreate'
import { getPageTitle, globalCreateHiddenPaths } from './navigation'

const dataPaths = ['/dashboard', '/calendar', '/animals', '/performances', '/groups', '/contacts', '/notes', '/wishes', '/notifications']

function formatFreshness(updatedAt: number) {
  const elapsedMinutes = Math.floor((Date.now() - updatedAt) / 60_000)
  if (elapsedMinutes <= 0) return "À l'instant"
  if (elapsedMinutes === 1) return 'Il y a 1 min'
  return `Il y a ${elapsedMinutes} min`
}

function DataRefresh({ pathname }: { pathname: string }) {
  const queryClient = useQueryClient()
  const fetchingCount = useIsFetching()
  const [now, setNow] = React.useState(() => Date.now())
  const isDataPage = dataPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  const updatedAt = queryClient.getQueryCache().getAll().reduce((latest, query) => Math.max(latest, query.state.dataUpdatedAt), 0)
  const isRefreshing = fetchingCount > 0

  React.useEffect(() => {
    if (!updatedAt) return
    const timer = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [updatedAt])

  if (!isDataPage) return null

  const freshness = updatedAt ? formatFreshness(Math.min(updatedAt, now)) : 'Données non synchronisées'
  const label = isRefreshing ? 'Synchronisation en cours' : `Actualiser les données — ${freshness}`
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton label={label} size="compact" variant="ghost" loading={isRefreshing} className="text-muted-foreground" onClick={() => void queryClient.refetchQueries({ type: 'active' })}>
          <RefreshCw aria-hidden="true" className="size-4" />
        </IconButton>
      </TooltipTrigger>
      <TooltipContent placement="bottom">Actualiser</TooltipContent>
    </Tooltip>
  )
}

export default function ResponsiveAppBar() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-sticky flex h-14 items-center gap-2 border-b bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 md:static md:h-12 md:px-5">
      <h1 data-page-title tabIndex={-1} className="min-w-0 flex-1 truncate rounded-sm text-lg font-bold outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40">{getPageTitle(pathname)}</h1>
      <DataRefresh pathname={pathname} />
      <div className="flex shrink-0 items-center gap-1 md:hidden">
        <GlobalCreate currentPath={pathname} hideOnPaths={globalCreateHiddenPaths} placement="topbar" />
        <NotificationBell />
        <UserButton />
      </div>
    </header>
  )
}
