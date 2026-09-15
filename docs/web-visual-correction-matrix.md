# Matrice d'exécution du cycle visuel I12–I18

## Rôle

Cette matrice traduit `web-product-visual-review-2026-09-06.md` en cibles de code et en contrôles vérifiables. Elle est initialisée par I12 et mise à jour par chaque lot propriétaire. Les captures de départ sont dans `docs/baselines/i12/` et sont générées par `e2e/visual-correction-baseline.spec.ts` avec des données déterministes.

## Baseline navigateur I12

Les 22 captures de viewport ont été produites le 6 septembre 2026 : onze routes à 1280 × 720 et onze routes à 1440 × 900. Aucun débordement horizontal n'a été détecté. La mesure verticale part du haut du viewport ; elle révèle l'espace consommé avant le premier contenu métier plutôt qu'un simple succès de rendu.

| Destination | Premier contenu visible à 1280 × 720 | Position haute | Premier contenu visible à 1440 × 900 | Position haute | Constat de départ |
| --- | --- | ---: | --- | ---: | --- |
| Accueil | Onboarding Groupe | 233 px | Onboarding Groupe | 233 px | Top bar + contexte consomment l'amorce ; météo ensuite surdimensionnée |
| Agenda | Contrôles type/recherche puis calendrier | 176 px | Identique | 176 px | Recherche chevauchée, CTA doublons et calendrier trop bas dans le viewport |
| Animaux | Sélecteur Aria | 208 px | Identique | 208 px | Workspace comprimé et sélection non conforme au mobile |
| Objectifs | En-tête interne Suivi/Objectifs | 176 px | Identique | 176 px | Hiérarchie redondante et deux CTA `Créer un objectif` possibles à vide |
| Statistiques | Introduction puis Filtres | environ 216 px | Identique | environ 216 px | Grande zone de filtres avant le résultat, contexte global redondant |
| Groupes | `Aucun groupe actif` | 401 px | Identique | 401 px | L'information utile arrive très bas pour un état vide |
| Contacts | Première ligne de coordonnées | 393 px | Identique | 393 px | Grille générique, pas de regroupement alphabétique, recherche chevauchée |
| Notes | Extrait Markdown brut | 459 px | Identique | 459 px | Premier contenu tardif et marqueurs `**` visibles |
| Souhaits | Description/recherche, puis première card | 223/353 px | Identique | 223/353 px | Recherche chevauchée, grille uniforme et CTA global de page |
| Notifications | Première notification | 280 px | Identique | 280 px | Fonctionnel mais composition de liste basique |
| Profil | Identité Camille | 443 px | Identique | 443 px | Titre interne redondant et identité très tardive |

Les valeurs machine complètes restent disponibles dans `docs/baselines/i12/observations.json`. Les captures sont des preuves de départ, pas des golden files à reproduire.

## Inventaire du contexte animal global

| Élément actuel | Fichier ou clé | Consommateurs | Décision I13 |
| --- | --- | --- | --- |
| Provider global | `src/features/animals/context/animal-scope-context.tsx` | Monté par `PrivateLayout` | Supprimer le provider et le stockage transversal |
| Préférence navigateur | `localStorage['vasco:animal-scope']` et événement `vasco:animal-scope-change` | Toutes les pages privées | Supprimer la clé et ignorer/nettoyer l'ancienne valeur sans compatibilité persistante |
| UI globale | `src/shared/components/layout/ContextSwitcher.tsx` | Rendu au-dessus de chaque page par `PrivateLayout` | Supprimer composant, test, import, rendu et espace réservé |
| Home | `TodayTasksCard`, `UpcomingTasksCard`, `GoalsCard` | Filtrage implicite événements/objectifs | Revenir à la synthèse complète ; toute future portée est locale à la tuile |
| Agenda | `CalendarContent` | Filtrage implicite des événements | Remplacer en I14 par un filtre animaux local et visible |
| Animaux | `AnimalsContent` | Sélection du workspace | Remplacer en I15 par l'état local du sélecteur de page |
| Objectifs | `ObjectivesContent` | Filtrage implicite de la liste | Remplacer en I15 par un filtre local explicite si conservé |
| Tests | tests `animal-scope-context`, `ContextSwitcher` et mocks consommateurs | Validation de la persistance globale | Supprimer ou réécrire avec les états locaux des lots propriétaires |

## Inventaire des CTA de création

Le menu `Créer` du rail expose actuellement Événement, Animal, Note, Dépense et Groupe. Le classement ci-dessous compare les déclencheurs de page à ce menu réel, pas à une capacité hypothétique.

| Domaine | CTA visible actuel | Classement | Lot et décision |
| --- | --- | --- | --- |
| Home | `Créer un groupe` dans l'onboarding Groupe | Doublon du menu global Groupe | I14 : retirer le CTA ; conserver l'explication et orienter vers `Créer` sans second bouton primaire |
| Agenda | `Nouvel événement` | Doublon du menu global Événement | I14 : supprimer |
| Agenda vide du jour | `Ajouter` | Doublon du menu global Événement | I14 : supprimer |
| Animaux vide | `Ajouter un animal` | Doublon du menu global Animal | I15 : supprimer |
| Groupes | `Créer un groupe` | Doublon du menu global Groupe | I16 : supprimer |
| Notes | `Nouvelle note` | Doublon du menu global Note | I17 : supprimer |
| Objectifs | `Créer un objectif` en en-tête | Non couvert par le menu global | I15 : conserver une seule entrée claire |
| Objectifs vide | second `Créer un objectif` | Doublon interne | I15 : retirer au profit de l'entrée de page conservée |
| Contacts | `Créer un contact` | Non couvert par le menu global | I16 : conserver |
| Souhaits | `Nouveau souhait` | Non couvert par le menu global | I17 : conserver |
| Mesures, membres, documents, étapes | actions `Ajouter`, `Inviter`, `Joindre` liées à un objet | Contextuel non substituable | Conserver près de l'objet |
| Relances et préférences | `Réessayer`, `Actualiser`, `Tout marquer comme lu` | Action d'état, pas création | Conserver |

## Matrice mobile → web définitive

Sources mobiles vérifiées : `C:/REFONTE/dailybook/features/home/mainTabs.ts` et `C:/REFONTE/dailybook/shared/components/ui/icons/iconRegistry.ts`.

| Ordre | Route/hub web | Libellé définitif | Glyph mobile | Lucide web retenu | État actif |
| ---: | --- | --- | --- | --- | --- |
| 1 | `/dashboard` | Accueil | `home-outline` | `House` | contour + indicateur, jamais grille dashboard |
| 2 | `/performances/*` | Suivi | `chart-line` | `ChartNoAxesCombined` | parent actif si Objectifs ou Statistiques |
| 3 | `/calendar` | Agenda | `calendar-month-outline` | `CalendarDays` | indicateur + libellé |
| 4 | `/animals` | Animaux | `paw-outline` | `PawPrint` | indicateur + libellé |
| 5 | hub secondaire | Autre | `menu` | `Menu` | actif si Groupes, Contacts, Notes ou Souhaits |
| global | `/notifications` | Notifications | `bell-outline`/`bell` | `Bell` | badge non lu indépendant de l'état actif |
| global | `/profile` | Profil | `account-outline` | `UserRound` | indicateur + libellé |

Le desktop peut exposer `Objectifs` et `Statistiques` sous `Suivi`, mais ne renomme pas la destination racine. Les sous-entrées utilisent respectivement une cible/progression et une courbe analytique sans contredire l'icône racine.

## Fondations préparées par I12

| Besoin | Primitive | Contrat préparé | Lots consommateurs |
| --- | --- | --- | --- |
| Recherche sans chevauchement | `SearchField` | label obligatoire, icône non interactive, `pl-10`, erreur reliée, tailles héritées d'`Input` | I14 Agenda, I16 Contacts, I17 Notes/Souhaits |
| En-tête compact | `ContentHeader` | `h1` focalisable, description optionnelle, actions compactes, hauteur minimale 44 px | I13 puis toutes les pages |
| Navigation locale | `SecondaryNavigation` | URL, `aria-current`, reflow horizontal → vertical | I13 Suivi, I17 Profil |
| Répertoire | `AlphabeticalDirectory` + `groupAlphabetically` | tri français, diacritiques normalisés, lettres sticky, index ancré clavier/tactile | I16 Contacts |
| Masonry | `MasonryGrid` | colonnes progressives, hauteurs intrinsèques, ordre DOM conservé, fallback une colonne | I17 Souhaits |
| Markdown sûr | `MarkdownText` | CommonMark/GFM, HTML utilisateur ignoré, liens sécurisés, styles de lecture communs | I17 Notes |

## Matrice de tests I13–I18

| Lot | Tests composants/intégration obligatoires | Contrôles navigateur obligatoires |
| --- | --- | --- |
| I13 | navigation mobile/web, sous-menu Suivi, état actif, persistance rail, suppression du contexte, Reduced Motion | transition ouverte/fermée/interrompue, 1280 × 720, 1440 × 900, clavier, aucune perte de premier contenu |
| I14 | migration layouts Home, poignées directes de déplacement/redimensionnement, sélection de date, recherche et filtres animaux en modale | Home/Agenda Wide/Medium/Compact, zoom 200 %, manipulation directe des tuiles, date clavier/tactile, combinaisons de filtres |
| I15 | sélection animale locale, tabs workspace, filtre Objectifs, contrôles Statistiques | propriétaire/partagé/Premium, sous-menu Suivi, graphiques et résumés non exclusivement colorés |
| I16 | permissions Groupes, tri/diacritiques Contacts, index alphabétique, restauration de liste | maître/détail Wide, liste→détail Compact, index souris/tactile/clavier |
| I17 | Markdown malveillant et GFM, ordre DOM masonry, chargement image, groupement Notifications, navigation Profil | Notes/Souhaits/Notifications/Profil aux largeurs de référence et dans les quatre préférences visuelles |
| I18 | suites unitaires/BFF existantes et absence de legacy correctif | 22 captures finales comparables à I12, tous les flows, lecteur d'écran, forced colors, Reduced Motion et coarse pointer |

## Preuves de clôture I13

- `docs/baselines/i13/` contient 22 captures de routes à 1280 × 720 et 1440 × 900, une capture dédiée du rail plié, une validation du sous-menu intégré à 1600 × 900 et `observations.json` ; aucun débordement horizontal, aucun contenu manquant et premier contenu utile au plus tard à 121 px.
- `e2e/shell-i13.spec.ts` vérifie les onze routes privées, l'absence de `Contexte animal`, le chevron sur un axe vertical stable, l'interruption de la transition, le logo visible et l'alignement central des entrées en mode plié, puis la réduction du mouvement à 100 ms sans largeur ni transform.
- `AppRail.test.tsx`, `CompactNavigation.test.tsx`, `ResponsiveAppBar.test.tsx` et `navigation.test.ts` couvrent ordre, icônes, sous-menus imbriqués et chevrons verticaux à partir de 1536 px, panneaux externes et chevrons latéraux jusqu'à 1535 px ou en rail plié, sélecteurs mobiles Suivi/Autre, persistance, alignement plié, synchronisation et libellés.
- Barrière technique : Vitest 102 fichiers/306 tests, lint sans avertissement, typecheck, build Next 16.3.2 et Playwright Chromium I13 1/1 verts.

## Preuves de clôture I14

- `docs/baselines/i14/` contient neuf captures Home/Agenda en Wide, Medium, Compact et zoom 200 %, dont la modale de filtres ; les compositions restent sans débordement horizontal, la météo est plus petite qu'Aujourd'hui et le calendrier, remonté sans ligne de total, conserve une hauteur utile supérieure à 580 px en Wide.
- `GridCards.test.ts`, `GridCards.interactions.test.tsx`, `WeatherCard.test.tsx` et `CalendarContent.test.tsx` couvrent la migration vers le layout version 2, la hiérarchie et les dimensions des tuiles, les poignées directes, le résumé météo, la sélection de date et la combinaison recherche/type/animaux dans la modale.
- `e2e/home-agenda-i14.spec.ts` vérifie la migration du stockage, le déplacement et le redimensionnement réels sans mode intermédiaire, la position des poignées, le parcours géolocalisation → météo affichée, la modale de filtres intégrée au calendrier, l'absence du total supérieur, le padding de recherche, leur remise à zéro, la sélection souris/clavier, l'absence des CTA Agenda redondants, les quatre largeurs de référence et Reduced Motion.
- Barrière technique : Vitest 103 fichiers/312 tests, lint sans avertissement, typecheck, build Next 16.3.2 et Playwright Chromium I14 1/1 verts.

## Traçabilité retour → lot

| Retour produit | Cible principale | Lot | Validation minimale |
| --- | --- | --- | --- |
| Fond d'origine et touches de couleur locales | tokens globaux/surfaces | I13 | Light/Dark + comparaison `main` |
| Suppression du contexte animal | shell + consommateurs ci-dessus | I13, puis états locaux I14/I15 | recherche source vide + E2E routes privées |
| Noms/icônes mobile | navigation et commandes | I13 | matrice exacte + tests |
| Rail premium, chevron stable | `AppRail`, shell, tokens motion | I13 | animation interrompue + Reduced Motion |
| Top bar trop haute | shell et `ContentHeader` | I13 | premier contenu à 1280 × 720 |
| Home météo/poignée | grille et cards Home | I14 | layout neuf + migration stockage |
| Agenda date/hauteur/recherche/filtres/doublons | `CalendarContent` | I14 | interactions souris/clavier/tactile |
| Animaux entièrement recomposé + sélecteur | workspace Animaux | I15 | états complet/propriétaire/partagé |
| Suivi entièrement recomposé + sous-menu | App Rail, Objectifs, Statistiques | I13/I15 | deux routes stables et navigation active |
| Groupes entièrement recomposé | Groupes | I16 | permissions + maître/détail |
| Contacts type répertoire | Contacts | I16 | index A–Z accessible |
| Notes modernes et Markdown rendu | Notes + `MarkdownText` | I17 | GFM et HTML hostile |
| Souhaits façon Pinterest | Souhaits + `MasonryGrid` | I17 | masonry, ordre DOM et images |
| Notifications moins basiques | Notifications | I17 | groupement temporel + états non lus |
| Profil/Compte entièrement recomposé | Profil | I17 | navigation sections + sauvegarde locale |
