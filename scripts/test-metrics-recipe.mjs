import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { initializeApp, deleteApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
const app = initializeApp({ projectId: 'vasco-e2e' });
const auth = getAuth(app);
const token = readFileSync(process.argv[2], 'utf8').trim();
const production = process.argv[3] === '--production';
const origin = production ? 'http://127.0.0.1:3013' : 'http://127.0.0.1:3012';
let uid;
try {
  const signup = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `metrics-${randomUUID()}@example.invalid`, password: randomUUID(), returnSecureToken: true }),
  });
  assert.equal(signup.status, 200);
  const identity = await signup.json();
  uid = identity.localId;
  const session = await auth.createSessionCookie(identity.idToken, { expiresIn: 3600_000 });
  const headers = { Cookie: `${production ? '__Secure-vasco-session' : 'session'}=${session}` };
  for (const [offset, expected] of [[0, 200], [1, 500], [2, 502]]) {
    const response = await fetch(`${origin}/api/events?offset=${offset}`, {
      headers, signal: AbortSignal.timeout(60_000), redirect: 'error',
    });
    assert.equal(response.status, expected, `Unexpected response for case ${offset}`);
  }
  const endpoint = `${origin}/api/internal/metrics`;
  assert.equal((await fetch(endpoint)).status, 401);
  const exportResponse = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(exportResponse.status, 200);
  const metrics = await exportResponse.text();
  for (const outcome of ['success', 'http_5xx', 'timeout']) {
    assert.match(metrics, new RegExp(`vasco_bff_upstream_requests_total\\{[^\\n]*outcome="${outcome}"[^\\n]*\\} [1-9]`));
  }
  for (const sensitive of [session, token, identity.idToken, uid]) assert.ok(!metrics.includes(sensitive));
  console.log('Real Next/Firebase-emulator HTTP recipe passed: success, API 500, 10s timeout, shared protected export and no test credentials exposed.');
} finally {
  if (uid) await auth.deleteUser(uid);
  await deleteApp(app);
}
