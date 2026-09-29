---
applyTo: "src/components/**,src/app/**,src/features/**,src/theme/**"
---

# Design System & UI/UX — Web MyDailyBook

## Charte graphique — Palette équestre
Tonalités chaudes et naturelles inspirées des robes de chevaux. Élégante, authentique, moderne.

```
Palette brute (référence uniquement — ne pas utiliser directement dans les composants)
  baie         rgb(149, 101, 64)     ← brun-roux, couleur primaire
  alezan       rgb(206, 152, 113)    ← cuivré clair, accent chaud
  isabelle     rgb(201, 182, 159)    ← beige doré, surfaces
  aubere       rgb(186, 168, 155)    ← gris rosé, neutres
  rouan        rgb(211, 204, 201)    ← gris clair, fonds
  baie-brun    rgb(105, 66, 51)      ← brun foncé, textes forts / hover
  baie-cerise  rgb(176, 113, 101)    ← rouge-brun, erreurs / destructif
  palomino     rgb(246, 230, 206)    ← crème, fonds secondaires
```

## Système de tokens à 3 niveaux

### Niveau 1 — Palette brute dans `globals.css` (ne JAMAIS utiliser directement dans les composants)
```css
:root {
  /* Palette brute — valeurs de référence uniquement */
  --palette-baie:         149, 101, 64;
  --palette-alezan:       206, 152, 113;
  --palette-isabelle:     201, 182, 159;
  --palette-aubere:       186, 168, 155;
  --palette-rouan:        211, 204, 201;
  --palette-baie-brun:    105, 66, 51;
  --palette-baie-cerise:  176, 113, 101;
  --palette-palomino:     246, 230, 206;
}
```

### Niveau 2 — Tokens sémantiques dans `globals.css` (à utiliser dans les composants via Tailwind)
```css
:root {
  /* Sémantique — changer ici pour changer partout */
  --color-primary:         rgb(var(--palette-baie));
  --color-primary-light:   rgb(var(--palette-alezan));
  --color-primary-dark:    rgb(var(--palette-baie-brun));
  --color-surface:         rgb(var(--palette-rouan));
  --color-surface-variant: rgb(var(--palette-isabelle));
  --color-background:      255, 255, 255;
  --color-background-alt:  rgb(var(--palette-palomino));
  --color-text:            30, 30, 30;
  --color-text-muted:      rgb(var(--palette-aubere));
  --color-error:           rgb(var(--palette-baie-cerise));
  --color-success:         rgb(var(--palette-alezan));
  --color-border:          rgb(var(--palette-rouan));

  /* Typographie */
  --font-body:    'Quicksand', sans-serif;
  --font-heading: 'Quicksand', sans-serif;

  /* Pour dark mode — overrides dans [.dark] */
}
```

### Niveau 3 — Tailwind consomme les variables CSS (`tailwind.config.ts`)
```typescript
theme: {
  extend: {
    colors: {
      primary:    'var(--color-primary)',
      'primary-light': 'var(--color-primary-light)',
      'primary-dark':  'var(--color-primary-dark)',
      surface:    'var(--color-surface)',
      'surface-variant': 'var(--color-surface-variant)',
      background: 'rgb(var(--color-background))',
      'background-alt': 'var(--color-background-alt)',
      'text-muted': 'var(--color-text-muted)',
    },
    fontFamily: {
      body:    ['var(--font-body)'],
      heading: ['var(--font-heading)'],
    },
  },
}
```

## Règle absolue des couleurs
**JAMAIS** de valeur brute dans les composants :
```tsx
// ❌ Interdit
<div className="bg-[#956540] text-white p-4">
<div style={{ backgroundColor: 'rgb(149,101,64)' }}>

// ✅ Correct
<div className="bg-primary text-white p-4">
<div className="bg-primary-light/20 border border-primary/30">
```

## Fontes — déclaration unique dans `app/layout.tsx`
```typescript
// app/layout.tsx
import { Quicksand } from 'next/font/google';

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});

export default function RootLayout({ children }) {
  return <html lang="fr" className={quicksand.variable}>{children}</html>;
}
```
La font est déclarée **une seule fois** — elle est disponible via `var(--font-body)` partout.

## Effets visuels modernes

### Glassmorphism (cartes en overlay, modales, sidebars)
```tsx
// Classe Tailwind custom à définir dans globals.css ou via @layer
<div className="glass-card">
  {children}
</div>

/* globals.css */
@layer components {
  .glass-card {
    background: rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: var(--radius);
  }
  .glass-card-warm {
    background: rgba(var(--palette-palomino), 0.35);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(var(--palette-alezan), 0.3);
    border-radius: var(--radius);
  }
}
```
Utiliser sur : les drawers/sheets d'action, les cartes en overlay sur les photos de chevaux, les headers de section.

### Neumorphisme léger (badges, indicateurs, boutons secondaires)
```css
@layer components {
  .neu-surface {
    background: rgb(var(--palette-palomino));
    box-shadow:
      4px 4px 10px rgba(var(--palette-baie-brun), 0.12),
      -4px -4px 10px rgba(255, 255, 255, 0.7);
    border-radius: var(--radius);
  }
}
```
Utiliser avec parcimonie : profil animal, résumé statistiques. Jamais sur les CTAs principaux.

### Micro-animations — `tailwindcss-animate` + `tw-animate-css`
```tsx
// Apparition d'une carte
<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
  <AnimalCard />
</div>

// État de chargement skeleton
<div className="animate-pulse bg-surface rounded-lg h-32" />

// Bouton — feedback tactile
<button className="transition-all duration-150 active:scale-95 hover:brightness-105">
  Enregistrer
</button>

// Drawer/Sheet — entrée depuis le bas
// Utiliser les animations natives de shadcn/ui (vaul ou radix dialog)
```

**Transitions de page :** utiliser `animate-in fade-in duration-200` sur le wrapper de chaque page.

**Listes :** chaque item apparaît avec un délai progressif :
```tsx
{animals.map((animal, index) => (
  <div key={animal.id} className={`animate-in fade-in slide-in-from-bottom-2 duration-300`}
       style={{ animationDelay: `${index * 60}ms` }}>
    <AnimalCard animal={animal} />
  </div>
))}
```

## Composants shadcn/ui — bonnes pratiques
- Les composants `components/ui/` sont les primitives Radix wrappées — les modifier uniquement pour le style, pas la logique
- Sheet/Drawer pour les formulaires (pas les Dialog modaux plein-écran)
- Sonner (`toast`) pour les feedbacks d'action (create, update, delete)
- Les icônes : Lucide React uniquement pour la cohérence

## Dark mode — `next-themes`
```css
/* globals.css — overrides dark */
.dark {
  --color-primary:        rgb(var(--palette-alezan));      /* plus clair en dark */
  --color-background:     20, 16, 14;                      /* fond très sombre chaud */
  --color-background-alt: 30, 22, 18;
  --color-surface:        rgb(var(--palette-baie-brun));
  --color-text:           246, 230, 206;                   /* palomino clair */
}
```

## Accessibilité minimale
- Contraste minimum 4.5:1 texte normal, 3:1 texte large (WCAG AA)
- Focus visible sur tous les éléments interactifs — ne jamais `outline: none` sans alternative
- Attributs `aria-*` sur les composants Radix (déjà fournis) — ne pas les supprimer
- `alt` descriptif sur toutes les images (`alt=""` pour les images purement décoratives)
