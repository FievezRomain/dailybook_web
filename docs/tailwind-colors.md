# Thème et tokens web

## Principe

Vasco Web partage l’identité de marque et les rôles sémantiques avec le mobile, mais ses tokens sont implémentés en variables CSS adaptées au navigateur.

Les noms historiques liés aux robes animales (`baie`, `rouan`, `isabelle`, etc.) ne doivent pas servir de contrat générique de design system.

## Tokens sémantiques

```css
:root {
  --color-bg-page: ...;
  --color-bg-surface: ...;
  --color-bg-elevated: ...;
  --color-text-primary: ...;
  --color-text-secondary: ...;
  --color-border-default: ...;
  --color-action-primary: ...;
  --color-action-primary-hover: ...;
  --color-status-success: ...;
  --color-status-warning: ...;
  --color-status-danger: ...;
  --color-focus-ring: ...;
}

.dark { /* mêmes rôles, valeurs Dark */ }
```

Les valeurs finales viennent des maquettes web validées. Les tokens mobiles peuvent guider l’identité, pas imposer automatiquement une valeur ou une géométrie au web.

## Modes d’apparence

Les dimensions d’apparence sont indépendantes et cumulables :

- luminosité : `light`, `dark` ou préférence système via `next-themes` ;
- vision des couleurs : `standard` ou `accessible` via `data-color-vision` sur l’élément `html`.

Le mode `accessible` emploie une palette catégorielle inspirée d’Okabe-Ito et renforce les contrastes des actions, statuts, focus et graphiques. La préférence est conservée localement sous la clé `vasco-color-vision` et appliquée avant l’hydratation. Une teinte ne remplace jamais un texte, une icône, une forme, une valeur ou un motif permettant de comprendre l’information.

Les composants utilisent exclusivement les rôles `primary`, `destructive`, `success`, `warning`, `info`, `muted`, `border`, `ring` et `chart-*`. Ils ne testent jamais le mode accessible et ne choisissent jamais eux-mêmes une palette.

Les événements disposent en plus d’aliases métier dédiés, alignés sur l’app mobile : `event-soins` (isabelle), `event-rdv` (baie brun), `event-balade` (baie), `event-entrainement` (aubère), `event-concours` (alezan), `event-depense` (rouan) et `event-autre` (baie cerise). Ces aliases sont utilisés comme accents et surfaces légèrement teintées ; ils ne remplacent jamais le libellé ou l’icône du type. Le mode de vision accessible peut remapper leurs valeurs sans modifier les composants.

## Échelles communes

- Espacement : `control`, `surface`, `section`, `page-gutter`.
- Rayons : `control`, `surface`, `overlay`.
- Élévation : `surface`, `overlay`.
- Typographie structurante : `page-title`, `section-title`.

Les primitives partagées portent ces choix. Une feature ne doit pas recopier la géométrie d’un bouton, d’un champ, d’une carte ou d’un dialogue.

## Règles

- Utiliser un rôle sémantique, pas une couleur visuelle dans le nom.
- Ne pas coder une couleur récurrente dans un composant métier.
- Les couleurs de catégories d’événements passent par une table contrôlée, jamais par une chaîne utilisateur injectée dans `style`.
- Vérifier les contrastes WCAG AA dans Light et Dark.
- Le focus clavier doit être visible sur toutes les surfaces.
- Un état n’est jamais communiqué uniquement par couleur.
- Spacing, radius, ombres et typographie possèdent aussi des échelles de tokens.
