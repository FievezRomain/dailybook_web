import type { LucideIcon } from 'lucide-react'
import { CalendarDays, ChartNoAxesCombined, House, PawPrint } from 'lucide-react'

export type NavigationDestination = {
  href: string
  label: string
  icon?: LucideIcon
}

export const primaryNavigation: NavigationDestination[] = [
  { href: '/dashboard', label: 'Accueil', icon: House },
  { href: '/performances/objectives', label: 'Suivi', icon: ChartNoAxesCombined },
  { href: '/calendar', label: 'Agenda', icon: CalendarDays },
  { href: '/animals', label: 'Animaux', icon: PawPrint },
]

export const trackingNavigation: NavigationDestination[] = [
  { href: '/performances/objectives', label: 'Objectifs' },
  { href: '/performances/statistics', label: 'Statistiques' },
]

export const moreNavigation: NavigationDestination[] = [
  { href: '/groups', label: 'Groupes' },
  { href: '/contacts', label: 'Contacts' },
  { href: '/notes', label: 'Notes' },
  { href: '/wishes', label: 'Souhaits' },
]

export const globalCreateHiddenPaths = ['/account', '/settings', '/notifications', '/login', '/register']

const pageTitles: Array<[string, string]> = [
  ['/performances/objectives', 'Objectifs'],
  ['/performances/statistics', 'Statistiques'],
  ['/dashboard', 'Accueil'],
  ['/calendar', 'Agenda'],
  ['/animals', 'Animaux'],
  ['/groups', 'Groupes'],
  ['/contacts', 'Contacts'],
  ['/notes', 'Notes'],
  ['/wishes', 'Souhaits'],
  ['/notifications', 'Notifications'],
  ['/profile', 'Profil'],
]

export function isCurrentDestination(pathname: string, href: string) {
  return pathname === href || (href === '/performances/objectives' && pathname.startsWith('/performances/'))
}

export function getPageTitle(pathname: string) {
  return pageTitles.find(([href]) => pathname === href || pathname.startsWith(`${href}/`))?.[1] ?? 'Vasco'
}
