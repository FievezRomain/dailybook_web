import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './alert-dialog'
import { Drawer, DrawerContent, DrawerTitle } from './drawer'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Sheet, SheetContent, SheetTitle } from './sheet'
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog'

describe('overlays UI Vasco', () => {
  it('conserve un libellé français explicite pour la fermeture de dialogue', () => {
    render(<Dialog open><DialogContent><DialogTitle>Confirmer</DialogTitle></DialogContent></Dialog>)
    expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument()
  })

  it('ferme le dialogue par Échap et rend le focus à son déclencheur', async () => {
    render(<Dialog><DialogTrigger>Ouvrir les détails</DialogTrigger><DialogContent><DialogTitle>Détails</DialogTitle></DialogContent></Dialog>)
    const trigger = screen.getByRole('button', { name: 'Ouvrir les détails' })
    fireEvent.click(trigger)
    await expect(screen.getByRole('dialog')).toBeVisible()
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveFocus()
  })

  it('conserve un libellé français explicite pour la fermeture de panneau', () => {
    const { rerender } = render(<Sheet open><SheetContent width="regular"><SheetTitle>Filtres</SheetTitle></SheetContent></Sheet>)
    expect(screen.getByRole('button', { name: 'Fermer' })).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toHaveAttribute('data-width', 'regular')
    expect(screen.getByRole('dialog')).toHaveClass('max-w-[440px]', 'p-[22px]')

    rerender(<Sheet open><SheetContent width="wide" overlayClassName="bg-black/25"><SheetTitle>Détail</SheetTitle></SheetContent></Sheet>)
    expect(screen.getByRole('dialog')).toHaveClass('max-w-[620px]')
    expect(document.querySelector('[data-slot="sheet-overlay"]')).toHaveClass('bg-black/25')
  })

  it('donne le focus initial à Annuler dans une confirmation destructive', async () => {
    render(
      <AlertDialog open>
        <AlertDialogContent tone="destructive">
          <AlertDialogHeader><AlertDialogTitle>Supprimer ce groupe ?</AlertDialogTitle><AlertDialogDescription>Cette action est définitive.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction tone="destructive">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    )

    await waitFor(() => expect(screen.getByRole('button', { name: 'Annuler' })).toHaveFocus())
    expect(screen.getByRole('alertdialog')).toHaveClass('w-[460px]', 'rounded-[18px]')
  })

  it('donne le focus initial à Annuler dans la confirmation métier et ferme à Échap', async () => {
    const onCancel = vi.fn()
    render(<ConfirmDialog open title="Supprimer cette notification ?" onCancel={onCancel} onConfirm={vi.fn()} />)

    await waitFor(() => expect(screen.getByRole('button', { name: 'Annuler' })).toHaveFocus())
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(onCancel).toHaveBeenCalledOnce())
  })

  it('expose les deux hauteurs du drawer compact', () => {
    const { rerender } = render(<Drawer open><DrawerContent size="peek"><DrawerTitle>Détails de Nala</DrawerTitle></DrawerContent></Drawer>)
    expect(screen.getByRole('dialog')).toHaveAttribute('data-size', 'peek')
    expect(screen.getByRole('dialog')).toHaveClass('data-[vaul-drawer-direction=bottom]:data-[size=peek]:h-[190px]')

    rerender(<Drawer open><DrawerContent size="expanded"><DrawerTitle>Détails de Nala</DrawerTitle></DrawerContent></Drawer>)
    expect(screen.getByRole('dialog')).toHaveAttribute('data-size', 'expanded')
    expect(screen.getByRole('dialog')).toHaveClass('data-[vaul-drawer-direction=bottom]:data-[size=expanded]:h-[430px]')
  })

  it('expose les contenus Popover et menu avec leurs rôles Radix', () => {
    render(
      <>
        <Popover open><PopoverTrigger>Ouvrir les filtres</PopoverTrigger><PopoverContent size="regular">Filtres</PopoverContent></Popover>
        <DropdownMenu open><DropdownMenuTrigger>Actions</DropdownMenuTrigger><DropdownMenuContent size="comfortable"><DropdownMenuItem>Supprimer</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
      </>,
    )

    expect(screen.getByText('Filtres')).toBeVisible()
    expect(screen.getByText('Filtres')).toHaveClass('data-[size=regular]:w-[360px]', 'rounded-[14px]')
    expect(screen.getByText('Filtres')).toHaveAttribute('data-size', 'regular')
    expect(screen.getByRole('menuitem', { name: 'Supprimer' })).toBeVisible()
    expect(screen.getByRole('menuitem', { name: 'Supprimer' })).toHaveClass('cursor-pointer', 'rounded-[8px]', 'py-[var(--menu-item-py)]')
    expect(screen.getByRole('menuitem', { name: 'Supprimer' }).closest('[data-slot="dropdown-menu-content"]')).toHaveAttribute('data-size', 'comfortable')
  })
})
