import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { NavigationEffects } from './NavigationEffects'

const mocks = vi.hoisted(() => ({ pathname: '/dashboard' }))
vi.mock('next/navigation', () => ({ usePathname: () => mocks.pathname }))

describe('NavigationEffects', () => {
  beforeEach(() => {
    mocks.pathname = '/dashboard'
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 1 })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.stubGlobal('scrollTo', vi.fn())
  })

  it('replace le scroll et le focus sur le titre après navigation', () => {
    const { rerender } = render(<><NavigationEffects /><h1 data-page-title tabIndex={-1}>Accueil</h1></>)

    mocks.pathname = '/calendar'
    act(() => rerender(<><NavigationEffects /><h1 data-page-title tabIndex={-1}>Agenda</h1></>))

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
    expect(document.activeElement).toHaveTextContent('Agenda')
  })
})
