# Motion et matériaux de Vasco Web

## 1. Rôle du mouvement

Le mouvement Vasco explique quatre choses :

1. **causalité** — l'élément activé produit un résultat visible ;
2. **continuité** — l'utilisateur comprend le lien entre liste, détail et édition ;
3. **hiérarchie** — un overlay vient au-dessus du contexte, une section se déplie dans son flux ;
4. **feedback** — une mutation démarre, réussit, échoue ou modifie une donnée.

Une animation qui n'explique rien, détourne l'attention ou bloque une interaction est retirée.

## 2. Personnalité motion

Vasco bouge de façon douce, directe et légèrement organique : accélération courte, décélération nette, ressort réservé aux objets manipulés. L'interface ne doit être ni mécanique et sèche, ni élastique et ludique en permanence.

Principes :

- réponse visuelle au prochain frame ;
- animation interruptible et réversible ;
- pas de délai artificiel avant navigation ou mutation ;
- pas de stagger sur plus de 5 à 7 éléments visibles ;
- pas d'animation d'entrée globale à chaque navigation retour ;
- transformations et opacité privilégiées pour éviter layout et paint coûteux ;
- aucune animation infinie hors viewport.

## 3. Tokens de motion à maqueter

### Durées

| Token | Valeur cible | Usage |
| --- | ---: | --- |
| `motion-instant` | 80 ms | pression, highlight très local |
| `motion-fast` | 140 ms | hover, focus visuel, icône, tooltip |
| `motion-base` | 200 ms | sélection, disclosure, toast |
| `motion-slow` | 280 ms | panneau, dialog, changement de vue |
| `motion-emphasis` | 360 ms max | transition spatiale rare ou succès important |

Une durée peut être ajustée pendant le prototypage, mais les composants ne créent pas leur propre échelle.

### Courbes

| Token | Intention | Courbe de départ |
| --- | --- | --- |
| `ease-standard` | changement sur place | `cubic-bezier(.2, 0, 0, 1)` |
| `ease-enter` | élément entrant | `cubic-bezier(0, 0, 0, 1)` |
| `ease-exit` | élément sortant | `cubic-bezier(.3, 0, 1, 1)` |
| `ease-emphasis` | continuité spatiale | `cubic-bezier(.2, .8, .2, 1)` |

Le ressort est spécifié par sensation et testé dans le prototype : faible overshoot, amortissement rapide, vélocité du geste conservée. Il ne s'applique pas aux dialogs de confirmation ni aux messages d'erreur.

## 4. Grammaire par interaction

| Interaction | Mouvement nominal | Réduction |
| --- | --- | --- |
| Hover carte | contour/élévation + translation max 2 px, 140 ms | contour seul |
| Pression bouton | échelle max 0,98, 80 ms | changement tonal instantané |
| Focus clavier | ring immédiat, sans déplacement | identique |
| Sélection | fond/contour + icône ou check, 140–200 ms | changement instantané |
| Disclosure | hauteur/clip contrôlé + rotation icône, 200 ms | apparition instantanée, icône mise à jour |
| Tabs | indicateur glissé ou fondu, contenu cross-fade 140–200 ms | état immédiat |
| Dialog | fade scrim 160 ms, surface fade + scale 0,98→1 en 200 ms | fade court uniquement |
| Drawer/panel | translation depuis son bord 240–280 ms | fade court ou apparition |
| Popover/menu | fade + scale depuis l'ancre, 140 ms | apparition |
| Toast | fade + translation 8 px, 180–220 ms | fade court |
| Suppression liste | confirmation, puis collapse de la place 200 ms | retrait instantané + annonce |
| Réorganisation | objet suit le pointeur, voisins se déplacent | boutons Monter/Descendre obligatoires |
| Liste chargée | contenu remplace le skeleton sans flash | identique ou instantané |
| Succès mutation | check ou halo discret une fois | message statique |
| Route proche | cross-fade ou continuité d'un élément partagé | navigation sans transition |
| Rail compact ↔ étendu | largeur 240–280 ms, libellés en opacity/clip, icônes et contrôle sur axe fixe | changement immédiat ou fade ≤ 100 ms |

Les View Transitions sont une amélioration progressive. Le DOM, le focus, l'historique et la navigation doivent fonctionner de façon identique lorsqu'elles ne sont pas disponibles.

## 5. Navigation et continuité spatiale

- Le contrôle de réduction du rail conserve la même position, la même taille de cible et le même axe dans les deux états. Le chevron indique l'action suivante par rotation ou changement de glyph, sans passer sur une autre ligne.
- Le rail et la zone de contenu évoluent comme une seule composition ; la transition est interruptible et ne rejoue pas après hydratation.
- Liste → détail : le titre, l'avatar ou l'image peut servir d'élément partagé si cela n'altère pas le focus.
- Page → panneau d'édition : le panneau vient du bord où il est ancré ; la page ne se translate pas entièrement.
- Petit écran → page d'édition : transition de route courte, pas une imitation forcée du drawer desktop.
- Retour : direction cohérente et restauration du scroll après le rendu.
- Changement de filtre : conservation de la structure, animation locale des résultats uniquement si la liste est courte.
- Changement d'animal/date/période : le sélecteur répond immédiatement ; la zone distante indique ensuite son chargement sans bloquer le shell.

Le navigateur propose désormais la [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) pour les changements de vue SPA et les navigations de même origine. Son usage reste soumis à feature detection et au contrôle du mouvement réduit.

## 6. Chargement et attente

### Moins de 300 ms

Ne pas afficher de loader qui clignote. Le contrôle pressé peut conserver son feedback immédiat.

### De 300 ms à 2 s

- mutation : spinner local dans le CTA, libellé stable ou explicite ;
- lecture initiale : skeleton fidèle à la structure ;
- rafraîchissement : indicateur local sans effacer les données existantes.

### Plus de 2 s

Afficher une explication ou une progression déterminée si le backend la fournit. Après un seuil contextualisé, proposer annulation ou nouvelle tentative lorsque l'opération le permet.

Le skeleton ne simule ni faux texte détaillé ni métriques précises. Son shimmer est lent, de faible contraste et désactivé avec mouvement réduit.

## 7. Réduction du mouvement

`prefers-reduced-motion: reduce` est un contrat fonctionnel :

- supprimer translation, parallax, zoom, échelle, ressort, blur animé et morphing ;
- conserver au besoin un fade ≤ 100 ms ou un changement instantané ;
- ne pas animer le scroll ;
- préserver les indicateurs de progression et de chargement sous forme non vestibulaire ;
- éviter de réduire toutes les durées à `0.01ms` si cela casse les événements de fin ou la gestion de focus ; préférer des variantes de composant explicites.

La spécification WCAG 2.2 distingue le mouvement de position/taille des simples changements d'opacité ou de couleur, mais Vasco applique une réduction plus prudente. Référence : [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

## 8. Matériaux

### Solid

Matériau par défaut de toutes les surfaces. Il porte seul la lisibilité, la hiérarchie et les contrastes. Il existe en niveaux `base`, `surface`, `elevated` et `overlay`.

### Glass

Amélioration progressive pour une surface flottante dont l'arrière-plan fournit un contexte utile :

- top bar superposée après scroll ;
- rail ou barre compacte flottante ;
- popover, command palette ou contrôle de vue ;
- panneau transitoire au-dessus d'un contenu riche.

Contrat Glass :

- même géométrie et mêmes dimensions que Solid ;
- teinte de surface suffisamment opaque avant blur ;
- bordure interne ou externe perceptible ;
- ombre sobre et adaptée au thème ;
- blur borné par token, jamais choisi localement ;
- contraste du contenu testé sur l'arrière-plan le plus défavorable ;
- pas de Glass sur Glass ;
- pas de texte secondaire faible sur une photo ou un graphique ;
- fallback Solid automatique sans saut de layout.

`backdrop-filter` est largement disponible sur les navigateurs récents depuis 2024, mais peut manquer sur des versions anciennes et reste coûteux sur de grandes zones. Référence : [MDN — backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter).

### Fallback de transparence

Ordre de résolution recommandé :

1. `forced-colors: active` → couleurs système, aucun Glass ;
2. préférence Vasco explicite « réduire les effets visuels » → Solid ;
3. `prefers-reduced-transparency: reduce` si supporté → Solid ;
4. absence de `backdrop-filter` → Solid ;
5. contraintes de performance détectées ou surface trop vaste → Solid ;
6. sinon Glass sur les composants autorisés.

`prefers-reduced-transparency` reste à disponibilité limitée en 2026 ; il ne peut donc pas être l'unique fallback. Référence : [MDN — prefers-reduced-transparency](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-transparency).

## 9. Performance et budgets

- Viser un INP ≤ 200 ms au 75e percentile sur mobile et desktop ; référence : [web.dev — Optimize INP](https://web.dev/articles/optimize-inp).
- Animer prioritairement `transform` et `opacity`; mesurer toute animation de layout ou paint. Référence : [web.dev — animations performantes](https://web.dev/articles/animations-guide).
- Ne pas appliquer `will-change` durablement à de nombreuses surfaces.
- Limiter blur, grandes ombres et filtres aux couches nécessaires.
- Suspendre animations, timers et polling visuel hors viewport ou onglet caché.
- Mesurer sur machine moyenne, écran haute densité, batterie et throttling CPU ; un prototype Figma fluide ne valide pas le coût navigateur.

## 10. Spécification Figma du motion

Chaque composant animé doit documenter :

- déclencheur ;
- état initial et final ;
- propriété animée ;
- durée et easing token ;
- possibilité d'interruption ;
- comportement au retour ;
- variante Reduced Motion ;
- comportement si le contenu change de taille ;
- annonce accessible éventuelle ;
- propriétaire de la transition : composant, pattern ou route.

Les prototypes prioritaires sont : navigation racine, liste→détail, drawer desktop/page compacte, formulaire multi-étapes, confirmation destructive, mutation async, changement d'animal/date et Premium.
