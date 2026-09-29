import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent,
  DropdownMenuSubTrigger, DropdownMenuTrigger,
} from './dropdown-menu';

describe('DropdownMenu', () => {
  it('compose les options, sélections et sous-menus avec un comportement accessible', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
        <DropdownMenuContent size="comfortable">
          <DropdownMenuLabel>Préférences</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={onAction}>Modifier <DropdownMenuShortcut>⌘E</DropdownMenuShortcut></DropdownMenuItem>
            <DropdownMenuCheckboxItem checked>Afficher les détails</DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value="month">
            <DropdownMenuRadioItem value="week">Semaine</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="month">Mois</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Partager</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Copier le lien</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByText('Préférences')).toBeVisible();
    expect(screen.getByRole('menuitemcheckbox', { name: 'Afficher les détails' })).toHaveAttribute('data-state', 'checked');
    expect(screen.getByRole('menuitemradio', { name: 'Mois' })).toHaveAttribute('data-state', 'checked');

    await user.click(screen.getByRole('menuitem', { name: /Modifier/ }));
    expect(onAction).toHaveBeenCalledOnce();
  });
});
