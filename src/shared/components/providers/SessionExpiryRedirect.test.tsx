import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const replace = vi.hoisted(() => vi.fn())
const closeAuthenticatedSession = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }))
vi.mock('@/features/user/api/user-api', () => ({ closeAuthenticatedSession }))

import { SessionExpiryRedirect } from './SessionExpiryRedirect'
import { sessionExpiryEvent } from '@/shared/security/session-expiry'

afterEach(() => {
  replace.mockClear()
  closeAuthenticatedSession.mockClear()
})

describe('SessionExpiryRedirect', () => {
  it('clôture la session puis redirige une expiration vers Login avec un retour interne sûr', async () => {
    render(<SessionExpiryRedirect />)
    window.dispatchEvent(new CustomEvent(sessionExpiryEvent, { detail: { returnTo: '/profile?tab=security' } }))
    await vi.waitFor(() => expect(closeAuthenticatedSession).toHaveBeenCalledOnce())
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/login?returnTo=%2Fprofile%3Ftab%3Dsecurity'))
  })

  it('rejette un retour externe ou ambigu', async () => {
    render(<SessionExpiryRedirect />)
    window.dispatchEvent(new CustomEvent(sessionExpiryEvent, { detail: { returnTo: '//external.example' } }))
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/login?returnTo=%2Fdashboard'))
  })
})
