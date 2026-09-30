import { expect, test, type Page } from '@playwright/test'
import { createVerifiedFirebaseUser, exchangeIdTokenForSession } from './firebase-auth.fixture'

const premiumUser = { id: 1, name: 'Vasco', email: 'vasco@example.test', picture: null, expotoken: null, timezone: 'Europe/Paris', dailyReminderEnabled: true, subscription: 'Premium' }
const animals = [{ id: 1, nom: 'Moka', espece: 'Chat', provenance: 'owner', datenaissance: '2020-01-02' }]

async function mockSharedData(page: Page) {
  await page.route('**/api/me', route => route.fulfill({ json: premiumUser }))
  await page.route('**/api/animals', route => route.fulfill({ json: animals }))
  await page.route(/\/api\/events(?:\?.*)?$/, route => route.fulfill({ json: [] }))
}

test.describe('parcours Objectifs et Statistiques', () => {
  test('FLOW-07 : crée un objectif puis rend sa progression actionnable', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request)
    const objectives: Array<Record<string, unknown>> = []
    try {
      await exchangeIdTokenForSession(context, user.idToken)
      await mockSharedData(page)
      await page.route('**/api/objectifs', async route => {
        if (route.request().method() === 'GET') return route.fulfill({ json: objectives })
        if (route.request().method() === 'POST') {
          const created = { id: 8, ...(route.request().postDataJSON() as Record<string, unknown>), sousetapes: [{ id: 3, etape: 'Peser Moka', state: false, order: 1 }] }
          objectives.push(created)
          return route.fulfill({ json: created })
        }
        return route.fallback()
      })
      await page.route('**/api/objectifs/8/subtasks/3', route => route.fulfill({ json: { id: 3, state: true } }))

      await page.goto('/performances/objectives')
      await page.getByRole('button', { name: 'Créer', exact: true }).first().click()
      await page.getByRole('button', { name: /Objectif/ }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
      await page.locator('#objective-title').fill('Suivi poids')
      await page.getByRole('textbox', { name: 'Date de début' }).fill('2026-01-01')
      await page.getByRole('textbox', { name: 'Date de fin' }).fill('2026-12-31')
      await page.getByRole('button', { name: 'Continuer' }).click()
      await page.getByRole('button', { name: 'Tous' }).click()
      await page.getByRole('button', { name: 'Continuer' }).click()
      await page.getByRole('button', { name: 'Ajouter une étape' }).click()
      await page.getByRole('textbox', { name: 'Étape 1' }).fill('Peser Moka')
      await page.getByRole('button', { name: 'Créer l’objectif' }).click()
      await expect(page.getByText('Suivi poids')).toBeVisible()
    await page.getByText('Peser Moka').click()
    await page.getByRole('tab', { name: /Terminés/ }).click()
    await expect(page.getByText('Objectif atteint')).toBeVisible()
    } finally { await user.cleanup() }
  })

  test('FLOW-08 : le compte Premium sélectionne un animal et lit les résultats sans dépendre du graphique', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request)
    try {
      await exchangeIdTokenForSession(context, user.idToken)
      await mockSharedData(page)
      await page.route('**/api/statistics/**', route => route.fulfill({ json: { statistic: [{ date: '2026-08-01', name: 'Dépenses', count: 2, events: [] }] } }))
      await page.goto('/performances/statistics')
      await page.getByRole('button', { name: 'Tous les animaux', exact: true }).click()
      await expect(page.getByLabel('Résumé des résultats')).toContainText('Dernière valeur')
      await expect(page.getByRole('table')).toContainText('Dépenses')
    } finally { await user.cleanup() }
  })

  for (const [name, width] of [['Wide', 1440], ['Medium', 1024], ['Compact', 390]] as const) {
    test(`I6 reste sans débordement au format ${name}`, async ({ context, page, request }) => {
      const user = await createVerifiedFirebaseUser(request)
      try {
        await exchangeIdTokenForSession(context, user.idToken)
        await mockSharedData(page)
        await page.route('**/api/objectifs', route => route.fulfill({ json: [] }))
        await page.setViewportSize({ width, height: 900 })
        await page.goto('/performances/objectives')
        await expect(page.locator('h1[data-page-title]')).toHaveText('Objectifs')
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
        await page.goto('/performances/statistics')
        await expect(page.getByText('Observez une tendance, comparez vos animaux et retrouvez chaque valeur qui compose le résultat.')).toBeVisible()
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      } finally { await user.cleanup() }
    })
  }
})
