# Spécification du design system Vasco Web

## 1. Objectif

Le design system doit permettre de composer tous les écrans Vasco sans valeur visuelle récurrente locale, sans dupliquer un comportement et sans confondre composant générique et règle métier.

Ordre de construction : fondations → primitives → composants → patterns → écrans → prototypes.

## 2. Modèle de tokens

### Couches

1. **Primitives** : palettes OKLCH, nombres, familles typographiques.
2. **Sémantiques** : `bg/page`, `text/primary`, `action/primary`, `status/danger`.
3. **Matériaux** : Solid/Glass, élévation, blur, scrim.
4. **Composants** : hauteur, padding, gap, radius par size.
5. **Motion** : durée, easing et distance.

Les écrans ne consomment que les couches sémantiques, matériaux, composants et motion. Une primitive n'est jamais appelée directement dans une feature.

### Familles obligatoires

- couleur : page, surfaces, textes, bordures, actions, focus, statuts, catégories et charts ;
- typographie : font, size, weight, line-height, letter-spacing et chiffres tabulaires ;
- spacing : 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 ;
- size : touch, controls, icons, avatar, navigation ;
- radius : none, control, card, floating, pill ;
- border : subtle, default, strong, focus ;
- elevation : none, raised, floating, modal ;
- material : solid/opaque/translucent/blur ;
- motion : voir `web-motion-and-materials.md` ;
- layout : gutters fluides, max widths, rails, columns, z-index.

### Modes

Les axes sont indépendants et cumulables :

- luminosité : System, Light, Dark ;
- vision des couleurs : Standard, Accessible ;
- contraste plateforme : Normal, More, Forced colors ;
- mouvement : Full, Reduced ;
- transparence : Glass autorisé, Solid forcé ;
- pointeur : fine/coarse ;
- largeur : compact/medium/expanded/wide.

Un composant ne branche pas des couleurs locales selon le mode. Les aliases sémantiques changent de valeur.

## 3. Contrats de composants

Chaque composant Figma et code documente :

- anatomie et slots ;
- propriétés publiques ;
- contenu autorisé et limites ;
- tailles et densités ;
- états visuels et async ;
- clavier, focus, pointeur et tactile ;
- responsive/container behavior ;
- Light/Dark/Accessible/Forced colors ;
- Full/Reduced motion ;
- Solid/Glass si autorisé ;
- erreurs d'usage ;
- exemples métier et contre-exemples.

États minimaux selon pertinence : default, hover, focus-visible, pressed, selected, disabled, read-only, loading, success, warning, error, expanded, empty et Premium.

## 4. Catalogue cible

### Foundations

- couleurs et modes ;
- typographie ;
- spacing et grid ;
- radius, borders, elevation ;
- matériaux ;
- motion ;
- iconographie ;
- breakpoints et containers.

### Actions

- Button Primary, Secondary, Ghost, Destructive ;
- Icon Button ;
- Split/Menu Button seulement si besoin réel ;
- Link et inline action ;
- FAB/global create seulement sur compact si validé ;
- Command/Search trigger.

Tailles proposées : small 32, medium 40, large 48 CSS px ; la zone interactive vise 44 px quand le contrôle n'est pas dans une barre dense au pointeur fin. Les tailles finales sont validées dans Figma et par WCAG.

### Forms

- Field shell : label, required, helper, error, counter ;
- Text, Password, Textarea, Search ;
- Number + unit, Stepper, Slider ;
- Checkbox, Radio, Switch ;
- Select, Combobox, Multi-select ;
- Date, Time, Date range ;
- Segmented control et tabs quand la sémantique convient ;
- Animal selector et Group selector ;
- File/media upload ;
- Markdown editor minimal pour Notes ;
- Form section, sticky action bar et unsaved changes.

Ne pas construire un select custom si le natif ou Radix accessible couvre le besoin. Autocomplete, tags et choix multiples nécessitent des contrats clavier distincts.

### Navigation

- App rail expanded/collapsed ;
- Top app bar ;
- Compact navigation ;
- Breadcrumb ;
- Tabs ;
- Pagination ;
- Back link ;
- Page header ;
- Context switcher ;
- Notification et account menus.

### Content

- Card et interactive card ;
- List item ;
- Data row ;
- Event, Animal, Objective, Note, Group, Contact, Wish et Notification cards ;
- Linked Animals ;
- Metric card ;
- File item ;
- Timeline ;
- Calendar cell/event ;
- Table/Data grid ;
- Chart frame, legend, tooltip et accessible data table ;
- Image/avatar et fallback.

Une carte n'appelle pas l'API et ne décide pas sa navigation. Son parent fournit liens et callbacks.

### Feedback

- Spinner ;
- Skeleton ;
- Progress bar/stepper ;
- Toast ;
- Inline message ;
- Banner ;
- Empty state ;
- Error state ;
- Status badge ;
- Premium notice/gate ;
- Offline/stale indicator.

Les toasts ne contiennent pas l'unique copie d'une information critique et ne demandent pas une interaction complexe.

### Overlays

- Tooltip ;
- Popover ;
- Dropdown/action menu ;
- Dialog ;
- Alert dialog ;
- Drawer latéral ;
- Bottom drawer compact ;
- Command palette ;
- Media viewer ;
- Date/time picker.

Chaque overlay possède une politique de dismiss, focus, scroll, nesting et brouillon. Les overlays imbriqués sont évités ; picker et confirmation peuvent utiliser le top layer sans multiplier les scrims.

### Patterns

- App shell ;
- List exploration ;
- Master/detail ;
- Responsive editor ;
- Guided form ;
- Async section ;
- Filter bar ;
- Bulk selection si un besoin métier est validé ;
- Entity detail ;
- Premium journey ;
- Destructive confirmation ;
- Upload lifecycle ;
- Data visualization ;
- Permission/read-only state.

## 5. Responsive des composants

Les media queries gèrent le shell et les préférences utilisateur. Les modules réutilisables utilisent des container queries lorsque leur composition dépend de la place qui leur est réellement donnée. Référence : [MDN — CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries).

Chaque composant composé fournit au moins :

- narrow : empilé, libellés non tronqués ;
- regular : équilibre texte/actions ;
- wide : colonnes ou métadonnées supplémentaires si utiles.

Le contenu définit les seuils. Une `EventCard` placée dans un rail étroit doit utiliser son état narrow même sur un écran 1440 px.

## 6. Accessibilité du système

### Cible

WCAG 2.2 niveau AA minimum, avec exigences Vasco renforcées sur focus, cibles et contraste. La recommandation normative est [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

### Règles

- HTML natif avant ARIA ;
- un seul `h1`, landmarks et ordre de titres cohérent ;
- focus visible avec contraste et épaisseur stables ;
- focus jamais totalement masqué par sticky/floating UI ;
- contrastes 4,5:1 texte courant, 3:1 grand texte et composants significatifs ;
- 24 × 24 CSS px minimum WCAG AA, cible Vasco 44 × 44 pour contrôles d'application ;
- zoom 200 %, reflow 400 %, texte espacé et largeur 320 px ;
- information jamais portée seulement par couleur, position, hover ou animation ;
- erreur associée au champ et résumée pour un formulaire long ;
- annonces live réservées aux changements importants ;
- tables et graphiques possèdent une lecture textuelle ;
- authentification compatible gestionnaire de mots de passe et copier/coller ;
- alternatives aux gestes de drag ;
- `forced-colors` testé sans désactiver les couleurs système.

`prefers-contrast` est largement disponible et `forced-colors` doit recevoir des ajustements ciblés, pas un thème parallèle : [MDN — prefers-contrast](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-contrast) et [MDN — forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/forced-colors).

## 7. Data visualization

- Palette catégorielle contrôlée, testée Standard et Accessible.
- Couleur doublée par motif, forme, trait, icône ou libellé.
- Axe, unité, période et source de données explicites.
- Tooltip disponible au focus et au pointeur, jamais au hover seul.
- Dernier point réellement visible même pour une série d'une valeur.
- Tableau ou historique textuel équivalent.
- Valeur absente distincte de zéro.
- Données partielles signalées par banner et description.
- Animation initiale optionnelle, courte, sans masquer la valeur finale.

## 8. Iconographie

- Registre sémantique unique autour de Lucide ou de l'ensemble retenu.
- Tailles 16/20/24/32 et traits cohérents.
- Centrage optique vérifié, notamment cloche, animal, plus et ellipsis.
- Icône interactive avec nom accessible ; icône décorative cachée aux lecteurs d'écran.
- Pas de mélange de trois bibliothèques sur un même écran.
- Icône Premium toujours accompagnée d'un texte à sa première occurrence pertinente.

## 9. Qualité d'implémentation

- API composant typée, sans `any` ni props `customColor`/`customStyle` génériques.
- Variantes via un contrat centralisé ; pas de classe métier copiant la primitive.
- Server Components par défaut ; îlots client seulement pour interaction.
- Pas de structure principale en position absolue.
- Pas de hauteur de formulaire calculée depuis le viewport.
- Pas de z-index arbitraire ; échelle top-layer documentée.
- Pas de double implémentation Solid/Glass : un composant, deux matériaux.
- Tests de contrat pour les variantes et tests visuels aux états critiques.

## 10. Matrice Figma → code à produire

Avant implémentation, chaque famille reçoit un statut :

| Statut | Sens |
| --- | --- |
| Réutiliser | structure et accessibilité adaptées ; apparence retokenisée |
| Refactorer | comportement utile mais API ou DOM à reconstruire |
| Créer | aucune primitive cible n'existe |
| Retirer | dépendance ou composant devenu inutile |

Le fait qu'un composant Radix/Shadcn existe ne garantit ni que son API actuelle soit conservée, ni qu'il couvre le pattern Vasco. En revanche, une primitive éprouvée est préférée à un widget accessible recodé sans nécessité.
