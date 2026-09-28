# Audit de l'existant web avant refonte graphique

Date de l'audit : 28 août 2026.

## 1. Conclusion

Le web possède désormais des contrats API, une sécurité BFF, des règles métier et une organisation par feature suffisamment solides pour préparer une refonte. Sa présentation actuelle ne forme toutefois pas un design system cohérent et ne doit pas être utilisée comme point de départ visuel.

La refonte est une reconstruction de l'expérience. L'existant reste consultable uniquement pour inventorier les capacités, les données, les états et les contraintes techniques. Aucun écran, composant, breakpoint, geste, dimension, layout ou choix de navigation actuel n'est présumé conservé.

## 2. Périmètre observé

- 14 destinations de page : 4 publiques et 10 privées.
- 116 fichiers React `.tsx`, dont 50 déclarés Client Components.
- 13 fichiers consommant directement une primitive d'overlay Dialog, Sheet ou Drawer.
- 12 domaines sous `src/features` : Animaux, Auth, Contacts, Dashboard, Événements, Groupes, Notes, Notifications, Objectifs, Statistiques, Utilisateur, Météo et Souhaits.
- 256 occurrences indicatives de couleurs ou dimensions CSS brutes dans les sources CSS, SCSS, TS et TSX selon l'expression de recherche de l'audit. Ce nombre est un signal de dispersion, pas un indicateur qualité absolu.
- 5 feuilles SCSS/CSS spécialisées subsistent en plus de Tailwind et des variables CSS globales.

Le worktree contient une refonte technique non encore consolidée en un commit unique. Cet audit ne modifie et ne normalise aucune de ces évolutions.

## 3. Ce qui est réutilisable

### Fonctionnel et métier

- règles métier, permissions propriétaire/partagé et entitlements Premium ;
- contrats BFF `/api/*`, schémas runtime Zod et hooks TanStack Query ;
- états réels des données et mutations ;
- contraintes de fichiers, récurrence, partage, historique, notifications et météo ;
- inventaire des routes et des rôles utilisateur.

### Technique

- Next.js 16, React 19, TypeScript, Tailwind CSS 4 et variables CSS sémantiques ;
- primitives accessibles Radix déjà présentes, à auditer composant par composant ;
- Quicksand déjà chargée ;
- Light, Dark et mode Couleurs accessibles déjà initialisés avant hydratation ;
- tests Vitest, Playwright, axe, performance et CI déjà structurés ;
- séparation `shared/components` / `features` et clients API navigateur/serveur.

Réutilisable signifie « candidat à conserver après audit », pas « API ou apparence gelée ».

## 4. Dette visuelle et UX constatée

### Shell et navigation

- La navigation desktop est une barre horizontale dense combinant destinations directes et menus, sans shell applicatif clairement défini pour les grandes largeurs.
- Le petit écran utilise un menu latéral générique ; il ne constitue pas une navigation mobile web validée.
- La marque visible mélange encore `Vasco` et `Vasco and co`.
- `/contacts` est proposé dans la navigation mais aucune page Contacts n'existe dans l'App Router.
- Le FAB est piloté par une liste de chemins et des providers globaux d'overlays ; ce mécanisme ne doit pas dicter le futur modèle d'interaction.

### Layout et responsive

- Plusieurs écrans utilisent des hauteurs calculées sur le viewport et des zones internes scrollables (`90vh`, `60vh`, `calc(100vh - …)`).
- Les formulaires Animal, Événement et Objectif utilisent des dialogues de `90vw × 90vh` plafonnés à 1200 px, sans contrat commun lié à la complexité de la tâche.
- Le dashboard repose sur `react-grid-layout` et des hauteurs calculées en JavaScript. Sa grille déplaçable est une capacité à réévaluer, pas un comportement à reproduire.
- La responsivité dépend principalement de breakpoints de viewport ; les composants ne possèdent pas encore de stratégie par container query.

### Système visuel

- Les variables sémantiques Light/Dark sont une bonne fondation, mais cohabitent avec des tokens de robes historiques et des valeurs locales.
- Les pages publiques et privées ont connu deux feuilles globales différentes ; la feuille publique historique n'est plus importée mais reste dans le dépôt.
- Les composants et features mélangent Tailwind, CSS Modules, SCSS, CSS global et styles inline.
- Rayons, ombres, hauteurs, densités et comportements d'interaction ne sont pas contractualisés par famille de composants.
- Aucun contrat Glass web, contraste du verre, bruit, blur, fallback et coût de rendu n'est encore défini.

### Interactions et motion

- La seule règle transversale est actuellement la désactivation quasi totale des durées avec `prefers-reduced-motion`.
- Il n'existe pas de vocabulaire de mouvement, de courbes, de durées, de transitions de route, de chorégraphie de listes ni de règles de continuité spatiale.
- Skeletons, toasts, dialogs, drawers et menus ne partagent pas de langage motion documenté.
- Les changements d'état ne sont pas classés entre feedback immédiat, transition de structure, navigation et progression asynchrone.

### Accessibilité

- Les fondations utiles existent : langue française, labels dans plusieurs formulaires, focus Radix, `prefers-reduced-motion`, mode Couleurs accessibles et tests axe.
- La couverture est hétérogène : 39 fichiers TSX seulement contiennent explicitement un attribut ARIA ou un rôle, ce qui ne permet pas de conclure à une non-conformité mais justifie un audit écran par écran.
- Le futur design doit couvrir WCAG 2.2 AA, zoom/reflow, clavier, focus non masqué, lecteurs d'écran, contraste forcé et alternatives aux gestes de glissement ou drag.

## 5. Risques de la refonte

| Risque | Conséquence | Réponse attendue |
| --- | --- | --- |
| Copier le mobile | Interface web surdimensionnée ou dépendante de gestes tactiles | Partager l'identité et les intentions, adapter navigation, densité et overlays au web |
| Embellir l'existant | Conservation implicite d'une mauvaise hiérarchie | Repartir des tâches et parcours décrits dans la documentation |
| Généraliser le Glass | Contraste faible, rendu coûteux, fatigue visuelle | Verre réservé aux surfaces flottantes avec fallback Solid strict |
| Sur-animer | Latence perçue et gêne vestibulaire | Motion fonctionnel, interruptible et réduit selon les préférences |
| Concevoir seulement le desktop | Ruptures tablette, tactile et zoom | Maquetter des comportements de largeur, pas trois captures isolées |
| Concevoir seulement l'état nominal | Implémentation divergente | États async, erreurs, Premium et permissions dans chaque composant Figma |
| Refaire le métier dans Figma | Contradictions avec le backend | Les règles métier restent la source de vérité |

## 6. Décisions prises

1. Le legacy visuel est explicitement non normatif.
2. Le web et le mobile partagent la marque Vasco, les rôles sémantiques, le ton, les entités et les principes de qualité, pas une géométrie commune.
3. Les maquettes web futures deviennent la première source de vérité visuelle du navigateur.
4. La cible est une application web responsive à adaptation continue, utilisable au clavier, à la souris et au tactile.
5. Light et Dark sont obligatoires. Glass est un matériau progressif, jamais un thème séparé ni une condition fonctionnelle.
6. Le mode Couleurs accessibles, `prefers-contrast`, `forced-colors`, `prefers-reduced-motion` et un fallback explicite de transparence font partie du contrat.
7. Les choix de conteneur sont web : page, panneau latéral, modal, popover ou drawer compact selon la tâche ; aucune bottom sheet mobile n'est copiée automatiquement.

## 7. Livrables nécessaires avant Figma

- direction produit et visuelle ;
- architecture de navigation et comportements responsive ;
- spécification des fondations et composants ;
- langage motion et matériaux ;
- matrice exhaustive des écrans et états ;
- règles de handoff et structure du fichier Figma ;
- ordre de conception et critères de validation.

Ces livrables sont couverts par les documents référencés dans `docs/README.md`.
