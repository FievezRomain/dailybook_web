import { Banknote, CircleCheck, Compass, HandHeart, Stethoscope, TrafficCone, Trophy } from 'lucide-react'
import { describe, expect, it } from 'vitest'

import { colorsMap, iconsMap, mapEventData } from './events'

describe('registre d’icônes des événements', () => {
  it('utilise le registre Lucide pour chaque type d’événement', () => {
    expect(iconsMap).toEqual({
      depense: Banknote,
      balade: Compass,
      soins: HandHeart,
      concours: Trophy,
      entrainement: TrafficCone,
      autre: CircleCheck,
      rdv: Stethoscope,
    })
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

    expect(event.icon).toBe(CircleCheck)
    expect(event.color).toBe('var(--event-autre)')
  })

  it('utilise les rôles de couleur Vasco plutôt que les anciennes variables RGB', () => {
    expect(colorsMap).toMatchObject({ balade: 'var(--event-balade)', soins: 'var(--event-soins)', rdv: 'var(--event-rdv)' })
  })
})
