# Standards d'implémentation UX/UI de Vasco Web

## 1. Portée

Ce document transforme les décisions de design en règles de code. Lire aussi : direction visuelle, navigation, design system, motion et handoff Figma.

Le web historique est un inventaire fonctionnel. Une implémentation graphique est reconstruite d'après les maquettes web validées, sans fallback, alias ou composant de compatibilité UI.

## 2. Architecture UI

- Pages et layouts sont Server Components par défaut.
- L'interactivité vit dans des Client Components bornés.
- `shared/components/ui` contient les primitives accessibles.
- `shared/components/patterns` accueille les compositions transversales.
- `features/<domain>/components` contient la présentation métier d'un domaine.
- Les queries et mutations restent dans les hooks de feature, jamais dans une carte de présentation.
- L'état sérialisable utile va dans l'URL ; l'état serveur dans TanStack Query ; le brouillon local au plus près du formulaire.
- Aucun provider global n'est ajouté uniquement pour ouvrir un overlay d'une feature si une route, un slot de layout ou un état local suffit.

## 3. Layout

- Flux normal, grid, flex, `gap`, min/max et container queries avant positionnement.
- `position: fixed|absolute` réservé aux vrais overlays, badges, décor et surfaces flottantes documentées.
- Aucun CTA positionné par coordonnée ni hauteur de formulaire calculée depuis le viewport.
- Utiliser `dvh/svh` avec prudence et conserver le scroll du document lorsqu'il est le comportement naturel.
- Une page possède un seul scroll principal ; les zones internes scrollables sont justifiées par le pattern.
- Les barres sticky utilisent `scroll-padding`/`scroll-margin` afin de ne pas masquer ancres et focus.
- Le z-index suit une échelle : base, sticky, dropdown, overlay, modal, toast. Aucune valeur arbitraire locale.

## 4. Responsive

- Concevoir d'abord les règles narrow/regular/wide de chaque composant.
- Media queries pour le shell ; container queries pour les modules réutilisables.
- Breakpoint déclenché par collision, troncature ou perte de hiérarchie, pas par modèle d'appareil.
- Vérifier 320, 390, 768, 1024, 1440 et 1920 CSS px.
- Vérifier zoom 200 %, reflow 400 %, texte à 200 % et espacement de texte WCAG.
- Aucun contenu ou contrôle essentiel réservé au hover.
- `pointer: coarse`, orientation et clavier virtuel ne sont pas inférés de la largeur seule.
- Tables : sémantique conservée ; si transformation en cartes, comparaison et headers restent compréhensibles.

## 5. Composants et tokens

- Aucun code couleur, spacing, radius, shadow, blur, duration ou easing récurrent dans une feature.
- Props d'intention : `tone`, `size`, `state`, `material`, `density`, jamais `customColor`.
- Un composant garde le même DOM et la même géométrie entre Solid et Glass autant que possible.
- Les composants partagés portent hover, focus, pressed, disabled et loading ; les écrans ne les recodent pas.
- Tout élément réellement actionnable affiche `cursor: pointer` sur un dispositif de pointage : boutons, liens, onglets, options, entrées de menu, sélecteurs et labels de contrôles. Les éléments désactivés affichent `cursor: not-allowed` ; les surfaces uniquement informatives conservent le curseur standard.
- Les icônes viennent du registre sémantique unique.
- Une carte métier ne navigue pas et n'appelle pas l'API ; elle expose un lien ou un callback fourni.

## 6. Navigation et overlays

- Les destinations utilisent des liens ; les actions utilisent des boutons.
- Un détail important possède une URL même s'il est présenté dans un drawer desktop.
- Dialog modal : contenu extérieur inert, focus contenu, `Tab` bouclé, `Escape`, titre visible, fermeture accessible et restauration du focus.
- Popover/menu : non modal, ancré, light-dismiss si aucune donnée ne peut être perdue.
- Drawer : scroll et focus propres, taille bornée par le contenu, page entière sur compact si nécessaire.
- La fermeture d'un brouillon modifié demande confirmation quelle que soit son origine : bouton, scrim, `Escape`, retour navigateur ou changement de route.
- Les overlays imbriqués sont évités ; une confirmation au-dessus d'un editor est le cas principal acceptable.

## 7. Formulaires

- Label visible et association programmatique.
- Aide avant erreur ; erreur persistante jusqu'à correction ou nouvelle validation.
- `aria-invalid` et `aria-describedby` seulement quand appropriés.
- Validation locale pour le feedback, backend pour l'autorité.
- Conserver toutes les valeurs après erreur réseau ou serveur.
- Focus sur le premier champ invalide après échec de continuation ; résumé d'erreurs pour formulaire long.
- Toute progression multi-étapes relie visuellement les étapes : ligne continue, portion accomplie explicitement colorée, étape active et étapes indisponibles distinguées sans dépendre uniquement de la couleur.
- Les listes déroulantes simples utilisent exclusivement la primitive partagée `Select` ; les choix recherchables ou multiples utilisent `Combobox` ou `MultiSelect`. Aucun `<select>` natif ni variante locale de hauteur, bordure ou menu n'est introduit dans une feature.
- Les dates et heures utilisent exclusivement `DateInput`, `TimeInput` ou `DateRangeInput`. Leur hauteur, bordure, focus, panneau et état désactivé restent alignés avec `Select`. Le pictogramme est placé en fin de champ sans recouvrir le texte ; cliquer la surface de saisie ou ce pictogramme ouvre le sélecteur. Le panneau est portaled pour ne jamais être rogné par une modale ou une zone scrollable.
- Autocomplete, input mode et type natif configurés.
- Dates françaises sans perdre ISO et fuseau aux frontières.
- Double submit empêché ; le bouton porte son propre loading.
- Required, optional et read-only sont textuels, pas seulement chromatiques.

## 8. États asynchrones

Chaque zone distante distingue : initial loading, data, empty, blocking error, refresh error avec données conservées, stale/offline si pertinent, forbidden/read-only et Premium.

Les skeletons reprennent la structure finale et réservent la place. Un rafraîchissement ne remplace pas l'écran entier par un loader. Une mutation optimiste possède rollback ; une mutation sensible ne se rejoue pas automatiquement.

## 9. Motion et matériaux

- Appliquer exclusivement les tokens de `web-motion-and-materials.md`.
- Feedback press/focus immédiat ; animation fonctionnelle ≤ 360 ms.
- `transform` et `opacity` privilégiés ; mesurer le reste.
- `prefers-reduced-motion` reçoit une variante explicite sans déplacement/échelle.
- Glass uniquement sur les composants autorisés ; Solid est complet et premier.
- `forced-colors`, mode Couleurs accessibles et réduction de transparence ne perdent aucune information.
- Aucune animation infinie hors viewport ; aucun shimmer en mouvement réduit.

## 10. Accessibilité

- Cible WCAG 2.2 AA.
- HTML sémantique avant ARIA ; suivre APG pour les widgets composites.
- Navigation clavier complète et ordre DOM identique au sens visuel.
- Focus visible, contrasté, restauré et non masqué.
- Cible Vasco 44 × 44 CSS px ; minimum WCAG AA 24 × 24 avec exceptions normatives.
- Contraste vérifié Light, Dark, Accessible et Forced colors.
- Information doublée lorsqu'elle utilise couleur, position, forme ou mouvement.
- Live region pour succès/erreur important, pas pour chaque changement mineur.
- Graphiques avec titre, résumé, valeurs et table/historique.
- Alternatives par bouton à drag, swipe, hover et geste précis.
- Tester NVDA/Firefox ou Chrome sous Windows, VoiceOver/Safari sous macOS/iOS selon disponibilité, et TalkBack/Chrome pour compact tactile.

## 11. Performance perçue

- Interaction visible au prochain frame ; INP cible ≤ 200 ms au 75e percentile.
- Streaming/skeleton par section lorsque le chargement peut être indépendant.
- Images avec dimensions, format adapté, responsive sizes et priorité uniquement au-dessus de la ligne de flottaison.
- Listes longues virtualisées seulement après mesure et sans casser recherche navigateur/accessibilité.
- Charts lourds chargés à la demande et données calculées hors rendu critique.
- Blur et grandes ombres mesurés sous throttling CPU/GPU.
- Aucun rerender global à chaque frappe.

## 12. Sécurité de présentation

- Contenu utilisateur rendu comme texte ou Markdown sanitisé selon le contrat.
- URL externe validée, destination annoncée et ouverture `noopener,noreferrer`.
- SVG/HTML uploadés jamais rendus comme contenus actifs.
- Messages d'erreur sans stack, payload, identifiant sensible ou détail interne.
- Brouillons sensibles non persistés automatiquement sans décision produit.

## 13. Tests et Definition of Done

### Composants

- variants, states, clavier, focus et noms accessibles ;
- Light/Dark, Accessible et Reduced Motion ;
- narrow/regular/wide ;
- contenus longs et valeurs extrêmes.

### Parcours

- navigation directe, retour, refresh et nouvel onglet ;
- loading/empty/error/refresh error/success ;
- compte Gratuit/Premium ; propriétaire/partagé ;
- brouillon, validation, double submit et confirmation ;
- session expirée et erreur réseau ;
- capture visuelle aux largeurs de référence.

### Livraison

- [ ] Frame Figma et prototype identifiés.
- [ ] Aucun héritage visuel legacy non décidé.
- [ ] Tokens et composants partagés utilisés.
- [ ] Responsive et container behavior validés.
- [ ] Clavier, lecteur d'écran, zoom et contraste vérifiés.
- [ ] Full/Reduced Motion et Glass/Solid vérifiés.
- [ ] Budgets de performance tenus.
- [ ] Tests critiques verts.
- [ ] Ancienne implémentation concurrente retirée.
