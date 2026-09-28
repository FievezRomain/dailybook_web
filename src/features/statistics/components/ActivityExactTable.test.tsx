import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { EventStatistics } from '../types/statistics'
import { ActivityExactTable } from './ActivityExactTable'

const event = {
  id: 7,
  nom: 'Parcours en extérieur',
  dateevent: '2026-09-14',
  animaux: [4],
  eventtype: 'entrainement',
  state: 'Terminé',
  note: 3,
  documents: [],
  shared_groups: [],
  todisplay: true,
}

describe('ActivityExactTable', () => {
  it('affiche la date, le nom, l’indicateur et la note sous forme d’étoiles', () => {
    render(<ActivityExactTable result={{ statistic: [{ events: [event] }] } as EventStatistics} />)

    expect(screen.getByRole('columnheader', { name: 'Date' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Événement' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Indicateur' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Note réelle' })).toBeInTheDocument()
    expect(screen.getByText('14 septembre 2026')).toBeInTheDocument()
    expect(screen.getByText('Parcours en extérieur')).toBeInTheDocument()
    expect(screen.getByText('Note')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: '3 étoiles sur 5' })).toBeInTheDocument()
  })

  it('ajoute le classement et la position réelle pour un concours', () => {
    render(
      <ActivityExactTable
        includeRanking
        result={{ statistic: [{ events: [{ ...event, eventtype: 'concours', placement: '2' }] }] } as EventStatistics}
      />,
    )

    expect(screen.getByRole('columnheader', { name: 'Valeur réelle' })).toBeInTheDocument()
    expect(screen.getByText('Classement')).toBeInTheDocument()
    expect(screen.getByText('2e place')).toBeInTheDocument()
  })
})
