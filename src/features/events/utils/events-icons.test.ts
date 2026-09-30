import { describe, expect, it } from 'vitest'

import { colorsMap, eventTypeOptions, filterLate, formatWalkDuration, getEventTypeRecurrenceDefaults, iconsMap, mapEventData } from './events'
import type { Event } from '../types/event'

const event = (id: number, dateevent: string, state: string): Event => ({
  id,
  nom: `Événement ${id}`,
  dateevent,
  eventtype: 'autre',
  animaux: [],
  state,
  documents: [],
  shared_groups: [],
  todisplay: true,
})

describe('event recurrence defaults', () => {
  it('defaults recurring care and walk events to a daily recurrence', () => {
    expect(getEventTypeRecurrenceDefaults('soins')).toEqual({ frequencetype: 'recurring', frequencevalue: 'daily' })
    expect(getEventTypeRecurrenceDefaults('balade')).toEqual({ frequencetype: 'recurring', frequencevalue: 'daily' })
    expect(getEventTypeRecurrenceDefaults('rdv')).toEqual({ frequencetype: undefined, frequencevalue: undefined })
  })
})

describe('registre d’icônes des événements', () => {
  it('utilise le registre Lucide pour chaque type d’événement', () => {
    expect(iconsMap).toEqual({
      soins: 'medical',
      rdv: 'stethoscope',
      balade: 'compass',
      entrainement: 'tracking',
      concours: 'trophy',
      depense: 'expense',
      autre: 'circleCheck',
    })
  })

  it('reprend l’ordre et les intitulés de la création mobile', () => {
    expect(eventTypeOptions.map(({ value, label }) => ({ value, label }))).toEqual([
      { value: 'soins', label: 'Soins' },
      { value: 'rdv', label: 'Rendez-vous médical' },
      { value: 'balade', label: 'Balade' },
      { value: 'entrainement', label: 'Entraînement' },
      { value: 'concours', label: 'Concours' },
      { value: 'depense', label: 'Dépense' },
      { value: 'autre', label: 'Autre' },
    ])
  })

  it('conserve une icône Lucide de repli pour un type inconnu', () => {
    const event = mapEventData({
      id: 1,
      nom: 'Inconnu',
      dateevent: '2026-09-04',
      eventtype: 'inconnu',
      animaux: [],
      state: 'À faire',
      documents: [],
      shared_groups: [],
      todisplay: true,
    })

    expect(event.icon).toBe('circleCheck')
    expect(event.color).toBe('var(--event-autre)')
  })

  it('utilise les rôles de couleur Vasco plutôt que les anciennes variables RGB', () => {
    expect(colorsMap).toMatchObject({ balade: 'var(--event-balade)', soins: 'var(--event-soins)', rdv: 'var(--event-rdv)' })
  })

  it('retient comme retards tous les événements passés non terminés', () => {
    const referenceDate = new Date(2026, 8, 17, 12)
    const lateEvents = filterLate([
      event(1, '2026-09-15', 'À faire'),
      event(2, '2026-09-16', 'En cours'),
      event(3, '2026-09-14', 'Terminé'),
      event(4, '2026-09-17', 'À faire'),
      event(5, '2026-09-18', 'À faire'),
      event(6, '2026-09-13', 'completed'),
    ], referenceDate)

    expect(lateEvents.map(({ id }) => id)).toEqual([1, 2])
  })

  it('calcule aussi une balade qui se termine le lendemain', () => {
    expect(formatWalkDuration({
      dateevent: '2026-09-17',
      heuredebutevent: '23:30',
      datefinbalade: '2026-09-18',
      heurefinbalade: '00:45',
    })).toBe('1 h 15 min')
  })
})
