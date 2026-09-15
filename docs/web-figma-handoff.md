# Préparation et handoff Figma de Vasco Web

## 1. Statut

Le fichier séparé [Vasco Web](https://www.figma.com/design/CzdthSttGqMnjCh3ycZECp) porte désormais les maquettes web et leurs prototypes. Le fichier mobile sert à partager l'identité Vasco, le slogan, les couleurs et l'iconographie, jamais à copier les dimensions ou les gestes du navigateur.

Le backlog détaillé, les décisions produit et les identifiants de production sont définis dans `web-figma-mockup-plan.md`. Au 4 septembre 2026, les lots M0 à M10, les 17 overlays et les 16 flows sont produits et l'audit transversal de handoff est validé. Le fichier est gelé comme source de vérité pour l'implémentation.

## 2. Sources de vérité futures

Ordre attendu :

1. maquettes web Vasco validées et prototype ;
2. présent document, navigation/interactions et direction visuelle web ;
3. motion/matériaux et spécification du design system ;
4. standards d'implémentation et accessibilité web ;
5. règles métier et contrats backend ;
6. code existant pour inventaire uniquement.

En cas de conflit métier, le design ne redéfinit pas le backend. En cas de conflit visuel après validation, Figma gagne jusqu'à décision produit contraire documentée.

## 3. Structure du fichier Figma

Pages recommandées :

1. `00 — Cover & status`
2. `01 — Principles`
3. `02 — Foundations`
4. `03 — Motion & materials`
5. `04 — Actions`
6. `05 — Forms`
7. `06 — Navigation`
8. `07 — Content`
9. `08 — Feedback`
10. `09 — Overlays`
11. `10 — Patterns`
12. `11 — Public & Auth`
13. `12 — Home`
14. `13 — Calendar & Events`
15. `14 — Animals`
16. `15 — Tracking`
17. `16 — Groups`
18. `17 — Notes Contacts Wishes`
19. `18 — Notifications & Account`
20. `19 — Prototypes`
21. `99 — Archive & rollback`

Les pages composants contiennent la source. Les pages écrans n'hébergent que des instances, sauf composition strictement locale documentée.

## 4. Variables et modes

Collections recommandées :

- `Primitives` : couleurs et nombres bruts ;
- `Semantic color` : modes Light/Dark ;
- `Color vision` : modes Standard/Accessible si Figma permet une composition lisible ;
- `Spacing & size` ;
- `Radius & border` ;
- `Typography` ;
- `Elevation & material` ;
- `Motion` ;
- `Component`.

Le fichier doit permettre d'inspecter les combinaisons critiques sans dupliquer tout le catalogue : Light/Dark, Standard/Accessible, Solid/Glass. Forced colors et Reduced Motion sont documentés sous forme de variantes comportementales et prototypes ciblés.

## 5. Conventions de nommage

- Composants : `Family/Component` puis variantes par propriétés.
- Patterns : `Pattern/List Exploration`, `Pattern/Responsive Editor`.
- Écrans : `Domain/Screen — State — Width — Theme`.
- Flux : `Flow 01 — Auth`, `Flow 02 — Create Event`.
- Variables : rôles en anglais stables ; textes de produit en français.
- Frames rollback datées et liées au lot concerné.
- Aucun nom visible MyDailyBook/DailyBook ; utiliser Vasco.

Propriétés communes :

- `Size=Small|Medium|Large`
- `State=Default|Hover|Focus|Pressed|Disabled|Loading|Error`
- `Tone=Neutral|Brand|Success|Warning|Danger|Info`
- `Material=Solid|Glass`
- `Density=Comfortable|Compact` seulement si le composant le justifie
- `Layout=Narrow|Regular|Wide` pour les compositions container-aware

Éviter une propriété booléenne différente pour chaque détail décoratif. Utiliser des slots et propriétés de texte lorsque possible.

## 6. Frames et largeurs

Chaque parcours critique possède au moins les frames Compact 390, Medium 768 et Wide 1440. Ajouter Expanded 1024 lorsqu'une rupture réelle apparaît, et Ultra-wide 1920 pour valider les limites de largeur.

Une frame doit préciser :

- largeur, hauteur indicative et comportement de scroll ;
- grid, gutters, max width et containers ;
- zones sticky/fixed ;
- ordre DOM attendu quand la composition change ;
- éléments masqués, déplacés ou condensés ;
- stratégie des textes longs et données extrêmes ;
- comportement tactile et hover ;
- état du thème et du matériau.

Ne pas créer uniquement un desktop puis utiliser « scale down ». Compact possède une composition explicitement décidée.

## 7. États obligatoires

Pour chaque écran distant :

- loading initial ;
- contenu ;
- vide ;
- erreur sans cache ;
- erreur de rafraîchissement avec données conservées ;
- succès de mutation ;
- interdit/lecture seule ;
- Premium ;
- session expirée si le parcours est critique.

Pour chaque formulaire :

- initial ;
- focus ;
- rempli ;
- aide ;
- erreur champ et résumé ;
- upload/progression si concerné ;
- submitting ;
- erreur serveur avec valeurs conservées ;
- abandon d'un brouillon ;
- succès et destination suivante.

Les variantes ne doivent pas être cachées dans une note. Elles sont des frames ou propriétés de composants inspectables.

## 8. Prototypes et motion

Le prototype documente hotspot, déclencheur clavier, destination, retour, focus attendu, scroll restauré et variante Reduced Motion.

Prototype High fidelity seulement pour :

- shell responsive ;
- liste/détail ;
- drawer desktop devenant page compact ;
- création multi-étapes ;
- suppression ;
- sélection animal/date/période ;
- Premium ;
- Glass→Solid.

Les autres interactions peuvent utiliser des prototypes simples accompagnés des tokens motion. Aucun développeur ne doit devoir mesurer une animation vidéo image par image.

### 8.1 Modèle de couches et z-index

Le z-index n'est pas exposé comme variable Figma : l'ordre des calques et le top layer du navigateur restent les sources d'exécution. Le handoff utilise les niveaux sémantiques suivants, sans valeur arbitraire locale :

| Niveau | Usage | Valeur CSS de référence |
| --- | --- | --- |
| `base` | contenu et surfaces dans le flux | `0` |
| `sticky` | en-têtes, rails et actions persistantes | `100` |
| `dropdown` | menus, popovers et suggestions | `300` |
| `overlay` | scrim et panneaux modaux | `500` |
| `toast` | notifications temporaires non modales | `700` |
| `system` | diagnostic ou blocage global exceptionnel | `900` |

Les dialogues et popovers natifs utilisent en priorité le top layer (`dialog`, Popover API) plutôt qu'une escalade de z-index. Un composant ne crée pas de nouveau contexte d'empilement sans nécessité documentée ; `transform`, `filter`, `opacity` et `isolation` sont donc contrôlés pendant la revue. Le Glass ne modifie jamais à lui seul le niveau de couche.

## 9. Ordre de conception

### Macro-lot F0 — Fondations

- identité, typo, grilles, tokens et modes ;
- matériaux Solid/Glass et fallbacks ;
- motion ;
- primitives accessibles.

Sortie : aucune valeur structurante non décidée.

### Macro-lot F1 — Shell et pilotes

- shell public/privé ;
- navigation Wide/Medium/Compact ;
- Home ;
- Agenda ;
- états globaux.

Sortie : direction visuelle et responsive validée avant déclinaison.

### Macro-lot F2 — Objets et formulaires complexes

- Événement, Animal, Objectif ;
- master/detail ;
- responsive editor ;
- fichiers, dates, récurrence, partage, confirmations.

Sortie : composants et patterns lourds validés.

### Macro-lot F3 — Domaines secondaires

- Groupes, Notifications, Notes, Contacts, Souhaits ;
- permissions, invitations et Premium.

### Macro-lot F4 — Données et compte

- Statistiques et graphiques accessibles ;
- Profil, apparence, abonnement, confidentialité ;
- météo et états provider/permission.

### Macro-lot F5 — Couverture et handoff

- tous les états ;
- responsive extrême ;
- accessibility annotations ;
- prototype final ;
- matrice composant/code et backlog d'implémentation.

## 10. Checklist de revue produit

- [x] La tâche et la règle métier sont correctes.
- [x] La composition n'est pas dérivée du legacy.
- [x] L'identité Vasco reste cohérente avec le mobile sans copier son ergonomie.
- [x] Compact, Medium et Wide démontrent un comportement, pas un simple redimensionnement.
- [x] Light et Dark sont complets.
- [x] Glass possède un fallback Solid identique fonctionnellement.
- [x] Couleurs accessibles, contraste renforcé et mouvement réduit sont prévus.
- [x] Default/loading/empty/error/success/forbidden/Premium sont couverts.
- [x] Le focus, le clavier et la restauration après overlay sont annotés.
- [x] Les contenus longs, listes longues et valeurs extrêmes sont testés.
- [x] L'action primaire et les actions destructives sont non ambiguës.
- [x] Le prototype possède entrées, sorties et retours.

## 11. Checklist de handoff développement

- [x] Node Figma source et composant parent identifiés.
- [x] Variables liées ; aucune couleur ou dimension récurrente brute.
- [x] Auto Layout utilisé ; aucun placement absolu structurel non documenté.
- [x] Contraintes et resize documentés.
- [x] Slots, variants et états nommés comme l'API cible.
- [x] Icônes issues du registre retenu.
- [x] Assets exportables marqués et format précisé.
- [x] Texte réel ou jeux de données représentatifs utilisés.
- [x] Motion relié à des tokens.
- [x] Comportement sans hover décrit.
- [x] Sémantique HTML/ARIA et ordre du focus annotés.
- [x] Acceptance criteria reliés à `web-screen-validation.md`.

## 12. Conditions pour commencer les maquettes

La production Figma peut commencer lorsque :

1. la direction `web-design-direction.md` est validée ;
2. l'architecture de navigation et le choix de shell pilote sont validés comme hypothèses à tester ;
3. les fonctionnalités hors périmètre sont confirmées ;
4. le fichier Figma web est créé avec les pages et collections ;
5. le macro-lot F0 est traité avant la déclinaison massive d'écrans.

Les macro-lots F0 à F5 décrivent les jalons produit. L'exécution MCP détaillée suit les lots M0 à M10 et les flows numérotés de `web-figma-mockup-plan.md`.

Créer tous les écrans avant les composants ou les trois largeurs avant les règles responsive provoquerait une dette immédiate et ne constitue pas un handoff acceptable.
