'use client'

import { usePathname } from 'next/navigation'
import * as React from 'react'

export function NavigationEffects() {
  const pathname = usePathname()
  const previousPath = React.useRef(pathname)

  React.useEffect(() => {
    if (previousPath.current === pathname) return
    previousPath.current = pathname

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      document.querySelector<HTMLElement>('[data-page-title]')?.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [pathname])

  return null
}
