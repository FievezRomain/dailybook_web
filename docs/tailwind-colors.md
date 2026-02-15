# 🎨 Tailwind CSS & Gestion des couleurs

## Vue d'ensemble

Le projet utilise **Tailwind CSS v4** avec **shadcn/ui** (style `new-york`). Le système de couleurs est entièrement basé sur des **variables CSS** définies dans `src/app/globals.css`, ce qui permet de gérer le **dark mode** et de maintenir une charte graphique cohérente.

---

## Architecture des couleurs

Le système repose sur **3 couches** de variables CSS qui se complètent :

```
Couche 1 : Variables "charte" (valeurs RGB brutes)
    ↓
Couche 2 : Variables "shadcn" (mappées vers la charte)
    ↓
Couche 3 : @theme inline (Tailwind consomme les variables shadcn)
```

### Couche 1 — Variables de la charte (`--color-*`)

Définies en **valeurs RGB brutes** (sans `rgb()`), ce qui permet de les utiliser avec des opacités dynamiques via `rgba()`.

```css
:root {
    --color-primary: 206, 152, 113;
    --color-baie: 149, 101, 64;
    --color-alezan: 206, 152, 113;
    --color-background: 255, 255, 255;
    --color-error: 176, 113, 101;
    /* ... */
}
```

> 💡 Les noms de couleurs sont inspirés des **robes de chevaux** : baie, alezan, isabelle, rouan, aubère, palomino, baie-cerise, baie-brun.

**Utilisation directe en CSS/SCSS :**

```css
color: rgb(var(--color-baie));
background: rgba(var(--color-alezan), 0.5);
```

**Utilisation dans les classes Tailwind (valeurs arbitraires) :**

```html
<p class="text-[rgb(var(--color-baie))]">Texte baie</p>
<div class="bg-[rgba(var(--color-error),0.08)]">Erreur</div>
```

### Couche 2 — Variables shadcn (`--background`, `--primary`, etc.)

Ces variables sont mappées vers les couleurs de la charte et utilisent le format **oklch** pour les gris neutres shadcn :

```css
:root {
    --background: rgb(var(--color-background-paper));
    --primary: rgb(var(--color-baie));
    --secondary: rgb(var(--color-secondary));
    --foreground: oklch(0.145 0 0);
    --card: oklch(1 0 0);
    --muted-foreground: oklch(0.556 0 0);
    --border: oklch(0.922 0 0);
    /* ... */
}
```

**Utilisation dans les classes Tailwind (via `@theme inline`) :**

```html
<div class="bg-background text-foreground">...</div>
<button class="bg-primary text-primary-foreground">...</button>
<p class="text-muted-foreground">Texte secondaire</p>
```

### Couche 3 — `@theme inline` (pont vers Tailwind)

Le bloc `@theme inline` dans `globals.css` enregistre les variables CSS comme **couleurs Tailwind natives** :

```css
@theme inline {
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-primary: var(--primary);
    --color-card: var(--card);
    --color-border: var(--border);
    --color-baie: var(--baie);
    --color-rouan: var(--rouan);
    /* ... */
}
```

Grâce à ça, on peut écrire directement :

```html
<div class="bg-card text-card-foreground border-border">...</div>
<span class="text-baie">Couleur baie</span>
```

---

## Dark mode

Le dark mode est géré par **`next-themes`** avec l'attribut `class` sur `<html>`.

Le fichier `globals.css` définit un bloc `.dark` qui redéfinit les mêmes variables avec des valeurs adaptées :

```css
:root {
    --background: rgb(var(--color-background-paper));  /* clair */
    --card: oklch(1 0 0);                               /* blanc */
    --foreground: oklch(0.145 0 0);                     /* quasi-noir */
}

.dark {
    --background: rgb(var(--color-background-paper));  /* gris foncé */
    --card: rgb(var(--color-background));               /* plus foncé */
    --foreground: oklch(0.985 0 0);                     /* quasi-blanc */
}
```

> Les couleurs de la charte (baie, alezan, etc.) restent **identiques** en dark mode — seuls les fonds, textes et bordures changent.

Le toggle est dans `src/components/ModeToggle.tsx` :

```tsx
const { setTheme, resolvedTheme } = useTheme();
// Bascule entre 'dark' et 'light'
```

---

## Comment utiliser les couleurs

### ✅ Bonnes pratiques

```html
<!-- Utiliser les variables shadcn via Tailwind -->
<div class="bg-background text-foreground border-border">...</div>
<button class="bg-primary text-primary-foreground">...</button>

<!-- Utiliser les couleurs de la charte avec des valeurs arbitraires -->
<p class="text-[rgb(var(--color-baie))]">Texte baie</p>
<div class="bg-[rgba(var(--color-error),0.08)]">Fond erreur léger</div>

<!-- Utiliser les couleurs enregistrées dans @theme inline -->
<span class="text-baie">Direct via @theme</span>
```

### ❌ À éviter

```html
<!-- Ne JAMAIS mettre de couleurs en dur -->
<div class="bg-[#956540]">...</div>
<p style="color: #333">...</p>

<!-- Ne pas utiliser les variables oklch directement -->
<div class="bg-[oklch(0.145 0 0)]">...</div>
```

### Utilisation en SCSS

```scss
// Utiliser les variables CSS
.my-class {
    color: var(--foreground);
    background: var(--card);
    border: 1px solid var(--border);
}

// Utiliser les variables charte avec rgb()
.gradient {
    background: linear-gradient(
        135deg,
        rgba(var(--color-baie), 1),
        rgba(var(--color-alezan), 1)
    );
}
```

---

## Palette complète

### Couleurs de la charte (robes de chevaux)

| Variable | Couleur | RGB | Usage |
|---|---|---|---|
| `--color-primary` / `--color-alezan` | 🟫 Alezan | `206, 152, 113` | Couleur principale, accents |
| `--color-baie` | 🟤 Baie | `149, 101, 64` | CTA, liens, primary shadcn |
| `--color-baie-brun` | 🟫 Baie-brun | `105, 66, 51` | Titres foncés |
| `--color-baie-cerise` | 🔴 Baie-cerise | `176, 113, 97` | Destructif léger |
| `--color-isabelle` | 🟡 Isabelle | `201, 182, 159` | Accents doux |
| `--color-rouan` | ⚪ Rouan | `211, 204, 201` | Fonds clairs, bordures |
| `--color-aubere` | 🟠 Aubère | `186, 168, 155` | Info, secondaire |
| `--color-palomino` | 🟡 Palomino | `246, 230, 206` | Warning |
| `--color-gris` | ⚪ Gris | `248, 235, 232` | Placeholders |

### Couleurs sémantiques

| Variable | Mapping | Usage |
|---|---|---|
| `--color-success` | Alezan | Succès |
| `--color-info` | Aubère | Information |
| `--color-warning` | Palomino | Avertissement |
| `--color-error` | `176, 113, 101` | Erreurs |

### Variables shadcn/ui

| Variable | Usage |
|---|---|
| `--background` | Fond de page |
| `--foreground` | Texte principal |
| `--card` / `--card-foreground` | Fond et texte des cartes |
| `--primary` / `--primary-foreground` | Boutons principaux |
| `--secondary` / `--secondary-foreground` | Boutons secondaires |
| `--muted` / `--muted-foreground` | Texte discret, labels |
| `--accent` / `--accent-foreground` | Hover, focus |
| `--destructive` | Actions destructrices |
| `--border` | Bordures |
| `--input` | Bordures d'inputs |
| `--ring` | Focus ring |

---

## Fichiers clés

| Fichier | Rôle |
|---|---|
| `src/app/globals.css` | Définition de toutes les variables CSS (light + dark) + `@theme inline` |
| `tailwind.config.ts` | Enregistrement des couleurs Tailwind (hsl → variables) |
| `components.json` | Configuration shadcn/ui (style, aliases, baseColor) |
| `postcss.config.mjs` | Plugin `@tailwindcss/postcss` |
