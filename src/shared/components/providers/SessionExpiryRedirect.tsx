'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { closeAuthenticatedSession } from '@/features/user/api/user-api'
import { safeReturnPath } from '@/shared/security/safe-return-path'
import { sessionExpiryEvent } from '@/shared/security/session-expiry'

export function SessionExpiryRedirect() {
  const router = useRouter()

  useEffect(() => {
    const redirect = async (event: Event) => {
      const returnTo = safeReturnPath((event as CustomEvent<{ returnTo?: string }>).detail?.returnTo ?? null)
      await closeAuthenticatedSession().catch(() => undefined)
      router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`)
    }
    window.addEventListener(sessionExpiryEvent, redirect)
    return () => window.removeEventListener(sessionExpiryEvent, redirect)
  }, [router])

  return null
}
