# Plan de production des maquettes Figma Vasco Web

## 1. Objectif

Ce plan est le backlog exécutable des maquettes web. Il précise ce que le MCP Figma devra créer, dans quel ordre, avec quelles dépendances, variantes, largeurs et validations.

Il ne demande pas de capturer ou reproduire le front actuel. Les écrans sont composés à partir des règles métier et du corpus UX/UI web. Une capture du front legacy peut seulement aider à vérifier qu'une capacité fonctionnelle n'a pas été oubliée.

## 2. Unité de suivi

Une **source screen** est la composition canonique d'un écran ou état. Une source peut ensuite être déclinée selon :

- largeur : Compact 390, Medium 768, Expanded 1024, Wide 1440 ;
- thème : Light ou Dark par variables ;
- vision : Standard ou Accessible par variables ;
- matériau : Solid ou Glass lorsque autorisé ;
- mouvement : Full ou Reduced dans le prototype.

Les variantes ne doivent pas provoquer une multiplication mécanique des frames. Utiliser les modes de variables et les propriétés de composants ; créer des frames séparées seulement pour comparer visuellement une rupture de layout, un état important ou un fallback.

Le backlog comprend 8 spécimens de fondation, 12 patterns, 99 source screens ou états métier, 17 overlays transversaux et 16 prototypes. Ces nombres décrivent les sources canoniques, pas leur multiplication par thème ou largeur.

### Convention de suivi

- `[ ]` : non commencé ou non vérifié ;
- `[x]` : terminé dans Figma, contrôlé visuellement et documenté ;
- une clôture de lot reste décochée tant que toutes ses sources, variantes requises, captures et critères de sortie ne sont pas validés ;
- une source partiellement construite reste décochée et son avancement est précisé dans une sous-case ou une note datée ;
- les cases sont mises à jour après chaque session MCP, avec les node IDs dans `00 — Cover & Status`.

### Session MCP du 28 août 2026

- [x] Fichier web séparé créé : [Vasco Web](https://www.figma.com/design/CzdthSttGqMnjCh3ycZECp).
- [x] Structure des 21 pages alignée sur ce plan.
- [x] Couverture `Vasco Web` créée et contrôlée visuellement — node `8:2`.
- [x] Fondations techniques validées : 7 collections, 166 variables, 13 styles typographiques et 4 styles d'effet.
- [x] Spécimens visuels M0 produits et contrôlés dans `02 — Foundations` et `03 — Motion & Materials`.
- [x] Bibliothèque de composants M1 terminée — Actions, Formulaires, Navigation, Contenu, Feedback et Overlays validés avec leurs node IDs.

### Niveaux de couverture responsive

| Niveau | Frames requises | Usage |
| --- | --- | --- |
| R3 | Compact 390 + Medium 768 + Wide 1440 | shell, pages racines et formulaires structurants |
| R2 | Compact 390 + Wide 1440 | détails et états métier importants |
| R1 | Wide 1440 ou Compact 390 représentatif | confirmation ou état réutilisant un pattern validé |

Expanded 1024 est ajouté dès qu'une composition change entre Medium et Wide. Ultra-wide 1920 est une frame de validation du shell, pas une déclinaison de chaque écran.

## 3. Ordre impératif pour le MCP Figma

Avant toute écriture :

1. obtenir le `fileKey` du fichier Vasco Web ;
2. charger les instructions `figma-use` avant chaque écriture et `figma-generate-design` pour les vues composées ;
3. rechercher les fichiers Code Connect `*.figma.ts(x)` pour les composants nécessaires ;
4. inspecter les écrans déjà présents dans le fichier ;
5. rechercher ensuite seulement les bibliothèques, composants, variables et styles non résolus ;
6. remplir la carte de dépendances du lot ;
7. créer le wrapper de la vue ;
8. construire une seule section majeure par appel MCP ;
9. utiliser des instances et variables liées ;
10. prendre une capture de chaque section puis de la vue complète ;
11. vérifier Quicksand explicitement ;
12. retourner et enregistrer les node IDs créés.

Pour une future capture d'une application web contenant des photos, avatars ou images, lancer aussi la capture de rendu dans le même fichier afin de récupérer les `imageHash`, puis supprimer la capture après transfert. Cela ne rend pas la géométrie legacy normative.

## 4. Pages Figma et zones de travail

| Page | Contenu à produire | Condition de sortie |
| --- | --- | --- |
| `00 — Cover & Status` | nom, liens docs, version, état des lots, légende | statut et source de vérité lisibles |
| `01 — Principles` | personnalité, principes UX, anti-patterns, responsive | décisions produit validées |
| `02 — Foundations` | variables, typo, grilles, icônes, elevation | modes et bindings complets |
| `03 — Motion & Materials` | tokens, Glass/Solid, reduced variants | prototypes de fondation validés |
| `04 — Actions` | boutons, liens, icon buttons, création globale | composants publiables |
| `05 — Forms` | fields, sélections, dates, uploads, form shell | états et clavier annotés |
| `06 — Navigation` | rail, top bar, compact nav, tabs, breadcrumb | shell R3 composable |
| `07 — Content` | cartes, listes, timeline, calendrier, graphiques | familles métier composables |
| `08 — Feedback` | async, toast, banner, empty, error, Premium | états transversaux complets |
| `09 — Overlays` | popover, menu, dialog, drawer, viewer | focus et dismiss documentés |
| `10 — Patterns` | list, master/detail, editor, guided form | patterns R3 validés |
| `11–18 — Screens` | sources par domaine listées ci-dessous | couverture de la matrice |
| `19 — Prototypes` | journeys numérotés | entrées, sorties et retours testables |
| `99 — Archive & Rollback` | snapshots avant changements majeurs | aucune source active archivée |

## 5. Lot M0 — Fondations

- [x] **Clôture du lot M0** — variables, spécimens, modes et contrôles de fondation sont complets.

### M0.1 Variables

- [x] Primitives de couleurs Vasco.
- [x] Couleurs sémantiques Light/Dark.
- [x] Modes Standard/Accessible.
- [x] Surfaces Solid et Glass.
- [x] Spacing, size, radius, border et elevation.
- [x] Grilles et gutters fluides.
- [x] Motion duration/easing/distance.
- [x] Z-index documenté côté handoff, même s'il n'est pas une variable Figma utile.

### M0.2 Spécimens

| Statut | ID | Source | Couverture |
| --- | --- | --- | --- |
| [x] | FND-01 | Color roles | Light/Dark × Standard/Accessible |
| [x] | FND-02 | Typography scale | Quicksand, français, chiffres, textes longs |
| [x] | FND-03 | Spacing and grid | 390/768/1024/1440/1920 |
| [x] | FND-04 | Radius, border, elevation | Light/Dark |
| [x] | FND-05 | Solid and Glass materials | nominal, arrière-plan difficile, fallback |
| [x] | FND-06 | Focus and interaction states | clavier, pointer, forced colors annoté |
| [x] | FND-07 | Iconography | 16/20/24/32, centrage optique |
| [x] | FND-08 | Motion tokens | Full/Reduced |

Sortie M0 : aucune valeur récurrente nécessaire à M1 n'est encore hardcodée.

## 6. Lot M1 — Bibliothèque de composants

- [x] **Clôture du lot M1** — toutes les familles nécessaires aux patterns existent comme composants liés et documentés.

### M1.1 Actions et formulaires

- [x] Button, Destructive Button, Icon Button et Text Link.
  - [x] `Button / Primary` — 3 tailles × 6 états, propriétés Label/Icon, icône désactivée par défaut.
  - [x] `Button / Secondary` — 3 tailles × 6 états, propriétés Label/Icon, icône désactivée par défaut.
  - [x] `Button / Ghost` — 3 tailles × 6 états, propriétés Label/Icon, icône désactivée par défaut.
  - [x] `Button / Destructive` — 3 tailles × 6 états, propriétés Label/Icon, icône désactivée par défaut.
  - [x] `Icon Button` — 4 styles × 3 tailles × 6 états, forme circulaire `radius/full`, cible minimale 44 px et nom accessible.
  - [x] `Text Link / Navigation` — 20 variantes avec état Visited.
  - [x] `Text Link / Action` — 30 variantes avec état Pressed et ton Destructive.
- [x] Search/Command trigger.
  - [x] `Search / Command Trigger` — Search/Command × Compact/Wide × 5 états, focus visible, raccourci Ctrl/⌘ K et noms accessibles compacts — node `106:146`.
- [x] Field shell, Text, Password, Textarea et Number.
  - [x] `Text Input / Text` — 3 tailles × 7 états, propriétés Value/Placeholder.
  - [x] `Field Shell` — label, requis, aide, erreur, compteur et contrôle échangeable.
  - [x] `Password Input` — 3 tailles × 5 états × 2 visibilités, propriétés Value/Placeholder/nom accessible du contrôle, icônes Eye/EyeOff privées.
    - [x] Implémentation : `autocomplete="current-password"` à la connexion et `autocomplete="new-password"` à la création ou modification.
    - [x] Le basculement afficher/masquer conserve la valeur, la sélection, la position du curseur et le focus.
    - [x] Le contrôle est un bouton avec un nom accessible dynamique : « Afficher le mot de passe » / « Masquer le mot de passe ».
  - [x] `Textarea` — 3 tailles × 7 états, propriétés Value/Placeholder, hauteurs initiales 96/120/160 liées aux tokens.
    - [x] Alignement du contenu en haut et retour à la ligne natif.
    - [x] Redimensionnement vertical autorisé sur desktop lorsque le layout le permet ; hauteur stable sur tactile.
  - [x] `Number Input` — 3 tailles × 7 états, propriétés Value/Placeholder/Unit et affichage optionnel de l’unité.
    - [x] Spinners natifs désactivés ; `inputmode="decimal"` ou `inputmode="numeric"` choisi selon la donnée.
    - [x] Virgule française acceptée puis normalisée sans altérer silencieusement la valeur saisie.
    - [x] Les actions −/+ éventuelles utilisent des Icon Buttons externes avec cible minimale de 44 px.
- [x] Checkbox, Radio, Switch et Segmented control.
  - [x] `Checkbox` — 2 tailles × 4 états × 3 sélections, propriétés Label/Show label et cible interactive minimale de 44 px.
    - [x] État Indeterminate réservé aux sélections partielles et annoncé comme `mixed` aux technologies d’assistance.
    - [x] Le libellé complet active la case ; focus clavier visible et ordre DOM natif conservé.
  - [x] `Radio` — 2 tailles × 4 états × 2 sélections, propriétés Label/Show label et cible interactive minimale de 44 px.
    - [x] Groupe nommé, une seule valeur active ; Tab entre/sort du groupe et les flèches déplacent la sélection.
  - [x] `Switch` — 2 tailles × 4 états × 2 valeurs, propriétés Label/Show label et cible interactive minimale de 44 px.
    - [x] Réservé aux réglages appliqués immédiatement ; le nom accessible comprend le libellé et l’état On/Off.
    - [x] Transition thumb/surface avec tokens Motion ; aucun déplacement animé en Reduced Motion.
  - [x] `Segmented Control / Item` — 2 tailles × 4 états × 2 sélections, propriété Label et cible interactive minimale de 44 px.
    - [x] Composer 2 à 4 instances dans un groupe exclusif ; une seule sélection et navigation fléchée.
- [x] Select, Combobox et Multi-select.
  - [x] `Select` — 2 tailles × 6 états, propriété Value, focus, ouverture, erreur et désactivé validés — node `70:136`.
  - [x] `Combobox` — 2 tailles × 6 états, recherche, liste ouverte, résultats, état vide et désactivé — node `72:204`.
  - [x] `Multi-select` — 2 tailles × 6 états, chips, liste ouverte, débordement résumé et désactivé — node `73:210`.
- [x] Date, Time et Range.
  - [x] `Date Input` — 2 tailles × 6 états, calendrier mensuel, focus, erreur et désactivé — node `78:318`.
  - [x] `Time Input` — 2 tailles × 7 états, saisie manuelle ou sélecteur, format 24 h et raccourci Maintenant — node `79:212`.
  - [x] `Date Range` — 2 tailles × 6 états, calendriers début/fin distincts, raccourcis et validation chronologique — node `80:332`.
- [x] Animal Selector et Group Selector.
  - [x] `Animal Selector / Rail` — Compact/Wide, défilement horizontal, anneau Vasco uniquement sur la sélection, propriétaire, partagé et historique — node `92:409` ; item privé `91:157`.
  - [x] `Group Selector` — 2 tailles × 7 états, sans monogramme décoratif, rôles, éligibilité expliquée et Premium discret sur surface neutre — node `86:250`.
- [x] File/Media Upload.
  - [x] `File Media Upload` — 2 tailles × 2 types × 6 états, icône fichier stable, progression, retry, succès, retrait et désactivé — node `88:316`.
- [x] Sticky Form Actions et Step Progress.
  - [x] `Sticky Form Actions` — Compact/Wide × 6 états, boutons existants, dirty, submitting, succès et erreur — node `99:475`.
  - [x] `Step Progress` — Compact/Wide × 4 états, progression guidée et erreur rattachée à l’étape — node `100:489`.

### M1.2 Navigation et contenu

- [x] App Rail expanded/collapsed.
  - [x] `App Rail` — Expanded/Collapsed, trigger Command, création globale, destinations stables, notifications, compte et règles responsive documentées — node `111:221` ; item privé `109:62`.
- [x] Top App Bar et Compact Navigation.
  - [x] `Top App Bar` — Compact/Wide × Top/Scrolled, accès globaux compacts, contexte Wide et fallback Solid documenté — node `115:177`.
  - [x] `Compact Navigation` — Floating/Edge, cinq destinations stables, sémantique clavier et zoom documentée — node `117:259` ; item privé `116:682`.
- [x] Breadcrumb, Tabs, Pagination et Back Link.
  - [x] `Breadcrumb` — Compact/Wide, hiérarchie résumée sur petite largeur et page courante explicite — node `125:248`.
  - [x] `Tabs` — Compact/Wide, états default, hover, active, focus et disabled, navigation clavier documentée — node `126:277` ; item privé `126:250`.
  - [x] `Pagination` — Compact/Wide, page courante, position résumée et contrôles précédent/suivant — node `127:314` ; item privé `127:283`.
  - [x] `Back Link` — 5 états, retour contextuel et restauration du contexte documentés — node `127:370`.
- [x] Page Header et Context Switcher.
  - [x] `Page Header` — Compact/Wide, identité de page, volume et action primaire identiques entre largeurs — node `130:859`.
  - [x] `Context Switcher` — Compact/Wide × Default/Open/Focus/Disabled, portée globale, animal actif et provenance partagée — node `131:611` ; option privée `131:402`.
- [x] Card, Interactive Card, List Item et Data Row.
  - [x] `Card` — Narrow/Regular/Wide, surface statique autonome et reflow par conteneur — node `133:25`.
  - [x] `Interactive Card` — Narrow/Regular/Wide × Default/Hover/Focus/Pressed/Disabled, détail et menu d’entité distincts — node `133:304`.
  - [x] `List Item` — Narrow/Regular/Wide × Default/Hover/Focus/Selected/Disabled, sélection multicanal — node `133:556`.
  - [x] `Data Row` — Narrow/Regular/Wide × Default/Hover/Focus/Selected/Disabled, colonnes Wide et reflow étiqueté Narrow — node `133:817`.
- [x] Event, Animal, Objective, Metric, Note, Group, Contact, Wish et Notification Cards.
  - [x] `Event Card` — Narrow/Regular/Wide, horaire, animal, lieu, type et durée — node `136:384`.
  - [x] `Animal Card` — Narrow/Regular/Wide, identité, rappels et fraîcheur des informations — node `136:454`.
  - [x] `Objective Card` — Narrow/Regular/Wide, progression réelle et échéance — node `136:527`.
  - [x] `Metric Card` — Narrow/Regular/Wide, valeur, évolution et aperçu de tendance — node `137:545`.
  - [x] `Note Card` — Narrow/Regular/Wide, extrait, fraîcheur et objets liés — node `137:612`.
  - [x] `Group Card` — Narrow/Regular/Wide, rôle, activité et Premium discret sur surface neutre — node `137:685`.
  - [x] `Contact Card` — Narrow/Regular/Wide, fonction et coordonnées essentielles — node `138:679`.
  - [x] `Wish Card` — Narrow/Regular/Wide, contexte, budget et priorité discrète — node `138:746`.
  - [x] `Notification Card` — Narrow/Regular/Wide, provenance, message et actions explicites — node `138:819`.
- [x] Linked Animals, Status/Provenance Badge, Timeline et File Item.
  - [x] `Linked Animals` — Narrow/Regular/Wide, liste stable et provenance partagée sans anneau de sélection — node `140:986` ; item privé `140:856`.
  - [x] `Status / Provenance Badge` — statuts Success/Warning/Neutral distincts des provenances Owner/Shared/ReadOnly — node `139:1901`.
  - [x] `Timeline` — Narrow/Regular/Wide, dates textuelles, ordre chronologique et contexte de chaque entrée — node `141:1054`.
  - [x] `File Item` — Narrow/Regular/Wide × Default/Hover/Focus/Disabled, icône stable, type, taille, téléchargement et menu — node `141:1361`.
- [x] Calendar Cell/Event.
  - [x] `Calendar Cell` — Compact/Comfortable × Empty/Default/Today/Selected/Outside/Disabled, événements imbriqués et résumé explicite — node `145:1278`.
  - [x] `Calendar Event` — Compact/Regular × Default/Selected × cinq catégories contrôlées, accent coloré et libellé comme second canal — node `143:2364`.
- [x] Chart Frame, Legend, Tooltip et History Group.
  - [x] `Chart Frame` — Narrow/Regular/Wide × Data/Partial/Empty, unité, période, source et résumé textuel — node `148:1563`.
  - [x] `Legend` — Horizontal/Vertical × Standard/Accessible, libellés et formes distinctes — node `146:2420`.
  - [x] `Chart Tooltip` — Compact/Regular × Value/Partial/Unavailable, disponible au focus et au pointeur — node `146:2481`.
  - [x] `History Group` — Narrow/Regular/Wide × Data/Partial/Empty, alternative textuelle regroupée par période — node `147:1447`.

### M1.3 Feedback et overlays

- [x] Spinner, Skeleton et Progress.
  - [x] `Spinner` — Small/Medium/Large × Brand/Neutral, avec libellé persistant pour les attentes longues — node `150:14`.
  - [x] `Skeleton` — Text/Card/Avatar row × Compact/Comfortable, structure stable sans fond blanc parasite — node `150:41`.
  - [x] `Progress` — Linear/Circular × Active/Complete/Error, pourcentage et statut lisibles sans dépendre de la couleur — node `150:75`.
- [x] Toast, Inline Message et Banner.
  - [x] `Toast` — Info/Success/Error × None/Undo, fermeture explicite et pause au survol — node `152:77`.
  - [x] `Inline Message` — Info/Success/Warning/Error, persistant et attaché au contexte — node `152:102`.
  - [x] `Banner` — Info/Warning/Premium × None/Primary, Premium sur surface neutre avec accent fin — node `152:149`.
- [x] Empty/Error/Offline State.
  - [x] `System State` — Empty/Error/Offline × Compact/Page, données locales préservées et actions sûres — node `155:150`.
- [x] Premium Notice et Premium Comparison.
  - [x] `Premium Notice` — Inline/Card × Upgrade/Dismiss, surface neutre et accent de bordure discret — node `157:176`.
  - [x] `Premium Comparison` — Compact/Wide, comparaison Essentiel/Premium lisible ligne par ligne — node `157:247`.
- [x] Tooltip, Popover et Dropdown Menu.
  - [x] `Tooltip` — Label/Shortcut × Top/Bottom, visible au focus et au survol — node `160:22`.
  - [x] `Popover` — Compact/Regular × None/Primary, ancrage et restitution du focus documentés — node `160:49`.
  - [x] `Dropdown Menu` — Compact/Comfortable × None/Single, navigation clavier et raccourcis explicites — node `160:124`.
- [x] Dialog et Alert Dialog.
  - [x] `Dialog` — Compact/Regular × Single/Double, focus initial, Échap et retour au déclencheur — node `161:113`.
  - [x] `Alert Dialog` — Confirm/Destructive × Reversible/Irreversible, focus initial sur Annuler — node `161:176`.
- [x] Side Drawer et Compact Bottom Drawer.
  - [x] `Side Drawer` — Narrow/Regular × View/Edit, informations et actions complètes — node `162:243`.
  - [x] `Compact Bottom Drawer` — Peek/Expanded × View/Edit, mêmes capacités réordonnées pour largeur compacte — node `162:352`.
- [x] Command Palette, Media Viewer et Date/Time Picker.
  - [x] `Command Palette` — Global/Current page × Results/Empty, navigation clavier et Échap — node `164:312`.
  - [x] `Media Viewer` — Image/Document × Preview/Details, canvas brun profond, zoom et téléchargement — node `164:411`.
  - [x] `Date / Time Picker` — Date/Time/DateTime, calendrier cohérent et heure sélectionnable ou saisissable manuellement — node `164:640`.

Sortie M1 : chaque composant récurrent existe une fois comme composant ou component set, avec propriétés, variables et annotations accessibles.

## 7. Lot M2 — Patterns structurants

- [x] **Clôture du lot M2** — les douze patterns sont validés avant composition massive des écrans.

| Statut | ID | Pattern | Responsive | États requis |
| --- | --- | --- | --- | --- |
| [x] | PAT-01 | Public Shell | R3 | Light/Dark, contenu court/long — component set `167:518` |
| [x] | PAT-02 | Private App Shell | R3 + 1920 | rail expanded/collapsed, compact — component set `169:955` |
| [x] | PAT-03 | List Exploration | R3 | loading, data, empty, error, refresh error — component set `172:2054` |
| [x] | PAT-04 | Master/Detail | R3 | sélection, aucune sélection, détail indisponible — component set `173:2606` |
| [x] | PAT-05 | Responsive Editor | R3 | drawer Wide, page Compact, dirty — component set `175:2821` |
| [x] | PAT-06 | Guided Form | R3 | étapes, erreur, submitting, abandon — component set `176:3595` |
| [x] | PAT-07 | Entity Detail | R2 | propriétaire, partagé/read-only, Premium — component set `179:3783` |
| [x] | PAT-08 | Async Section | R1 | loading/data/empty/error/stale — component set `180:3816` |
| [x] | PAT-09 | Destructive Confirmation | R1 | default/loading/error — component set `183:3938` |
| [x] | PAT-10 | Premium Journey | R2 | contextual notice, comparison, return — component set `184:4165` |
| [x] | PAT-11 | Data Visualization | R2 | loading/no data/data/partial/error — component set `186:4667` |
| [x] | PAT-12 | Upload Lifecycle | R2 | empty/picking/uploading/error/success/removal — component set `190:5100` |

Sortie M2 : les écrans métier ne doivent plus inventer leur shell, editor ou états async.

## 8. Lot M3 — Public et authentification

- [x] **Clôture du lot M3** — les sources Auth et FLOW-01 sont complètes.

Page Figma : `11 — Public & Auth`.

| Statut | ID | Source screen | Responsive | États spécifiques |
| --- | --- | --- | --- | --- |
| [x] | PUB-01 | Accueil public | R3 | hero, bénéfices, CTA, Light/Dark — component set `200:1287` |
| [x] | AUTH-01 | Connexion | R3 | initial, validation, submitting, erreur session — component set `206:811` |
| [x] | AUTH-02 | Inscription | R3 | initial, validation, submitting, conflit e-mail — component set `206:1351` |
| [x] | AUTH-03 | Vérification e-mail en attente | R2 | attente, renvoi disponible — component set `208:920` |
| [x] | AUTH-04 | Vérification réussie | R2 | succès, redirection — component set `208:981` |
| [x] | AUTH-05 | Vérification échouée/expirée | R2 | erreur, renvoi — component set `208:1048` |
| [x] | AUTH-06 | Session expirée | R1 | retour à la destination initiale — component set `208:1061` |

Prototype : `FLOW-01 Public → Inscription → Vérification → Connexion`.

## 9. Lot M4 — Shell privé et accueil

- [x] **Clôture du lot M4** — shell, Home, météo et FLOW-02 sont validés comme pilote.

Page Figma : `12 — Home`.

| Statut | ID | Source screen | Responsive | États spécifiques |
| --- | --- | --- | --- | --- |
| [x] | SHELL-01 | Shell privé nominal | R3 + 1920 | navigation active, rail compact — component set `221:1129` |
| [x] | SHELL-02 | Création globale | R2 | normal, Premium Groupe — component set `221:2015` |
| [x] | HOME-01 | Accueil avec données | R3 | météo, aujourd'hui, prochains jours, objectifs — component set `222:2661` |
| [x] | HOME-02 | Accueil chargement partiel | R2 | skeletons indépendants — component set `222:2969` |
| [x] | HOME-03 | Accueil vide | R2 | modules vides contextualisés — component set `222:3235` |
| [x] | HOME-04 | Accueil erreurs partielles | R2 | données conservées + retry local — component set `222:3537` |
| [x] | WEATHER-01 | Météo succès | R2 | conditions + trois jours — component set `224:4394` |
| [x] | WEATHER-02 | Météo permission | R1 | attente, refus, localisation indisponible — component set `224:4413` |
| [x] | WEATHER-03 | Météo erreur | R1 | fournisseur, configuration absente — component set `224:4426` |

Prototype : `FLOW-02 Connexion → Home → navigation primaire → retour Home`.

## 10. Lot M5 — Agenda et événements

- [x] **Clôture du lot M5** — Agenda, événements, récurrence, documents et FLOW-03/04 sont complets.

Page Figma : `13 — Calendar & Events`.

| Statut | ID | Source screen | Responsive | États spécifiques |
| --- | --- | --- | --- | --- |
| [x] | CAL-01 | Agenda mois + journée | R3 | date sélectionnée, événements — component set `230:1053` |
| [x] | CAL-02 | Agenda recherche/filtres | R2 | filtres combinés, reset — component set `230:1946` |
| [x] | CAL-03 | Agenda journée vide | R2 | date rappelée, création disponible — component set `230:2366` |
| [x] | CAL-04 | Agenda async | R2 | loading, erreur, refresh error — component set `230:3502` |
| [x] | EVT-01 | Détail événement | R2 | owner/shared, terminé/non terminé — component set `241:4363` |
| [x] | EVT-02 | Menu d'actions événement | R1 | modifier, dupliquer, partager, supprimer — component set `241:4385` |
| [x] | EVT-03 | Choix du type | R2 | sept types — component set `241:4438` |
| [x] | EVT-04 | Formulaire détails | R3 | champs variables selon type — 21 variants, component set `242:4916` |
| [x] | EVT-05 | Récurrence | R2 | fréquence, fin, validation — component set `244:4468` |
| [x] | EVT-06 | Animaux et groupes | R2 | historiques révélés, restriction partage — component set `244:4785` |
| [x] | EVT-07 | Dossier médical et documents | R2 | upload lifecycle, retrait — component set `244:4882` |
| [x] | EVT-08 | Vérification et mutation | R2 | submitting, erreur, succès — component set `244:4925` |
| [x] | EVT-09 | Choix de portée de série | R1 | occurrence/following/series — component set `247:4967` |
| [x] | EVT-10 | Suppression événement | R1 | simple/série, loading/error — component set `247:5035` |

Prototype : `FLOW-03 Agenda → détail → modifier → portée → succès` et `FLOW-04 Agenda → créer chaque famille de type`.

## 11. Lot M6 — Animaux

- [x] **Clôture du lot M6** — workspace, formulaires, permissions et FLOW-05/06 sont complets.

Page Figma : `14 — Animals`.

| Statut | ID | Source screen | Responsive | États spécifiques |
| --- | --- | --- | --- | --- |
| [x] | ANI-01 | Workspace Informations | R3 | animal présent, historique révélé — component set `253:1682` |
| [x] | ANI-02 | Workspace Physique | R3 | dernières mesures, alimentation — component set `253:2263` |
| [x] | ANI-03 | Workspace Santé | R3 | timeline, documents — component set `253:2817` |
| [x] | ANI-04 | Workspace partagé | R2 | provenance, lecture seule — component set `253:3211` |
| [x] | ANI-05 | Workspace async | R2 | loading, vide global, erreur, refresh error — component set `253:4716` |
| [x] | ANI-06 | Détail historique poids/taille | R2 | liste, vide, erreur — component set `258:6964` |
| [x] | ANI-07 | Ajouter/modifier une mesure | R2 | date, valeur, validation, mutation — component set `260:8928` |
| [x] | ANI-08 | Suivi corporel | R2 | gratuit/Premium, mois, galerie — component set `261:9864` |
| [x] | ANI-09 | Formulaire Profil/Dates | R3 | photo, identité initiale — component set `263:11147` |
| [x] | ANI-10 | Formulaire Identité/Origines | R2 | validation et champs optionnels — component set `264:12233` |
| [x] | ANI-11 | Formulaire Corps/Notes | R2 | valeurs, unités, texte long — component set `266:13306` |
| [x] | ANI-12 | Vérification animal | R2 | create/edit, upload, erreur, succès — component set `267:15353` |
| [x] | ANI-13 | Actions animal | R1 | modifier, départ, décès, supprimer — component set `269:15861` |
| [x] | ANI-14 | Départ ou décès | R1 | date requise, impact expliqué — component set `269:16804` |
| [x] | ANI-15 | Suppression animal | R1 | confirmation forte, loading/error — component set `270:18045` |

Prototype : `FLOW-05 Animals → changer d'animal → mesure → historique` — header `273:2769` ; `FLOW-06 Create/Edit Animal` — header `273:4118`.

## 12. Lot M7 — Suivi : objectifs et statistiques

- [x] **Clôture du lot M7** — Objectifs, Statistiques et FLOW-07/08 sont complets.

Page Figma : `15 — Tracking`.

| Statut | ID | Source screen | Responsive | États spécifiques |
| --- | --- | --- | --- | --- |
| [x] | OBJ-01 | Objectifs overview | R3 | en cours, terminés, filtre animal — component set `276:1930` |
| [x] | OBJ-02 | Objectifs async | R2 | loading, vide, erreur, refresh error — component set `277:3477` |
| [x] | OBJ-03 | Détail objectif | R2 | progression, étapes, animaux — component set `278:4845` |
| [x] | OBJ-04 | Menu objectif | R1 | modifier, dupliquer, supprimer — component set `278:5268` |
| [x] | OBJ-05 | Formulaire définition/animaux | R3 | dates, sélection progressive — component set `279:6990` |
| [x] | OBJ-06 | Formulaire étapes/vérification | R2 | minimum une étape, mutation — component set `280:8787` |
| [x] | OBJ-07 | Suppression objectif | R1 | impact, loading/error — component set `281:9509` |
| [x] | STAT-01 | Premium Required Statistiques | R2 | contexte et comparaison — component set `281:10168` |
| [x] | STAT-02 | Statistics Overview | R3 | animaux, période, indicateurs — component set `283:11763` |
| [x] | STAT-03 | Statistics async | R2 | loading, no data, error, partial — component set `284:13437` |
| [x] | STAT-04 | Détail série temporelle | R2 | tooltip focusable, table — component set `285:15046` |
| [x] | STAT-05 | Détail heatmap | R2 | mois/année, légende, historique — component set `286:16377` |
| [x] | STAT-06 | Détail dépenses | R2 | répartition, valeurs textuelles — component set `287:17118` |
| [x] | STAT-07 | Données partagées partielles | R1 | banner explicatif — component set `287:17541` |

Prototype : `FLOW-07 Objective lifecycle` — header `289:6374` ; `FLOW-08 Statistics Free/Premium` — header `289:8031` ; mouvement réduit `289:9567`.

## 13. Lot M8 — Groupes

- [x] **Clôture du lot M8** — rôles, invitations, propositions, Premium et FLOW-09/10 sont complets.

Page Figma : `16 — Groups`.

| Statut | ID | Source screen | Responsive | États spécifiques |
| --- | --- | --- | --- | --- |
| [x] | GRP-01 | Groupes overview | R3 | listes, invitations, Premium — component set `294:1911` ; titres top bar harmonisés Compact/Medium |
| [x] | GRP-02 | Groupes async | R2 | loading, vide, erreur — component set `295:3075` |
| [x] | GRP-03 | Détail Membres | R2 | manager/member, pending/accepted — component set `296:4898` |
| [x] | GRP-04 | Détail Animaux | R2 | proposed/accepted, owner/shared — component set `297:6273` |
| [x] | GRP-05 | Formulaire Informations/Membres | R3 | invitations et validation — Wide `414:6474`, Medium `414:6674`, Compact `414:6871` |
| [x] | GRP-06 | Formulaire Animaux/Vérification | R2 | sélection, mutation — Wide `417:6979`, Compact `417:7291` |
| [x] | GRP-07 | Invitation reçue | R1 | accepter/refuser — Wide `419:7332` |
| [x] | GRP-08 | Proposition animale | R1 | accepter/refuser manager — Wide `421:7499` |
| [x] | GRP-09 | Retrait/quitter | R1 | impacts sur les partages — Wide `422:7669` |
| [x] | GRP-10 | Groupe inactif | R1 | Premium manager expiré — Wide `423:7864` |

Prototype : `FLOW-09 Invitation → groupe → proposition` — départ `419:7332`, état groupe Web `427:8234`, proposition `421:7499` ; `FLOW-10 Manage Group Premium` — départ `423:7864`, handoff externe `423:8124`.

## 14. Lot M9 — Notes, Contacts et Souhaits

- [x] **Clôture du lot M9** — les trois domaines secondaires et FLOW-11/12/13 sont complets.

Page Figma : `17 — Notes Contacts Wishes`.

### Notes

| Statut | ID | Source screen | Responsive | États spécifiques |
| --- | --- | --- | --- | --- |
| [x] | NOTE-01 | Liste Notes | R3 | recherche, pinned, data — Wide `360:2`, Medium `430:792`, Compact `431:1077` |
| [x] | NOTE-02 | Liste async | R2 | Wide : chargement `434:1291`, vide `434:1469`, erreur `434:1669` ; Compact : chargement `438:1833`, vide `438:1930`, erreur `438:2050` |
| [x] | NOTE-03 | Détail Note | R2 | corps Markdown sûr, métadonnées et actions — Wide `441:2151`, Compact `441:2348` |
| [x] | NOTE-04 | Éditeur Note | R3 | Wide Create `546:7893`, Wide Dirty `546:8058`, Wide Validation `546:8221`, Medium Create `546:8385`, Compact Create `546:8543`, Compact Validation `546:8671` — component set canonique `546:8802` à `x=0, y=22046`; PAT-02 `169:955`, Text Input `37:65`, Textarea `48:57` et boutons communs réutilisés ; anciens nœuds animaux supprimés |
| [x] | NOTE-05 | Actions/Suppression | R1 | partager, modifier, supprimer — Wide avec confirmation commune `450:3136` |

### Contacts

| Statut | ID | Source screen | Responsive | États spécifiques |
| --- | --- | --- | --- | --- |
| [x] | CONTACT-01 | Liste Contacts | R3 | recherche, data — Wide `361:587`, Medium `453:3328`, Compact `453:3617` |
| [x] | CONTACT-02 | Liste async | R2 | loading, vide, erreur — Wide `454:3695`, `454:3850`, `454:4009` ; Compact `454:4166`, `454:4272`, `454:4386` |
| [x] | CONTACT-03 | Détail Contact | R2 | téléphone, e-mail, adresse — Wide `455:4472`, Compact `455:4483` |
| [x] | CONTACT-04 | Formulaire Contact | R3 | set local validé `556:8713` — Wide Create `556:7913`, Dirty `556:8055`, Validation `556:8202`, Medium Create `556:8350`, Compact Create `556:8489`, Validation `556:8598` ; PAT-02, 24 Text Input et 12 boutons communs réutilisés ; 47 conteneurs locaux en Auto Layout, surfaces/rayons/états liés aux variables Vasco, aucun paint brut ; champs conformes au schéma produit ; anciennes sources ANI-11 supprimées et 19 maquettes suivantes recalées |
| [x] | CONTACT-05 | Actions/Suppression | R1 | actions externes et confirmation — Wide `460:5234` |

### Souhaits

| Statut | ID | Source screen | Responsive | États spécifiques |
| --- | --- | --- | --- | --- |
| [x] | WISH-01 | Liste Souhaits | R3 | grille/liste responsive, recherche — Wide `364:575`, Medium `465:5422`, Compact `465:5645` |
| [x] | WISH-02 | Liste async | R2 | loading, vide, erreur — Wide `467:5806`, `467:5810`, `467:5814` ; Compact `467:5818`, `467:5824`, `467:5828` |
| [x] | WISH-03 | Détail Souhait | R2 | image, prix, lien, statut — Wide `471:6583`, Compact `471:6594` |
| [x] | WISH-04 | Formulaire Informations | R3 | image, titre, description — Wide `474:6810`, Medium `474:6979`, Compact `474:6996` |
| [x] | WISH-05 | Formulaire Options/Vérification | R2 | prix, lien, destinataire — Options Wide `477:7291`, Vérification Compact `482:7550` |
| [x] | WISH-06 | Upload image | R1 | progress, retry, retrait — Wide `484:7595` |
| [x] | WISH-07 | Actions/Suppression | R1 | modifier, statut, supprimer — Wide `485:7763` |

Prototype : `FLOW-11 Create Note`, `FLOW-12 Contact lifecycle` et `FLOW-13 Wish lifecycle`.

## 15. Lot M10 — Notifications et compte

- [x] **Clôture du lot M10** — Notifications, Compte et FLOW-14/15 sont complets.

Page Figma : `18 — Notifications & Account`.

| Statut | ID | Source screen | Responsive | États spécifiques |
| --- | --- | --- | --- | --- |
| [x] | NOTIF-01 | Liste Notifications | R3 | lues/non lues et actions — Wide `365:377`, Medium `402:4231`, Compact `402:4225` |
| [x] | NOTIF-02 | Notifications async | R2 | Wide : loading `375:540`, vide `375:720`, erreur `375:922`, refresh error `375:1118` ; Compact `400:3663`, `400:3669`, `400:3675`, `400:3681` |
| [x] | NOTIF-03 | Préférences notifications | R2 | Wide `376:1425`, Compact `399:3359`, mutation enregistrée `399:72912` |
| [x] | NOTIF-04 | Suppression notification | R1 | confirmation Wide `388:2073`, modal `388:71806` |
| [x] | ACC-01 | Profil overview | R3 | identité, photo, abonnement — Wide `368:374`, Medium `405:4598`, Compact `405:4605` |
| [x] | ACC-02 | Modifier profil/photo | R2 | Wide `380:1823` ; Compact nominal `408:4931`, erreur `410:5056`, import en cours `411:5184`, succès `411:5332` |
| [x] | ACC-03 | Apparence | R2 | System/Light/Dark, accessibilité et effets réduits — Wide `378:1421`, Compact `396:3238` |
| [x] | ACC-04 | Abonnement overview | R2 | Premium Wide `386:1907`, Gratuit Wide `390:2701`, Compact `390:71990` |
| [x] | ACC-05 | Comparatif offres | R2 | hors périmètre de l’app web : tarifs, paiement et comparatif restent sur le site public selon décision produit |
| [x] | ACC-06 | Sécurité | R2 | actions disponibles seulement — Wide `394:2682`, Compact `394:72268` |
| [x] | ACC-07 | Données et confidentialité | R2 | explications et accès à la suppression — Wide `395:2960`, Compact `395:72546` |
| [x] | ACC-08 | Suppression compte | R1 | confirmation renforcée — prototype Wide `372:11175`, modal `372:11191` |
| [x] | ACC-09 | Erreur/session révoquée | R1 | reconnexion et retour — état `382:1794` |

Prototype : `FLOW-14 Notification → action → destination` et `FLOW-15 Appearance/Subscription/Account deletion`.

## 16. Inventaire transversal des overlays

- [x] **Clôture des overlays** — les 17 sources sont composantisées, annotées et instanciées dans les écrans concernés.

Ces sources sont créées une fois dans `09 — Overlays`, puis instanciées dans les écrans :

| Statut | ID | Overlay | Déclinaisons |
| --- | --- | --- | --- |
| [x] | OVL-01 | Global Create | Wide popover `490:362`, Compact drawer `490:400` — component set `490:434`, documentation `490:435` |
| [x] | OVL-02 | Entity Action Menu | Owner `493:390`, Shared `493:407` — component set `493:424`, documentation `493:425` |
| [x] | OVL-03 | Filter Popover | Wide `494:390`, Compact `494:437` — component set `494:482`, documentation `494:483` |
| [x] | OVL-04 | Responsive Editor | Wide Side Drawer `497:398`, Compact Page `497:830` — component set `497:1146`, documentation `497:1147` |
| [x] | OVL-05 | Discard Changes | Default `499:1136` — documentation `499:1157`, shared button instances preserved |
| [x] | OVL-06 | Delete Confirmation | Default `501:1140`, Loading `501:1161`, Error `501:1180` — component set `501:1199`, documentation `501:1200`, shared button instances preserved |
| [x] | OVL-07 | Recurrence Scope | Occurrence `508:1152`, Following `508:1181`, Series `508:1208` — component set `508:1235`, documentation `508:1236`, shared Radio and Button instances preserved |
| [x] | OVL-08 | Premium Context | Group Management `510:1185`, Medical Documents `510:1207`, Body Tracking `510:1224`, Statistics `510:1241` — component set `510:1258`, documentation `510:1259`, Premium Notice and shared Button instances preserved |
| [x] | OVL-09 | Offer Comparison | Wide `512:1227`, Compact `512:1270` — component set `512:1311`, documentation `512:1312`; current Free/Premium capabilities from code, shared buttons preserved |
| [x] | OVL-10 | Animal Selector | Wide Multiple `515:1235`, Wide History `515:1310`, Compact Multiple `515:1385` — component set `515:1462`, documentation `515:1463`; local Item `91:157` and Rail `92:409` reused |
| [x] | OVL-11 | Group Selector | Wide Open `516:1468`, Wide Ineligible `516:1497`, Compact Open `516:1509`, Compact Premium `516:1538` — component set `516:1550`, documentation `516:1447`; composant commun `86:250` réutilisé, causes d’indisponibilité explicites |
| [x] | OVL-12 | Date/Time Picker | Wide Keyboard `519:1535`, Wide Touch `519:1572`, Compact Keyboard `519:1667`, Compact Touch `519:1704` — component set `519:1823`, documentation `519:1509`; Date Input `78:318`, Time Input `79:212` et Date Range `80:332` réutilisés |
| [x] | OVL-13 | Upload Manager | Wide Queue `522:1803`, Compact Queue `522:1849` — component set `522:1895`, documentation `522:1769`; File Media Upload `88:316` réutilisé, progression/succès/erreur et actions de reprise validés |
| [x] | OVL-14 | Media Viewer | Wide Image `525:1867`, Wide PDF `525:1917`, Compact Image `525:1959`, Compact PDF `525:2009` — component set `525:2051`, documentation `525:1845`; File Item `141:1361` réutilisé pour les métadonnées et actions |
| [x] | OVL-15 | Notification Menu | Wide Unread `530:2016`, Wide Empty `530:2089`, Compact Unread `530:2111`, Compact Empty `530:2174` — component set `530:2190`, documentation `530:2191`; Notification Card `138:819`, boutons communs et icône Bell réutilisés |
| [x] | OVL-16 | Account Menu | Wide `534:2093`, Compact `534:2129` — component set `534:2166`, documentation `534:2167`; Card `133:25` et icône Bell `108:25` réutilisées, avatar à initiales cohérent avec `UserButton` |
| [x] | OVL-17 | Command Palette | documentation `537:2106` réutilisant le component set local `164:312` : Global Results `164:246`, Global Empty `164:267`, Current Page Results `164:279`, Current Page Empty `164:300`; amélioration web progressive non encore branchée, sans variante Compact artificielle |

## 17. Prototypes à livrer

- [x] **Clôture des prototypes** — les 16 flows sont raccordés, vérifiés en entrée/sortie/retour et documentés en Reduced Motion.

| Statut | Flow | Parcours | Priorité |
| --- | --- | --- | --- |
| [x] | FLOW-01 | Public/Auth | P1 — prototype Figma `216:5` |
| [x] | FLOW-02 | Shell et navigation responsive | P0 — Compact `226:293`, Wide `227:890`, Reduced Motion `227:1709` |
| [x] | FLOW-03 | Modifier un événement récurrent | P0 — Compact `251:1688`, Wide `251:2094`, Reduced Motion `251:2574` |
| [x] | FLOW-04 | Créer un événement | P0 — sept types `251:2580`, Reduced Motion `251:2858` |
| [x] | FLOW-05 | Mesure et historique animal | P0 — header `273:2769` |
| [x] | FLOW-06 | Créer/modifier un animal | P0 — header `273:4118` |
| [x] | FLOW-07 | Cycle de vie objectif | P1 — header `289:6374` |
| [x] | FLOW-08 | Statistiques Gratuit/Premium | P1 — header `289:8031`, Reduced Motion `289:9567` |
| [x] | FLOW-09 | Invitation et proposition de groupe | P1 — Web Wide : départ `419:7332`, groupe accepté `427:8234`, proposition `421:7499` |
| [x] | FLOW-10 | Gestion groupe Premium | P1 — Web Wide : départ `423:7864`, CTA `423:8124` vers le site officiel Vasco and Co |
| [x] | FLOW-11 | Créer/modifier une note | P2 — Wide : liste `543:12624` → éditeur `549:13573` → détail `543:12928` → retour/modifier ; Compact : liste `544:13959` → éditeur `549:13786` → détail `543:13332` → retour/modifier ; 8 interactions instantanées actives, hotspot Plus `549:13933`, Reduced Motion `543:13958` |
| [x] | FLOW-12 | Cycle de vie contact | P2 — storyboard validé : header `564:13716` ; Wide liste `564:13719`, formulaire `564:13730`, détail `564:13950` ; Compact liste `564:13961`, formulaire `564:13969`, détail `564:14200` ; hotspots Wide `565:14944` et Compact `564:14427` ; Reduced Motion `564:14778` ; 8 interactions ON_CLICK instantanées, 241 textes Quicksand, actions Retour/Modifier explicites |
| [x] | FLOW-13 | Cycle de vie souhait | P2 — storyboard validé : header `569:14944` ; Wide liste `569:14947`, informations `569:15250`, options/vérification `569:15587`, détail `569:15756`, hotspots création `569:16684` et Retour `570:16527` ; Compact liste `569:15802`, informations `569:16037`, vérification `569:16310`, détail `569:16447`, hotspot création `569:16686` ; Reduced Motion `569:16831` ; 10 interactions ON_CLICK instantanées, 410 textes Quicksand |
| [x] | FLOW-14 | Notification actionnable | P1 — Wide `372:11141`, interaction `I372:11151;138:816` → Agenda `372:11155`, Reduced Motion `385:12280` |
| [x] | FLOW-15 | Apparence, abonnement, suppression compte | P1 — Wide `372:11158`, Apparence `387:12281`, Abonnement `387:12303`, suppression `372:11175`, Reduced Motion `387:12322` |
| [x] | FLOW-16 | Session expirée puis retour au contexte | P1 — Wide `383:11963`, Reduced Motion `384:12279` |

Chaque flow possède une variante Reduced Motion documentée. FLOW-02, FLOW-03, FLOW-05 et FLOW-08 démontrent explicitement Compact et Wide.

## 18. Séquence d'exécution recommandée

1. M0 Fondations.
2. M1 Bibliothèque de composants.
3. M2 Patterns.
4. M4 Shell/Home comme pilote de direction.
5. M5 Agenda comme pilote des interactions complexes.
6. M6 Animaux comme pilote master/detail et permissions.
7. Revue produit et gel Design System v1.
8. M3 Auth, M7 Suivi, M8 Groupes.
9. M9 domaines secondaires.
10. M10 Notifications/Compte.
11. Prototypes, états manquants et audit global.

Ne pas produire M7–M10 en parallèle avant la revue du trio Home/Agenda/Animaux : ces pilotes doivent révéler et corriger les erreurs de fondation avant duplication.

## 19. Checklist d'un lot MCP

- [x] Écrans et composants requis listés.
- [x] Code Connect recherché pour chaque composant nécessaire.
- [x] Composants d'écrans existants inspectés ou absence notée.
- [x] Variables et styles existants inspectés avant création.
- [x] Component map avec keys et propriétés remplie.
- [x] Wrapper de chaque vue créé avant ses sections.
- [x] Une section majeure construite par appel.
- [x] Répétitions composantisées dès le premier passage.
- [x] Variables liées, aucun hex/spacing récurrent brut — 60 693 propriétés d'espacement liées au total ; quatre espacements uniques de composition restent intentionnellement bruts ; palette Media Viewer tokenisée (`609:2168` à `609:2179`) ; deux couleurs décoratives uniques subsistent dans l'aperçu produit du FLOW‑13.
- [x] Quicksand chargée et vérifiée après rendu.
- [x] Screenshots section par section examinés.
- [x] Screenshots complets Compact/Wide examinés.
- [x] Dark, Accessible et Solid fallback contrôlés — modes `12:4`, matériaux `11:12`, motion `11:13`, Apparence Wide `378:1421` et Compact `396:3238`.
- [x] Focus, clavier, dismiss et ordre DOM annotés — règle globale `589:2`, complétée par les annotations des composants et overlays.
- [x] Node IDs et statut enregistrés dans `00 — Cover & Status` — version `8:10`, panneau canonique `573:973`.
- [x] Rollback disponible pour les sources M9 finales — snapshot vertical NOTE‑04/CONTACT‑04 `591:2` dans `99 — Archive & Rollback` ; historique Figma conservé pour les remplacements antérieurs.

Audit transversal du 4 septembre 2026 : le critère « Variables liées » est validé. `17 — Notes Contacts Wishes` est normalisée à zéro paint brut (209 bindings ajoutés, scrims liés à `overlay/scrim`) ; ses frames superposant shell et contenu sont documentées comme exceptions structurelles. `09 — Overlays` est à zéro paint brut après 174 bindings sémantiques puis 28 bindings de palette illustrative ; ses 12 couleurs partagées sont désormais les variables `asset/media-viewer/*` (`609:2168` à `609:2179`). `05 — Forms` est normalisée à zéro paint brut (266 bindings : 146 `bg/surface`, 6 `text/primary`, 114 `text/brand`) ; ses 114 frames sans Auto Layout sont des glyphes d’icônes, segments et connecteurs dont la géométrie libre est intentionnelle. Les 17 autres pages de production auditées sont également à zéro paint brut après 231 bindings sémantiques supplémentaires ; leurs frames libres restantes correspondent aux racines d’écran, calques de superposition, spacers, tracés et illustrations. `19 — Prototypes` a reçu 85 bindings et ne conserve que deux couleurs décoratives uniques (`Décor lumineux`, `Aperçu produit`).

Normalisation des espacements du 4 septembre 2026 : 45 990 propriétés correspondant à l'échelle existante et 14 703 propriétés compactes ou de composition ont été liées. La collection `Web / Spacing` a été étendue avec `space/custom/*` et `space/layout/*` — variables `607:2` à `607:25`. Les 125 espacements fractionnaires issus de storyboards redimensionnés ont été ramenés au jeton le plus proche avec un écart inférieur à 1 px. Les quatre valeurs restantes (`190`, `153.056`, `1.611`, `4.833`) sont uniques et limitées à la composition des pages Account/Prototypes.

## 20. Definition of Done globale des maquettes

- [x] **Clôture globale des maquettes Vasco Web** — tous les critères ci-dessous sont vérifiés et les node IDs définitifs sont documentés.

- Tous les IDs de ce plan sont présents ou explicitement retirés par décision produit.
- Les lots M0 à M2 sont publiables comme bibliothèque cohérente.
- Home, Agenda et Animaux ont validé le shell et les patterns R3.
- Les 16 flows sont raccordés, sans hotspot mort.
- Light/Dark, Standard/Accessible, Full/Reduced Motion et Glass/Solid sont couverts selon pertinence.
- Les états loading, empty, error, refresh error, success, forbidden/read-only et Premium sont inspectables.
- Aucun composant répété n'est resté sous forme de frames indépendantes.
- Toutes les sources utilisent Auto Layout et variables ; aucun placement absolu structurel.
- Les annotations d'accessibilité, responsive et motion suffisent à implémenter sans deviner.
- `web-screen-validation.md` et le backlog d'implémentation sont reliés aux node IDs définitifs.

Clôture technique du 4 septembre 2026 : 21 pages ordonnées, lots M0–M10 fermés, 17 overlays et 16 flows raccordés. Home `302:52005`, Agenda `302:52007`, Animaux `302:52006` et le détail Souhait Wide `569:15756` ont été contrôlés visuellement après la normalisation. Le panneau de statut final est `573:973` et la version de couverture `8:10` indique `HANDOFF VALIDÉ`.
