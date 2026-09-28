import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MarkdownText } from '@/shared/components/feedback/MarkdownText'
import { SearchField } from '@/shared/components/ui/search-field'
import { AlphabeticalDirectory, groupAlphabetically } from './AlphabeticalDirectory'
import { ContentHeader } from './ContentHeader'
import { MasonryGrid } from './MasonryGrid'
import { SecondaryNavigation } from './SecondaryNavigation'

describe('primitives du cycle correctif', () => {
  it('réserve la place de l’icône dans un champ de recherche nommé', () => {
    render(<SearchField label="Rechercher un contact" placeholder="Rechercher un contact" />)

    const input = screen.getByRole('searchbox', { name: 'Rechercher un contact' })
    expect(input).toHaveClass('pl-10!')
    expect(input.parentElement?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('rend un en-tête de contenu compact avec un titre focalisable', () => {
    render(<ContentHeader title="Agenda" description="Vos événements" actions={<button>Filtrer</button>} />)

    expect(screen.getByRole('heading', { name: 'Agenda', level: 1 })).toHaveAttribute('data-page-title')
    expect(screen.getByRole('button', { name: 'Filtrer' })).toBeVisible()
  })

  it('annonce la sous-destination active', () => {
    render(<SecondaryNavigation currentPath="/performances/statistics" items={[
      { href: '/performances/objectives', label: 'Objectifs' },
      { href: '/performances/statistics', label: 'Statistiques' },
    ]} />)

    expect(screen.getByRole('link', { name: 'Statistiques' })).toHaveAttribute('aria-current', 'page')
  })

  it('groupe les entrées accentuées et expose un index alphabétique', () => {
    const groups = groupAlphabetically([{ id: 1, name: 'Élodie' }, { id: 2, name: 'Alice' }], (item) => item.name)
    render(<AlphabeticalDirectory groups={groups} getKey={(item) => item.id} renderItem={(item) => <p>{item.name}</p>} />)

    const index = screen.getByRole('navigation', { name: 'Index alphabétique' })
    expect(within(index).getByRole('link', { name: 'Aller aux contacts A' })).toHaveAttribute('href', '#directory-A')
    expect(within(index).getByRole('link', { name: 'Aller aux contacts E' })).toHaveAttribute('href', '#directory-E')
  })

  it('conserve l’ordre DOM dans la composition masonry', () => {
    render(<MasonryGrid aria-label="Souhaits"><article>Premier</article><article>Deuxième</article></MasonryGrid>)
    expect(screen.getAllByRole('article').map((item) => item.textContent)).toEqual(['Premier', 'Deuxième'])
  })

  it('rend le Markdown sans interpréter le HTML utilisateur', () => {
    render(<MarkdownText>{'**Important**\n\n<script>alert(1)</script>'}</MarkdownText>)
    expect(screen.getByText('Important')).toHaveStyle({ fontWeight: 'bold' })
    expect(document.querySelector('script')).not.toBeInTheDocument()
  })
})
