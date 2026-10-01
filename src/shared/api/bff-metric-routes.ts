import { normalizeUpstreamRoute } from './bff-logger';

// Closed vocabulary: an unrecognized suffix must never become a metric label.
const routes = new Set([
  'auth/session', 'users/me', 'users/me/notification-preferences', 'users/me/password',
  ...['animals', 'events', 'objectifs', 'contacts', 'notes', 'wishes', 'groups', 'notifications', 'invitations']
    .flatMap(name => [name, `${name}/:id`]),
  'events/highlights', 'events/:id/documents', 'events/:id/documents/:file',
  'animals/:id/medical-record', 'animals/:id/history', 'animals/:id/body-pictures',
  'animals/body-pictures/:id', 'notifications/read-all',
  ...['poids', 'taille', 'food', 'quantity'].flatMap(item => [
    `animals/:id/history/${item}`, `animals/:id/history/${item}/:id`,
  ]),
  ...['depenses', 'entrainements', 'balades', 'concours', 'poids', 'tailles', 'alimentations']
    .map(type => `statistics/${type}`),
  ...['members', 'animals', 'invitations', 'animal-shares/pending'].map(item => `groups/:id/${item}`),
  'groups/:id/animals/:id', 'animal-shares/:id',
  'files/:file', 'files/upload-url', 'files/upload-complete', 'files/download-urls',
]);

export function metricRoute(path: string): string {
  const normalized = normalizeUpstreamRoute(path).replace(/^\/api\/v1\//, '');
  return routes.has(normalized) ? `/api/v1/${normalized}` : '__unmatched__';
}
