import { mkdir, writeFile } from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'

import { createVerifiedFirebaseUser, exchangeIdTokenForSession } from './firebase-auth.fixture'

const destinations = [
  ['dashboard', '/dashboard'], ['agenda', '/calendar'], ['animals', '/animals'],
  ['objectives', '/performances/objectives'], ['statistics', '/performances/statistics'],
  ['groups', '/groups'], ['contacts', '/contacts'], ['notes', '/notes'],
  ['wishes', '/wishes'], ['notifications', '/notifications'], ['profile', '/profile'],
] as const

const viewports = [
  { name: '1280x720', width: 1280, height: 720 },
  { name: '1440x900', width: 1440, height: 900 },
] as const

async function mockShellData(page: Page) {
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname
    if (request.method() !== 'GET' && !pathname.startsWith('/api/statistics/')) return route.fulfill({ json: {} })
    if (pathname === '/api/me') return route.fulfill({ json: { id: 1, name: 'Camille', email: 'camille@example.test', picture: null, expotoken: null, timezone: 'Europe/Paris', dailyReminderEnabled: true, subscription: 'Premium' } })
    if (pathname === '/api/animals') return route.fulfill({ json: [{ id: 1, nom: 'Aria', espece: 'Chat', datenaissance: '2020-01-02', provenance: 'owner' }] })
    if (/^\/api\/animals\/\d+\/(?:history|body-pictures)/.test(pathname)) return route.fulfill({ json: [] })
    if (pathname === '/api/contacts' || pathname === '/api/notes' || pathname === '/api/wishes' || pathname === '/api/groups' || pathname === '/api/invitations' || pathname === '/api/objectifs' || pathname === '/api/events' || pathname === '/api/events/highlights') return route.fulfill({ json: [] })
    if (pathname === '/api/notifications') return route.fulfill({ json: { notifications: [], unreadCount: 0 } })
    if (pathname.startsWith('/api/statistics/')) return route.fulfill({ json: [] })
    return route.fulfill({ status: 404, json: { code: 'SHELL_I13_NOT_MOCKED', message: pathname } })
  })
}

test('valide le shell I13 sur toutes les destinations privées', async ({ context, page, request }) => {
  test.setTimeout(240_000)
  const user = await createVerifiedFirebaseUser(request)
  const outputDirectory = 'docs/baselines/i13'
  const observations: Array<Record<string, unknown>> = []

  try {
    await exchangeIdTokenForSession(context, user.idToken)
    await mockShellData(page)
    await mkdir(outputDirectory, { recursive: true })

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      for (const [destination, pathname] of destinations) {
        await page.goto(pathname)
        await page.waitForLoadState('networkidle')
        const title = page.locator('[data-page-title]')
        await expect(title).toBeVisible()
        await expect(page.getByText('Contexte animal', { exact: true })).toHaveCount(0)

        const observation = await page.evaluate(() => {
          const main = document.querySelector('main')
          const visibleContent = [...document.querySelectorAll('main h2, main h3, main article, main section, main p, main [role="alert"], main, body h2, body h3, body article, body section, body p, body [role="heading"], body [role="alert"]')]
            .map((element) => ({ element, rect: element.getBoundingClientRect() }))
            .filter(({ element, rect }) => !element.closest('aside, nav, header') && Boolean(element.textContent?.trim()) && rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight)
            .sort((left, right) => left.rect.top - right.rect.top)[0]
          return {
            title: document.querySelector('[data-page-title]')?.textContent?.trim() ?? null,
            firstUsefulContent: visibleContent?.element.textContent?.replace(/\s+/g, ' ').trim().slice(0, 160) ?? null,
            firstUsefulContentTop: visibleContent ? Math.round(visibleContent.rect.top) : null,
            mainTop: main ? Math.round(main.getBoundingClientRect().top) : null,
            horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
          }
        })

        expect(observation.firstUsefulContent, `${viewport.name} ${pathname}`).toBeTruthy()
        expect(observation.firstUsefulContentTop, `${viewport.name} ${pathname}`).not.toBeNull()
        expect(observation.firstUsefulContentTop!, `${viewport.name} ${pathname}`).toBeLessThan(viewport.height)
        expect(observation.horizontalOverflow).toBe(false)
        observations.push({ viewport: viewport.name, destination, pathname, ...observation })
        await page.screenshot({ path: `${outputDirectory}/${viewport.name}-${destination}.png`, fullPage: false })
      }
    }

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/performances/statistics')
    await page.waitForLoadState('networkidle')
    const compactNavigation = page.getByRole('navigation', { name: 'Navigation principale' })
    await expect(compactNavigation).toBeVisible()
    const compactTracking = compactNavigation.getByRole('button', { name: 'Suivi' })
    await expect(compactTracking).toHaveAttribute('aria-current', 'page')
    await compactTracking.click()
    await expect(page.getByRole('navigation', { name: 'Destinations de suivi' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Objectifs' })).toHaveAttribute('href', '/performances/objectives')
    await expect(page.getByRole('link', { name: 'Statistiques' })).toHaveAttribute('href', '/performances/statistics')
    await page.keyboard.press('Escape')

    await page.setViewportSize({ width: 1024, height: 768 })
    await page.goto('/performances/objectives')
    await page.waitForLoadState('networkidle')
    const mediumTracking = page.getByRole('button', { name: 'Suivi' })
    await mediumTracking.click()
    await expect(page.getByRole('menuitem', { name: 'Objectifs' })).toBeVisible()
    await expect(page.locator('aside').getByRole('menuitem', { name: 'Objectifs' })).toHaveCount(0)
    await page.keyboard.press('Escape')

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/performances/objectives')
    await page.waitForLoadState('networkidle')
    const collapse = page.getByRole('button', { name: 'Réduire la navigation' })
    const initialBox = await collapse.boundingBox()
    const tracking = page.locator('button[aria-haspopup="menu"]').filter({ hasText: 'Suivi' })
    await expect(tracking).toHaveAttribute('aria-expanded', 'false')
    await expect(tracking.locator('svg').last()).toHaveClass(/lucide-chevron-right/)
    await tracking.click()
    await expect(tracking).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('menuitem', { name: 'Objectifs' })).toBeVisible()
    await expect(page.locator('aside').getByRole('menuitem', { name: 'Objectifs' })).toHaveCount(0)
    await page.keyboard.press('Escape')
    const other = page.locator('button[aria-haspopup="menu"]').filter({ hasText: 'Autre' })
    await other.click()
    await expect(other).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('menuitem', { name: 'Groupes' })).toBeVisible()
    await expect(page.locator('aside').getByRole('menuitem', { name: 'Groupes' })).toHaveCount(0)
    await page.keyboard.press('Escape')
    await collapse.click()
    const expand = page.getByRole('button', { name: 'Développer la navigation' })
    await expect(expand).toBeVisible()
    const collapsedBox = await expand.boundingBox()
    const initialCenterY = (initialBox?.y ?? 0) + (initialBox?.height ?? 0) / 2
    const collapsedCenterY = (collapsedBox?.y ?? 0) + (collapsedBox?.height ?? 0) / 2
    expect(Math.abs(initialCenterY - collapsedCenterY)).toBeLessThanOrEqual(1)
    await page.waitForTimeout(80)
    await expand.click()
    await expect(page.getByRole('button', { name: 'Réduire la navigation' })).toBeVisible()
    await expect(page.locator('aside[data-expanded="true"]')).toBeVisible()

    await page.getByRole('button', { name: 'Réduire la navigation' }).click()
    await page.waitForTimeout(300)
    const collapsedRail = page.locator('aside[data-expanded="false"]')
    await expect(collapsedRail.locator('img[src*="logo.png"]')).toBeVisible()
    const itemCenters = await collapsedRail.locator('nav[aria-label="Navigation principale"] > a > svg, nav[aria-label="Navigation principale"] > div > button > svg').evaluateAll((items) => items.map((item) => {
      const rect = item.getBoundingClientRect()
      return Math.round(rect.left + rect.width / 2)
    }))
    expect(Math.max(...itemCenters) - Math.min(...itemCenters)).toBeLessThanOrEqual(1)
    await page.screenshot({ path: `${outputDirectory}/1440x900-rail-collapsed.png`, fullPage: false })
    await page.getByRole('button', { name: 'Développer la navigation' }).click()
    await expect(page.locator('aside[data-expanded="true"]')).toBeVisible()

    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto('/performances/objectives')
    await page.waitForLoadState('networkidle')
    const veryWideTracking = page.getByRole('button', { name: 'Suivi' })
    await expect(veryWideTracking).toHaveAttribute('aria-expanded', 'true')
    await expect(veryWideTracking.locator('svg').last()).toHaveClass(/lucide-chevron-down/)
    await expect(page.locator('aside').getByRole('link', { name: 'Objectifs' })).toBeVisible()
    await page.screenshot({ path: `${outputDirectory}/1600x900-objectives-inline-submenu.png`, fullPage: false })

    await page.emulateMedia({ reducedMotion: 'reduce' })
    const reducedMotion = await page.locator('aside[data-expanded="true"]').evaluate((element) => {
      const style = getComputedStyle(element)
      return { property: style.transitionProperty, duration: Number.parseFloat(style.transitionDuration) }
    })
    expect(reducedMotion.property).not.toMatch(/width|transform/)
    expect(reducedMotion.duration).toBeLessThanOrEqual(0.1)

    await writeFile(`${outputDirectory}/observations.json`, `${JSON.stringify(observations, null, 2)}\n`, 'utf8')
  } finally {
    await user.cleanup()
  }
})
