import { describe, expect, it } from 'vitest'

import { getPageTitle, isCurrentDestination, moreNavigation, primaryNavigation, trackingNavigation } from './navigation'

describe('navigation du shell Vasco', () => {
  it('conserve les domaines et leurs destinations réelles', () => {
    expect(primaryNavigation.map(({ label }) => label)).toEqual(['Accueil', 'Suivi', 'Agenda', 'Animaux'])
    expect(primaryNavigation.map(({ icon }) => icon)).toEqual(['home', 'tracking', 'agenda', 'animals'])
    expect(trackingNavigation.map(({ label }) => label)).toEqual(['Objectifs', 'Statistiques'])
    expect(moreNavigation.map(({ href }) => href)).toEqual(['/groups', '/contacts', '/notes', '/wishes'])
  })

  it('calcule le contexte de suivi et le titre sans le répéter dans les pages', () => {
    expect(isCurrentDestination('/performances/statistics', '/performances/objectives')).toBe(true)
    expect(getPageTitle('/performances/statistics')).toBe('Statistiques')
  })
})
