---
applyTo: "src/components/**,src/app/**,src/features/**"
---

# MyDailyBook — UX Philosophy (Web / Next.js)

## Identité de l'expérience

MyDailyBook Web est le **tableau de bord** de la vie équestre — là où on prend du recul, analyse, exporte et gère. L'interface Web doit évoquer :
- Un **espace de travail élégant** : ample, organisé, sans bruit visuel
- La **chaleur du monde équestre** : palette baie/alezan, surfaces chaudes, aucune froideur
- La **puissance sans complexité** : les fonctionnalités pro sont accessibles, pas intimidantes

---

## Règle fondamentale : hiérarchie claire, densité maîtrisée

Chaque page a une **hiérarchie d'information lisible en 3 secondes** : titre/contexte → données principales → actions.

```tsx
// ✅ Correct — hiérarchie claire
<PageLayout>
  <PageHeader title="Éclair" subtitle="Dernière observation il y a 2 jours" />
  <HeroStats items={[notes, events, objectives]} />
  <RecentActivity limit={5} />
  <PageActions primary="Ajouter une observation" />
</PageLayout>

// ❌ Interdit — mur de contenu sans hiérarchie
<div className="grid grid-cols-4">
  {/* 12 widgets, tous au même niveau visuel */}
</div>
```

---

## Ce que Copilot ne doit JAMAIS concevoir

| Interdit | Alternative |
|----------|------------|
| Tableaux avec plus de 6 colonnes sans scroll horizontal contrôlé | Colonnes prioritaires + expandable row |
| Formulaires complètement libres sans validation temps réel | Zod + React Hook Form avec feedback inline |
| Modales bloquantes avec plus de 2 CTA | Sheet/Drawer avec navigation interne |
| Textes d'erreur techniques | Messages humains avec suggestion d'action |
| Loading global bloquant (spinner plein écran) | Skeleton screens par section |
| Navigation breadcrumb de plus de 4 niveaux | Revoir l'architecture de navigation |
| Boutons `Annuler` / `Confirmer` sans contexte | "Supprimer Éclair" / "Garder Éclair" |
| Messages système (`400 Bad Request`) exposés | Toast informatif avec action corrective |
| Couleurs uniquement pour signifier une information | Toujours doubler avec icône ou texte |
| `dangerouslySetInnerHTML` sans DOMPurify | Sanitiser systématiquement |

---

## Onboarding — driver.js

L'onboarding web utilise **driver.js** (MIT, 5kb, zero deps).

### Flag de complétion
```typescript
// Stocké en cookie HttpOnly côté serveur
// app/api/onboarding/route.ts
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('onboarding_completed', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365, // 1 an
    sameSite: 'strict',
  });
  return response;
}
```

### Implémentation
```typescript
// features/onboarding/components/OnboardingTour.tsx
'use client';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useEffect } from 'react';

export function OnboardingTour({ completed }: { completed: boolean }) {
  useEffect(() => {
    if (completed) return;

    const driverObj = driver({
      popoverClass: 'mdb-driver-popover',
      nextBtnText: 'Suivant →',
      prevBtnText: '← Retour',
      doneBtnText: "C'est parti !",
      steps: [
        { element: '#nav-animals', popover: { title: 'Vos chevaux', description: 'Retrouvez ici tous vos compagnons équestres.' }},
        { element: '#btn-add-note', popover: { title: 'Ajoutez une observation', description: 'Notez en quelques secondes ce que vous observez.' }},
        { element: '#nav-calendar', popover: { title: 'Calendrier', description: 'Planifiez et suivez tous vos événements.' }},
        { element: '#nav-stats', popover: { title: 'Statistiques', description: 'Analysez les tendances sur la durée.' }},
      ],
      onDestroyed: () => fetch('/api/onboarding', { method: 'POST' }),
    });

    driverObj.drive();
  }, [completed]);

  return null;
}
```

### Thème CSS (dans `globals.css`)
```css
.mdb-driver-popover {
  --dp-bg-color: var(--color-surface);
  --dp-text-color: var(--color-foreground);
  --dp-btn-bg-color: var(--color-primary);
  --dp-progress-color: var(--color-primary);
  font-family: var(--font-body);
  border-radius: 12px;
}
```

- Réactivable depuis les Settings : appel `DELETE /api/onboarding` qui supprime le cookie

---

## Mode Pro — Densité adaptative

Le mode pro affiche plus d'informations par écran pour les utilisateurs `manager` et `pro`.

```tsx
// ✅ Pattern densité adaptative
const { hasRole } = useCurrentUser();
const isDense = hasRole('pro') || hasRole('manager');

<DataTable
  columns={isDense ? allColumns : essentialColumns}
  pageSize={isDense ? 25 : 10}
/>
```

- Le mode pro s'active **automatiquement** selon les rôles — pas de toggle manuel
- Les utilisateurs `free` voient une version simplifiée avec un CTA upgrade discret

---

## Statistiques — Recharts thémé

Les pages stats utilisent **Recharts** thémé avec la palette équestre.

```tsx
// features/statistics/components/ActivityChart.tsx
const CHART_COLORS = {
  primary: 'var(--color-primary)',     // baie #956540
  secondary: 'var(--color-secondary)', // alezan #CE9871
  muted: 'var(--color-muted)',         // isabelle #C9B69F
};

<LineChart data={data}>
  <Line type="monotone" dataKey="notes" stroke={CHART_COLORS.primary} strokeWidth={2} />
  <XAxis tick={{ fill: 'var(--color-foreground-muted)', fontSize: 12 }} />
  <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
</LineChart>
```

- Toutes les couleurs des charts via variables CSS — jamais de valeurs hardcodées
- Les axes et tooltips utilisent les fonts et couleurs du design system
- Préférer les `LineChart` pour les tendances, `BarChart` pour les comparaisons

---

## Animations — Transitions douces

### Animate-in au montage
```tsx
// Classe utilitaire Tailwind (définie dans globals.css)
<Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
```

### Définition dans `globals.css`
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-in-from-bottom-4 {
  from { transform: translateY(1rem); }
  to { transform: translateY(0); }
}
```

- Durée standard : 200-300ms
- Timing : `ease-out` pour les entrées, `ease-in` pour les sorties
- Pas d'animation sur les listes longues (performance) — uniquement sur les containers

---

## Dark Mode — Chaud et Cohérent

Le dark mode n'est **jamais froid** (pas de bleu-gris standard). Les surfaces sombres restent dans les tons baie/brun.

```css
/* globals.css */
[data-theme="dark"] {
  --color-background: #1a1210;     /* brun très sombre, chaud */
  --color-surface:    #241a17;     /* brun foncé, cartes */
  --color-surface-2:  #2e2118;     /* hover states */
  --color-foreground: #f0e8e0;     /* blanc cassé chaud */
  --color-foreground-muted: #a09080;
  --color-border:     #3d2e28;
  --color-primary:    #c07848;     /* baie éclaircie pour contraste */
}
```

- `next-themes` gère la persistance — attribut `data-theme` sur `<html>`
- Les charts et illustrations s'adaptent via les mêmes variables CSS
- Tester chaque nouveau composant en dark mode avant de considérer la tâche terminée

---

## Glassmorphism — Drawers et Overlays

Réservé aux sidebars flottantes, drawers, et overlays de navigation.

```tsx
// components/layout/Sidebar.tsx — effect verre sur fond image
<aside className="backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
  {children}
</aside>
```

```css
/* globals.css — classe utilitaire */
.glass-surface {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background-color: color-mix(in srgb, var(--color-surface) 85%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
}
```

- Ne pas appliquer sur les éléments interactifs principaux (boutons, inputs)
- Ne pas empiler plus de 2 niveaux de glassmorphism

---

## Micro-copie — Ton chaleureux

| Situation | ❌ Interdit | ✅ Recommandé |
|-----------|------------|--------------|
| Page sans données | "No data available" | "Aucun événement à venir. Planifiez une sortie ?" |
| Formulaire vide | "This field is required" | "Donnez un nom à votre cheval" |
| Action réussie | "Success" | "Observation enregistrée ✓" |
| Erreur serveur | "Internal Server Error" | "Quelque chose s'est mal passé. Réessayez ou contactez le support" |
| Quota atteint | "Limit reached" | "Limite du plan gratuit atteinte. [Voir les offres →]" |
| Chargement | (spinner) | Skeleton en tons isabelle |
| Export prêt | "Download ready" | "Votre fichier est prêt à télécharger" |
| Session expirée | "Please log in again" | "Votre session a expiré. Reconnectez-vous" |

---

## Anti-patterns UX stricts

- Pages sans état de chargement défini (skeleton ou spinner) → NON
- Formulaires qui perdent les données à la navigation → NON (persister dans React Hook Form ou SWR mutate)
- CTAs génériques ("Valider", "OK", "Submit") → NON (toujours contextuel)
- Toast/notification sans durée de fermeture automatique → NON (max 5 secondes)
- Graphs sans légende ni axe libellé → NON
- Accès à des données non autorisées sans redirect → NON (middleware protège toujours)
- Breakpoints mobile non testés → NON (tester sm:, md:, lg: sur chaque page)
