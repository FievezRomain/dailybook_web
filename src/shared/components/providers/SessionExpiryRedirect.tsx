'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLogoutCurrentUser } from '@/features/user/hooks/use-logout-current-user'
import { safeReturnPath } from '@/shared/security/safe-return-path'
import { sessionExpiryEvent } from '@/shared/security/session-expiry'

export function SessionExpiryRedirect() {
  const router = useRouter()
  const logoutCurrentUser = useLogoutCurrentUser()

  useEffect(() => {
    const redirect = async (event: Event) => {
      const returnTo = safeReturnPath((event as CustomEvent<{ returnTo?: string }>).detail?.returnTo ?? null)
      await logoutCurrentUser().catch(() => undefined)
      router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`)
      router.refresh()
    }
    window.addEventListener(sessionExpiryEvent, redirect)
    return () => window.removeEventListener(sessionExpiryEvent, redirect)
  }, [logoutCurrentUser, router])

  return null
}
