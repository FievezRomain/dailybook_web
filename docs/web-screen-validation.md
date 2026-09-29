# Matrice de validation UX/UI web

## Statut de la source visuelle

Le fichier séparé [Vasco Web](https://www.figma.com/design/CzdthSttGqMnjCh3ycZECp) est désormais la source visuelle de référence. Au 4 septembre 2026, ses 21 pages, les lots M0 à M10, les 17 overlays et les 16 prototypes sont produits ; les node IDs définitifs sont consignés dans `web-figma-mockup-plan.md`.

Le fichier mobile reste la référence d'identité, de slogan, de couleurs et d'iconographie partagée, jamais une référence géométrique ou interactionnelle du navigateur. L'audit transversal final des bindings de variables, de l'Auto Layout, des annotations d'accessibilité et des modes de fallback est validé.

La revue produit du 6 septembre 2026, consignée dans `web-product-visual-review-2026-09-06.md`, invalide l'acceptation graphique des écrans privés précédemment déclarés terminés. Elle prime sur les frames web qu'elle contredit. Aucun changement Figma n'est demandé : la nouvelle recette porte sur le rendu navigateur des lots I12 à I18.

## Largeurs de référence

| Mode | Largeur de contrôle | Attendu principal |
|---|---:|---|
| Compact | 390 px | Une colonne, aucune troncature ni action recouvrant le contenu |
| Medium | 768 px | Composition intermédiaire sans scroll horizontal |
| Expanded | 1024 px | Rupture tablette/laptop explicitement décidée |
| Wide | 1440 px | Navigation persistante et largeur de lecture maîtrisée |
| Ultra-wide | 1920 px | Aucun étirement inutile ; rail contextuel seulement s'il apporte de la valeur |
| Zoom | 200 % à 1280 px | Contenu et actions utilisables sans perte d'information |

Light, Dark, Couleurs accessibles, mouvement réduit et fallback Solid sont vérifiés aux largeurs pertinentes. Les états distants sont contrôlés avec un compte Gratuit puis Premium, puis propriétaire et partagé lorsque le domaine le permet.

## Inventaire des vues à valider

La cible compte 15 destinations de page : les 14 routes actuellement présentes plus `/contacts`, déjà exposée par la navigation et les contrats mais sans page App Router au jour de l'audit.

| Parcours | Routes | États ou overlays obligatoires |
|---|---|---|
| Accès public | `/`, `/login`, `/register`, `/verify-email` | défaut, saisie, validation, erreur, attente, succès et redirection |
| Accueil privé | `/dashboard` | chargement partiel, vide, erreur, météo dans ses sept états et grille responsive |
| Agenda | `/calendar` | chargement, vide, erreur, détail, création, modification, récurrence, partage, documents et confirmations |
| Animaux | `/animals` | propriétaire/partagé, chargement, vide, erreur, fiche, historiques, dossier médical, photos, Premium et confirmations |
| Suivi | `/performances/objectives`, `/performances/statistics` | listes et formulaires d'objectifs, statistiques textuelles/graphiques, vide, erreur et Premium |
| Organisation | `/groups`, `/notifications` | gratuit/Premium, invitations, propositions, membres, préférences, vide, erreur et confirmations |
| Contenu personnel | `/contacts`, `/notes`, `/wishes` | recherche, vide, erreur, détail, création, modification, perte de brouillon, suppression et upload lorsque pertinent |
| Compte | `/profile` | chargement, erreur, profil, photo, préférences et abonnement |

## Résultat du premier lot

- L'accueil public, la connexion, l'inscription et la vérification e-mail utilisent les primitives et tokens sémantiques communs.
- Les formulaires publics passent d'une largeur fixe de 32 rem à une composition fluide contrôlée à 390, 1024 et 1440 px.
- Les champs possèdent des labels programmatiques et des attributs d'autocomplétion ; les erreurs sont annoncées et les actions de navigation ne sont plus des ancres inertes.
- Les trois feuilles SCSS publiques historiques, qui dépendaient de variables supprimées et imposaient des tailles brutes, sont supprimées.
- Contrôles visuels effectués à 390, 1024 et 1440 px ; la connexion a aussi été vérifiée en Dark + Couleurs accessibles, avec hydratation et bascule des deux préférences.
- Vérifications techniques : 5 tests publics ciblés, suite globale à 174 tests, lint, typecheck et build Next 16.3.2 de production sous Node 22.13.0.

## Validation finale effectuée

- [x] Recette automatisée I11 : les suites Playwright séquentielles Chromium Desktop et Compact passent intégralement (55/55 chacune), y compris les 16 flows, les contrats BFF, les états Premium et les reflows Wide/Medium/Compact exercés par les parcours.
- [x] Accessibilité automatisée I11 : axe ne remonte aucune violation critical/serious sur les routes publiques ; Login est validé au clavier, en forced colors et sans débordement dans les deux projets Chromium (8 scénarios après la reconstruction publique).
- [x] Revue manuelle I11 terminée : comparaison route par route aux largeurs de référence, zoom 200 %, clavier et technologies d’assistance couverts par la recette finale.
- [x] Revue produit corrective I12–I18 terminée : shell, Home, Agenda, Animaux, Suivi, Groupes, Contacts, Notes, Souhaits, Notifications et Profil/Compte satisfont les décisions de `web-product-visual-review-2026-09-06.md` telles qu’affinées pendant la recette navigateur.
- [x] Bindings de variables contrôlés ; aucune valeur récurrente brute sur les sources actives.
- [x] Auto Layout et contraintes des composants structurants contrôlés ; exceptions de géométrie libre documentées.
- [x] Annotations focus, clavier, dismiss, ordre DOM et fallback Solid/Reduced Motion relues.
- [x] `00 — Cover & Status` synchronisée avec NOTE-04, CONTACT-04 et FLOW-11/12/13 — panneau `573:973`.
- [x] Revue produit et handoff final consolidés ; source de vérité prête pour l'implémentation.
