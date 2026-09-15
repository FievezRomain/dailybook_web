'use client'

import { Command, FilePlus2, Search } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/lib/utils'
import { getPageTitle, moreNavigation, primaryNavigation, type NavigationDestination } from './navigation'

type PaletteAction = NavigationDestination & { description: string; shortcut?: string }

const destinations: PaletteAction[] = [
  ...primaryNavigation.map((destination) => ({ ...destination, description: `Ouvrir ${destination.label.toLowerCase()}` })),
  ...moreNavigation.map((destination) => ({ ...destination, description: `Ouvrir ${destination.label.toLowerCase()}` })),
  { href: '/notifications', label: 'Notifications', description: 'Consulter les alertes et invitations' },
  { href: '/profile', label: 'Compte', description: 'Gérer le profil et les préférences' },
]

const createActions: PaletteAction[] = [
  { href: '/calendar?create=1', label: 'Créer un événement', description: 'Rendez-vous, soin ou activité', shortcut: '⌘ E' },
  { href: '/animals?create=1', label: 'Ajouter un animal', description: 'Créer une fiche animale', shortcut: '⌘ A' },
  { href: '/notes?create=1', label: 'Écrire une note', description: 'Ajouter une information rapide', shortcut: '⌘ N' },
]

function normalize(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('fr-FR')
}

export function CommandPalette() {
  const pathname = usePathname()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const pageTitle = getPageTitle(pathname)
  const commands = useMemo(() => [...createActions, ...destinations], [])
  const results = useMemo(() => {
    const term = normalize(query.trim())
    return term ? commands.filter((command) => normalize(`${command.label} ${command.description}`).includes(term)) : commands
  }, [commands, query])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && window.matchMedia('(min-width: 768px)').matches) {
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) setQuery('')
  }

  function select(command: PaletteAction) {
    changeOpen(false)
    router.push(command.href)
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent showCloseButton={false} className="hidden max-w-xl gap-0 overflow-hidden p-0 md:block" aria-describedby="command-palette-description">
        <DialogHeader className="sr-only"><DialogTitle>Palette de commandes</DialogTitle><DialogDescription id="command-palette-description">Recherchez une action ou une destination Vasco.</DialogDescription></DialogHeader>
        <div className="flex items-center gap-control border-b px-surface">
          <Search className="size-5 text-muted-foreground" aria-hidden="true" />
          <Input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') changeOpen(false) }} placeholder="Rechercher une action ou une destination…" aria-label="Rechercher une commande" className="h-14 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" />
          <kbd className="rounded-control bg-muted px-2 py-1 text-xs text-muted-foreground">Échap</kbd>
        </div>
        <div className="max-h-[min(60dvh,28rem)] overflow-y-auto p-control" aria-label="Résultats de commandes">
          <p className="px-control py-2 text-xs font-medium text-muted-foreground">{query ? `Résultats pour « ${query} »` : `Dans ${pageTitle}`}</p>
          {results.length ? <ul className="grid gap-1" role="listbox" aria-label="Commandes disponibles">{results.map((command) => <li key={command.href}><Button variant="ghost" className="h-auto min-h-12 w-full justify-start px-control py-2 text-left" onClick={() => select(command)} role="option"><span className="flex min-w-0 flex-1 flex-col"><span className="font-medium">{command.label}</span><span className="text-xs font-normal text-muted-foreground">{command.description}</span></span>{command.shortcut && <kbd className="ml-control rounded-control bg-muted px-2 py-1 text-xs text-muted-foreground">{command.shortcut}</kbd>}</Button></li>)}</ul> : <div className="flex min-h-44 flex-col items-center justify-center gap-control px-surface text-center"><Command className="size-8 text-muted-foreground" aria-hidden="true" /><p className="font-medium">Aucune commande trouvée</p><p className="text-sm text-muted-foreground">Essayez un nom d’écran, une action ou un animal.</p></div>}
        </div>
        <div className={cn('flex items-center gap-control border-t px-surface py-control text-xs text-muted-foreground')}><FilePlus2 className="size-4" aria-hidden="true" /> La palette complète la navigation et le menu Créer.</div>
      </DialogContent>
    </Dialog>
  )
}
