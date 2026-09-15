import { expect, test, type Page } from '@playwright/test';

import { createVerifiedFirebaseUser, exchangeIdTokenForSession } from './firebase-auth.fixture';

const group = {
  id: 7,
  name: 'Écurie Vasco',
  active: true,
  informations: 'Suivi partagé',
  nb_members: 2,
  nb_animaux: 0,
  data: {
    animals: [{ type: 'pending', items: [] }, { type: 'accepted', items: [] }],
    members: [
      { type: 'pending', items: [] },
      { type: 'accepted', items: [
        { user_id: 1, email: 'manager@example.test', prenom: 'Maya', role: 'manager' },
        { user_id: 2, email: 'member@example.test', prenom: 'Léo', role: 'member' },
      ] },
    ],
  },
};

async function mockCurrentUser(page: Page, subscription: 'Premium' | 'Free', email: string, id: number) {
  await page.route('**/api/me', route => route.fulfill({ json: {
    id, name: 'Vasco', email, picture: null, expotoken: null, timezone: 'Europe/Paris', dailyReminderEnabled: true, subscription,
  } }));
}

test.describe('parcours Groupes et invitations', () => {
  test('FLOW-09 : un membre Essentiel accepte une invitation et propose son animal', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);
    const proposalPayloads: unknown[] = [];

    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await mockCurrentUser(page, 'Free', 'member@example.test', 2);
      await page.route('**/api/animals', route => route.fulfill({ json: [{ id: 12, nom: 'Nova', espece: 'Cheval', provenance: 'owner' }] }));
      await page.route('**/api/groups', route => route.fulfill({ json: [] }));
      await page.route('**/api/invitations', route => route.fulfill({ json: [{
        id: 4, group_id: 7, email: 'member@example.test', proposed_by: 1, status: 'pending', group_name: group.name, proposed_by_name: 'Maya',
      }] }));
      await page.route('**/api/invitations/4', route => route.fulfill({ json: group }));
      await page.route('**/api/groups/7/animals', async route => {
        if (route.request().method() === 'POST') {
          proposalPayloads.push(route.request().postDataJSON());
          return route.fulfill({ json: group });
        }
        return route.fulfill({ json: [] });
      });

      await page.goto('/groups');
      await page.getByRole('button', { name: 'Accepter' }).click();
      await expect(page.getByRole('heading', { name: 'Écurie Vasco' })).toBeVisible();
      await page.getByRole('checkbox', { name: 'Nova' }).check();
      await page.getByRole('button', { name: 'Proposer la sélection' }).click();
      await expect.poll(() => proposalPayloads).toEqual([{ animals: [12] }]);
    } finally {
      await user.cleanup();
    }
  });

  test('FLOW-10 : un gestionnaire voit un groupe inactif sans action de partage', async ({ context, page, request }) => {
    const user = await createVerifiedFirebaseUser(request);

    try {
      await exchangeIdTokenForSession(context, user.idToken);
      await mockCurrentUser(page, 'Free', 'manager@example.test', 1);
      await page.route('**/api/animals', route => route.fulfill({ json: [{ id: 12, nom: 'Nova', provenance: 'owner' }] }));
      await page.route('**/api/groups', route => route.fulfill({ json: [{ ...group, active: false }] }));
      await page.route('**/api/invitations', route => route.fulfill({ json: [] }));

      await page.goto('/groups');
      await expect(page.getByRole('status')).toContainText('Ce groupe est inactif');
      await expect(page.getByRole('status')).toContainText('invitations et partages sont suspendus');
      await expect(page.getByRole('button', { name: /Inviter/ })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Proposer la sélection' })).toHaveCount(0);
    } finally {
      await user.cleanup();
    }
  });
});
