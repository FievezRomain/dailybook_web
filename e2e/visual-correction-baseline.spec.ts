import { mkdir, writeFile } from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'

import { createVerifiedFirebaseUser, exchangeIdTokenForSession } from './firebase-auth.fixture'

const destinations = [
  ['dashboard', '/dashboard'],
  ['agenda', '/calendar'],
  ['animals', '/animals'],
  ['objectives', '/performances/objectives'],
  ['statistics', '/performances/statistics'],
  ['groups', '/groups'],
  ['contacts', '/contacts'],
  ['notes', '/notes'],
  ['wishes', '/wishes'],
  ['notifications', '/notifications'],
  ['profile', '/profile'],
] as const

const viewports = [
  { name: '1280x720', width: 1280, height: 720 },
  { name: '1440x900', width: 1440, height: 900 },
] as const

const currentUser = {
  id: 1,
  name: 'Camille',
  email: 'camille@example.test',
  picture: null,
  expotoken: null,
  timezone: 'Europe/Paris',
  dailyReminderEnabled: true,
  subscription: 'Premium',
}

async function mockBaselineData(page: Page) {
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname

    if (request.method() !== 'GET' && !pathname.startsWith('/api/statistics/')) return route.fulfill({ json: {} })
    if (pathname === '/api/me') return route.fulfill({ json: currentUser })
    if (pathname === '/api/animals') return route.fulfill({ json: [{ id: 1, nom: 'Aria', espece: 'Chat', datenaissance: '2020-01-02', provenance: 'owner' }] })
    if (/^\/api\/animals\/\d+\/(?:history|body-pictures)/.test(pathname)) return route.fulfill({ json: [] })
    if (pathname === '/api/contacts') return route.fulfill({ json: [
      { id: 1, nom: 'Alice Martin', profession: 'Vétérinaire', telephone: '0102030405', email: 'alice@example.test' },
      { id: 2, nom: 'Émile Durand', profession: 'Ostéopathe', telephone: null, email: 'emile@example.test' },
    ] })
    if (pathname === '/api/notes') return route.fulfill({ json: [{ id: 1, titre: 'Préparation concours', note: '**À vérifier**\n\n- Carnet de santé\n- Matériel', is_pinned: true, content_format: 'markdown', created_at: '2026-09-06T08:00:00Z' }] })
    if (pathname === '/api/wishes') return route.fulfill({ json: [{ id: 1, nom: 'Nouvelle selle', url: 'https://example.test/selle', prix: '950', destinataire: 'Aria', image: null, acquis: false }] })
    if (pathname === '/api/notifications') return route.fulfill({ json: { notifications: [{ id: 1, type: 'system', title: 'Bienvenue', message: 'Votre espace Vasco est prêt.', object_id: 1, is_read: false, created_at: '2026-09-06T08:00:00Z', action_available: false }], unreadCount: 1 } })
    if (pathname === '/api/groups' || pathname === '/api/invitations' || pathname === '/api/objectifs' || pathname === '/api/events' || pathname === '/api/events/highlights') return route.fulfill({ json: [] })
    if (pathname.startsWith('/api/statistics/')) return route.fulfill({ json: [] })

    return route.fulfill({ status: 404, json: { code: 'BASELINE_NOT_MOCKED', message: pathname } })
  })
}

test('capture la baseline I12 des onze destinations privées', async ({ context, page, request }) => {
  test.setTimeout(240_000)
  const user = await createVerifiedFirebaseUser(request)
  const outputDirectory = 'docs/baselines/i12'
  const observations: Array<Record<string, unknown>> = []

  try {
    await exchangeIdTokenForSession(context, user.idToken)
    await mockBaselineData(page)
    await mkdir(outputDirectory, { recursive: true })

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      for (const [name, pathname] of destinations) {
        await page.goto(pathname)
        await page.waitForLoadState('networkidle')
        await expect(page.locator('[data-page-title]')).toBeVisible()

        const observation = await page.evaluate(() => {
          const main = document.querySelector('main')
          const candidates = [...document.querySelectorAll('main h1, main h2, main h3, main article, main section, main p, main [role="alert"], body h2, body h3, body article, body section, body p, body [role="alert"]')]
          const visible = candidates
            .map((element) => ({ element, rect: element.getBoundingClientRect() }))
            .filter(({ element, rect }) => {
              const style = window.getComputedStyle(element)
              return !element.closest('aside, nav, header') && rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight && style.visibility !== 'hidden' && style.display !== 'none'
            })
            .sort((left, right) => left.rect.top - right.rect.top)[0]
          const mainRect = main?.getBoundingClientRect()
          return {
            title: document.querySelector('h1')?.textContent?.trim() ?? null,
            firstVisibleContent: visible?.element.textContent?.replace(/\s+/g, ' ').trim().slice(0, 160) ?? null,
            firstVisibleContentTop: visible ? Math.round(visible.rect.top) : null,
            mainTop: mainRect ? Math.round(mainRect.top) : null,
            viewportHeight: window.innerHeight,
            horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
          }
        })

        observations.push({ viewport: viewport.name, destination: name, pathname, ...observation })
        expect(observation.horizontalOverflow).toBe(false)
        await page.screenshot({ path: `${outputDirectory}/${viewport.name}-${name}.png`, fullPage: false })
      }
    }

    await writeFile(`${outputDirectory}/observations.json`, `${JSON.stringify(observations, null, 2)}\n`, 'utf8')
  } finally {
    await user.cleanup()
  }
})
