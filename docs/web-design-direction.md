# Direction UX/UI de Vasco Web

## 1. Ambition

Vasco Web doit donner la sensation d'un outil personnel soigné, serein et immédiatement compréhensible. L'interface accompagne un quotidien riche en informations sans devenir un tableau de gestion froid ni une copie agrandie du mobile.

La cible est :

- **chaleureuse**, par la typographie, les accents de marque et les images ;
- **calme**, par des surfaces neutres, une hiérarchie stable et peu de bruit visuel ;
- **précise**, par des libellés explicites, des alignements nets et des états non ambigus ;
- **fluide**, par des changements d'état continus et rapides ;
- **inclusive**, par un usage complet clavier, souris, tactile, zoom et technologies d'assistance ;
- **contemporaine**, par une densité adaptative, une typographie expressive maîtrisée, des compositions asymétriques légères et un Glass fonctionnel.

## 2. Principes d'expérience

### Comprendre avant d'agir

Le titre, le contexte courant, l'animal ou la période sélectionnée et l'action principale doivent être compris sans inspection. Les icônes renforcent un libellé ; elles ne portent seules ni une règle métier ni un état critique.

### Un écran, une intention dominante

Une page peut offrir plusieurs capacités, mais une seule action est visuellement primaire par zone. Les actions secondaires sont proches de l'objet concerné ; les actions rares vont dans un menu d'entité.

### Continuité plutôt que spectacle

Les transitions expliquent d'où vient un panneau, quel objet a changé et si une action a réussi. Elles ne retardent jamais l'accès à l'information et ne rejouent pas à chaque rendu.

### Divulgation progressive

Afficher en premier ce qui sert à la tâche courante. Les filtres avancés, historiques, métadonnées et options rares restent accessibles sans surcharger la vue initiale.

### Densité choisie, pas subie

- Petit écran : une colonne, contrôles tactiles, action principale stable.
- Tablette : navigation compacte et compositions hybrides.
- Desktop : navigation persistante, vues maître/détail et davantage d'informations simultanées.
- Large desktop : le contenu ne s'étire pas mécaniquement ; il gagne éventuellement un rail contextuel ou une seconde zone utile.

La densité n'est pas un réglage utilisateur prévu au premier lot. Elle est adaptative par contexte et largeur.

## 3. Identité visuelle

### Couleur

Les neutres portent l'essentiel de l'interface. Les couleurs Vasco sont réservées aux actions principales, sélections, repères de navigation, visualisations et moments de satisfaction.

- Aucun grand aplat brun historique par défaut.
- Aucune surface métier arbitrairement colorée.
- Les catégories Événement utilisent une palette contrôlée et un second canal perceptible.
- Succès, avertissement, danger et information ne reprennent pas la couleur de marque.
- Les gradients restent courts, subtils et localisés : anneau de sélection, accent de hero, progression ou halo décoratif.
- À compter de la revue produit du 6 septembre 2026, le canvas Light redevient blanc neutre comme sur `main` (`#ffffff`) et le canvas Dark reprend son neutre historique (`#0a0a0a`), sous réserve des contrôles de contraste. Les tons chauds ne colorent plus le fond global.

### Marque et logo

- Le logo canonique est celui de Vasco mobile (`C:/REFONTE/dailybook/assets/logo.png` au moment de la revue du 6 septembre 2026).
- Le web ne maintient pas une variante de logo concurrente pour son shell, son authentification ou son accueil public.
- Les déclinaisons favicon et métadonnées sont dérivées de cet asset canonique, avec recadrage et lisibilité contrôlés aux petites tailles.

### Typographie

Quicksand peut rester la voix de marque si les tests de lecture et de métriques sont concluants. La maquette doit vérifier : chiffres tabulaires, accents français, petites tailles, tableaux, dates, poids de 400 à 700 et rendu Windows/macOS.

Hiérarchie proposée :

- Display : accueil public et moment de marque uniquement ;
- Page title : identité stable de la destination ;
- Section title : regroupement fonctionnel ;
- Card title : objet ou action ;
- Body : lecture courante ;
- Label : contrôle, statut ou métadonnée ;
- Caption : précision secondaire, jamais information essentielle seule.

Les tailles utilisent `clamp()` et une échelle typographique, pas des valeurs choisies écran par écran.

### Forme

Les formes sont douces sans devenir infantiles. Trois familles suffisent :

- contrôles : rayon modéré ;
- surfaces : rayon plus généreux ;
- surfaces flottantes : rayon supérieur et ombre ou contour renforcé.

Les pilules sont réservées aux chips, statuts, segments et petits contrôles. Une carte, un formulaire ou un panneau ne devient pas une pilule géante.

### Image et illustration

- Les animaux et documents utilisateur restent les contenus visuels principaux.
- Les illustrations de marque servent aux états vides structurants, à l'accueil public et au Premium.
- Un état vide fréquent préfère une petite illustration ou une icône calme à une scène décorative imposante.
- Les photos possèdent un ratio, un recadrage et un fallback documentés.
- Aucun média génératif ne doit masquer l'information métier ou faire supposer une fonctionnalité absente.

## 4. Composition

### Shell privé

Direction recommandée pour Figma :

- desktop : rail latéral persistant ou compactable, top bar contextuelle, contenu central et rail contextuel facultatif ;
- tablette : rail compact ou navigation latérale temporaire selon largeur disponible ;
- petit écran : top bar, navigation primaire compacte et surfaces plein écran quand la tâche le nécessite.

Le choix final entre rail persistant et top navigation doit être validé sur les parcours Agenda, Animaux et Suivi, pas sur un dashboard vide.

La revue produit du 6 septembre 2026 retient un rail compactable mais retire la grande top bar flottante sur Medium/Wide. Le titre et les actions de fraîcheur rejoignent un en-tête de contenu compact afin de rendre l'information métier visible sans scroll forcé.

### Pages

Une page standard combine : breadcrumb si nécessaire, titre, contexte, action principale, contrôles de vue, contenu, états. Le header peut devenir compact au scroll mais ne masque jamais le focus ni l'action critique.

### Surfaces

- Surface de base : contexte de lecture.
- Card : groupe autonome ou objet interactif.
- Inset : zone secondaire dans une surface, sans nouvelle ombre.
- Floating : barre, popover, palette ou panneau superposé.
- Scrim : séparation modale, jamais décoration.

Limiter les cartes imbriquées. La hiérarchie se construit d'abord par spacing, titre, séparateur et tonalité.

## 5. Responsive et adaptation

Les frames de référence servent à vérifier les comportements, pas à créer trois produits figés :

| Nom | Largeur de travail | Usage |
| --- | ---: | --- |
| Compact | 390 px | mobile web tactile |
| Medium | 768 px | tablette portrait / fenêtre réduite |
| Expanded | 1024 px | tablette paysage / petit laptop |
| Wide | 1440 px | desktop de référence |
| Ultra-wide | 1920 px | contrôle de non-étirement |

Règles :

- breakpoints décidés par rupture du contenu, pas par nom d'appareil ;
- container queries pour rendre cartes et modules indépendants de leur emplacement ;
- aucun scroll horizontal involontaire à 320 CSS px ;
- reflow utilisable à 400 % lorsque WCAG l'exige ;
- tables seulement lorsque la comparaison par colonnes est réelle ;
- vue carte/liste ou colonnes épinglées comme fallback explicite ;
- hover enrichit mais ne révèle jamais l'unique accès à une action ;
- coarse pointer et clavier sont testés indépendamment de la largeur.

## 6. Ton éditorial

- Français direct, chaleureux et précis.
- Verbes d'action spécifiques : `Créer l'événement`, `Enregistrer`, `Inviter`.
- Pas de jargon technique, code HTTP ou nom de table.
- Erreur : ce qui s'est passé, conséquence, solution.
- Vide : contexte utile et prochaine action si elle n'existe pas déjà ailleurs.
- Confirmation destructive : objet, impact, caractère réversible ou non.
- Premium : bénéfice concret avant comparaison commerciale.
- Succès : bref, non bloquant et sans exclamation systématique.

## 7. Tendances admises et limites

### Glass maîtrisé

Admis sur navigation flottante, top bar superposée, palette de commandes, popover et panneau transitoire. Interdit par défaut sur champs, longs textes, tableaux, listes denses et surfaces empilées.

### Bento et modularité

Admis pour l'accueil et les aperçus si chaque tuile correspond à une information ou action réelle. Interdit comme mosaïque décorative ou grille redimensionnable sans valeur utilisateur.

### Micro-interactions satisfaisantes

Admis pour sélection, sauvegarde, progression, réorganisation et révélation. Aucun confetti, rebond permanent ou animation de célébration sur une tâche quotidienne banale.

### Grandes typographies et dégradés

Réservés aux pages publiques et rares moments de marque. Les écrans de travail conservent une densité et une stabilité supérieures.

### Capacités intelligentes

Ne jamais suggérer par l'apparence qu'une capacité de création intelligente existe sur le web tant qu'elle reste hors périmètre produit.

## 8. Critères de réussite

Un utilisateur doit pouvoir :

1. identifier sa position et son contexte en moins de quelques secondes ;
2. accomplir les parcours fréquents sans chercher un menu global ;
3. comprendre les états Gratuit, Premium, propriétaire et partagé sans dépendre de la couleur ;
4. passer souris → clavier → tactile sans perdre de capacité ;
5. naviguer sur petit écran sans recevoir une version desktop compressée ;
6. réduire mouvement, transparence ou couleur sans perdre de contenu ;
7. retrouver son état utile après retour : filtre, date, animal, tab et position de liste.
