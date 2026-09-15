'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Bell, ChevronDown, ChevronLeft, ChevronRight, Menu, UserRound } from 'lucide-react'
import * as React from 'react'
import type { ComponentType } from 'react'

import { cn } from '@/lib/utils'
import { IconButton } from '@/shared/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip'
import { GlobalCreate } from './GlobalCreate'
import { isCurrentDestination, moreNavigation, primaryNavigation, trackingNavigation } from './navigation'

const railPreferenceKey = 'vasco:rail-expanded'

function RailLabel({ children, expanded }: { children: React.ReactNode; expanded: boolean }) {
  return <span aria-hidden={!expanded} className={cn('min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-[var(--motion-slow)] ease-[var(--ease-emphasis)] motion-reduce:transition-none', expanded ? 'max-w-44 translate-x-0 opacity-100' : 'max-w-0 -translate-x-1 opacity-0')}>{children}</span>
}

function railItemClasses({ active, expanded, nested = false }: { active: boolean; expanded: boolean; nested?: boolean }) {
  return cn(
    'relative flex h-12 w-full items-center overflow-hidden rounded-control p-2 text-sm font-semibold outline-none transition-[background-color,color,box-shadow] duration-[var(--motion-fast)] ease-[var(--ease-standard)] hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:transition-none',
    expanded ? 'justify-start gap-3' : 'justify-center gap-0',
    nested && 'h-10 pl-11 text-xs',
    active
      ? 'bg-accent text-primary before:absolute before:left-0 before:h-6 before:w-1 before:rounded-full before:bg-primary'
      : 'text-muted-foreground hover:text-foreground',
  )
}

function RailMenuButton({ active, expanded, icon: Icon, inline = false, label, open, ...props }: React.ComponentProps<'button'> & { active: boolean; expanded: boolean; icon: ComponentType<{ className?: string }>; inline?: boolean; label: string; open: boolean }) {
  const Chevron = inline ? ChevronDown : ChevronRight
  return (
    <button type="button" aria-label={expanded ? undefined : label} className={railItemClasses({ active, expanded })} {...props}>
      <Icon aria-hidden="true" className="size-5 shrink-0" />
      <span className={cn('items-center justify-between overflow-hidden', expanded ? 'flex min-w-0 flex-1' : 'hidden w-0 flex-none')}>
        <RailLabel expanded={expanded}>{label}</RailLabel>
        <Chevron aria-hidden="true" className={cn('size-4 shrink-0 transition-[opacity,transform] duration-[var(--motion-fast)] motion-reduce:transition-none', expanded ? 'opacity-100' : 'w-0 opacity-0', open && 'rotate-180')} />
      </span>
    </button>
  )
}

function RailLink({ href, label, icon: Icon, pathname, expanded, nested = false }: { href: string; label: string; icon?: ComponentType<{ className?: string }>; pathname: string; expanded: boolean; nested?: boolean }) {
  const active = pathname === href || (!nested && isCurrentDestination(pathname, href))
  const link = (
    <Link href={href} aria-current={active ? 'page' : undefined} aria-label={expanded ? undefined : label} className={railItemClasses({ active, expanded, nested })}>
      {Icon && <Icon aria-hidden="true" className="size-5 shrink-0" />}
      <RailLabel expanded={expanded}>{label}</RailLabel>
    </Link>
  )

  return expanded ? link : <Tooltip><TooltipTrigger asChild>{link}</TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>
}

function RailDropdown({ active, currentPath, expanded, icon: Icon, items, label }: { active: boolean; currentPath: string; expanded: boolean; icon: ComponentType<{ className?: string }>; items: typeof moreNavigation; label: string }) {
  const [open, setOpen] = React.useState(false)
  const trigger = (
    <DropdownMenuTrigger asChild>
      <RailMenuButton active={active} expanded={expanded} icon={Icon} label={label} open={open} aria-current={active ? 'page' : undefined} />
    </DropdownMenuTrigger>
  )

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {expanded ? trigger : <Tooltip><TooltipTrigger asChild>{trigger}</TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>}
      <DropdownMenuContent side="right" align="start">
        {items.map((item) => <DropdownMenuItem key={item.href} asChild><Link href={item.href} aria-current={currentPath === item.href ? 'page' : undefined}>{item.label}</Link></DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function RailInlineMenu({ active, currentPath, expanded, icon: Icon, items, label }: { active: boolean; currentPath: string; expanded: boolean; icon: ComponentType<{ className?: string }>; items: typeof moreNavigation; label: string }) {
  const [open, setOpen] = React.useState(active)
  const submenuId = React.useId()

  return (
    <div>
      <RailMenuButton
        active={active}
        expanded={expanded}
        icon={Icon}
        inline
        label={label}
        open={open}
        aria-current={active ? 'page' : undefined}
        aria-expanded={open}
        aria-controls={submenuId}
        onClick={() => setOpen((value) => !value)}
      />
      <div id={submenuId} hidden={!open} className="grid gap-1 pt-1">
        {items.map((item) => <RailLink key={item.href} {...item} pathname={currentPath} expanded={expanded} nested />)}
      </div>
    </div>
  )
}

function RailAdaptiveMenu(props: React.ComponentProps<typeof RailDropdown> & { inline: boolean }) {
  const { inline, ...menuProps } = props
  return inline ? <RailInlineMenu {...menuProps} /> : <RailDropdown {...menuProps} />
}

function TrackingNavigation({ currentPath, expanded, inline }: { currentPath: string; expanded: boolean; inline: boolean }) {
  const trackingItem = primaryNavigation.find((item) => item.label === 'Suivi')!
  return <RailAdaptiveMenu active={currentPath.startsWith('/performances/')} currentPath={currentPath} expanded={expanded} icon={trackingItem.icon!} inline={inline} items={trackingNavigation} label="Suivi" />
}

function RailMore({ currentPath, expanded, inline }: { currentPath: string; expanded: boolean; inline: boolean }) {
  const active = moreNavigation.some((item) => currentPath === item.href || currentPath.startsWith(`${item.href}/`))
  return <RailAdaptiveMenu active={active} currentPath={currentPath} expanded={expanded} icon={Menu} inline={inline} items={moreNavigation} label="Autre" />
}

export function AppRail({ currentPath, hideGlobalCreateOnPaths }: { currentPath: string; hideGlobalCreateOnPaths: string[] }) {
  const [expandedPreference, setExpandedPreference] = React.useState(true)
  const [wideViewport, setWideViewport] = React.useState(false)
  const [veryWideViewport, setVeryWideViewport] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const wideQuery = window.matchMedia('(min-width: 1280px)')
    const veryWideQuery = window.matchMedia('(min-width: 1536px)')
    const update = () => {
      setWideViewport(wideQuery.matches)
      setVeryWideViewport(veryWideQuery.matches)
    }
    const saved = window.localStorage.getItem(railPreferenceKey)
    const frame = window.requestAnimationFrame(() => {
      if (saved !== null) setExpandedPreference(saved === 'true')
      update()
      setMounted(true)
    })
    wideQuery.addEventListener('change', update)
    veryWideQuery.addEventListener('change', update)
    return () => {
      window.cancelAnimationFrame(frame)
      wideQuery.removeEventListener('change', update)
      veryWideQuery.removeEventListener('change', update)
    }
  }, [])

  const expanded = wideViewport && expandedPreference
  const inlineSubmenus = veryWideViewport && expanded
  const toggleExpanded = () => {
    setExpandedPreference((value) => {
      window.localStorage.setItem(railPreferenceKey, String(!value))
      return !value
    })
  }

  return (
    <aside data-expanded={expanded} data-mounted={mounted} className={cn('sticky top-4 hidden h-[calc(100dvh-2rem)] shrink-0 flex-col gap-3 overflow-hidden rounded-surface border bg-card py-5 shadow-surface md:flex motion-reduce:transition-none', mounted && 'transition-[width,padding] duration-[260ms] ease-[var(--ease-emphasis)]', expanded ? 'w-[264px] px-5' : 'w-24 px-3')}>
      <div className={cn('flex h-11 items-center justify-between', expanded ? 'gap-2' : 'gap-0')}>
        <Link href="/dashboard" aria-label={expanded ? undefined : 'Vasco — Accueil'} className={cn('flex min-w-0 items-center overflow-hidden rounded-control outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50', expanded ? 'flex-1 gap-3' : 'w-8 shrink-0 justify-center')}>
          <span className={cn('flex shrink-0 items-center justify-center', expanded ? 'size-11' : 'size-8')}><Image src="/logo.png" alt="" width={44} height={44} className="size-full object-contain" priority /></span>
          <RailLabel expanded={expanded}><span className="text-lg font-bold">VASCO</span></RailLabel>
        </Link>
        <IconButton label={expanded ? 'Réduire la navigation' : 'Développer la navigation'} variant="secondary" onClick={toggleExpanded} className={cn('shrink-0', !expanded && 'size-10')}>
          <ChevronLeft className={cn('transition-transform duration-[260ms] ease-[var(--ease-emphasis)] motion-reduce:transition-none', !expanded && 'rotate-180')} />
        </IconButton>
      </div>

      <div className={cn('flex', expanded ? 'w-full' : 'justify-center')}><GlobalCreate currentPath={currentPath} hideOnPaths={hideGlobalCreateOnPaths} expanded={expanded} /></div>
      <nav aria-label="Navigation principale" className="grid gap-1">
        {primaryNavigation.map((item) => item.label === 'Suivi' ? <TrackingNavigation key={item.href} currentPath={currentPath} expanded={expanded} inline={inlineSubmenus} /> : <RailLink key={item.href} {...item} pathname={currentPath} expanded={expanded} />)}
        <RailMore currentPath={currentPath} expanded={expanded} inline={inlineSubmenus} />
      </nav>
      <nav aria-label="Navigation du compte" className="mt-auto grid gap-1">
        <RailLink href="/notifications" label="Notifications" icon={Bell} pathname={currentPath} expanded={expanded} />
        <RailLink href="/profile" label="Profil" icon={UserRound} pathname={currentPath} expanded={expanded} />
      </nav>
    </aside>
  )
}
