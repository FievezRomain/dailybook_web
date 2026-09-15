# Revue produit visuelle web du 6 septembre 2026

## Statut et portée

Ce document consigne les retours produit donnés après la première implémentation et la recette automatisée I11. Ils rouvrent l'acceptation graphique des écrans privés et deviennent la source de vérité visuelle prioritaire pour le cycle correctif I12 à I18 de `web-implementation-plan.md`.

- Périmètre : identité visuelle, composition, navigation, densité, mouvement et ergonomie des pages privées.
- Hors périmètre : modification des maquettes Figma, changement des règles métier, des contrats BFF/FastAPI ou suppression d'une fonctionnalité métier non demandée.
- Le fichier Figma web reste une référence d'inventaire et de comportement pour ce qui n'est pas contredit ici. Les décisions de cette revue priment sur ses compositions devenues obsolètes.
- L'app mobile Vasco est la référence pour le logo, les noms de navigation, l'iconographie partagée et le sélecteur d'animaux, sans imposer sa géométrie au navigateur.

## Décisions transversales validées

### Fond et identité

- Rétablir un fond d'application neutre, sans teinte de marque étendue. La référence vérifiée sur la branche `main` est `#ffffff` en Light et `#0a0a0a` en Dark ; les valeurs finales devront être contrôlées dans les quatre préférences visuelles avant validation.
- Réserver les couleurs Vasco aux composants, sélections, statuts, graphiques, illustrations et micro-accents. Aucun grand aplat chaud sur le canvas principal.
- Remplacer `public/logo.png` par le logo réellement utilisé dans l'app mobile, `C:/REFONTE/dailybook/assets/logo.png`. Les deux fichiers ont les mêmes dimensions mais des contenus différents ; le remplacement doit couvrir le shell privé, l'authentification, l'accueil public, les métadonnées et les icônes dérivées pertinentes.

### Contexte animal

- Supprimer entièrement le sélecteur global « Contexte animal » du shell et de toutes les pages.
- Supprimer sa préférence persistée et les espaces réservés qu'il crée.
- Conserver les filtres ou sélecteurs d'animaux strictement locaux aux fonctionnalités qui en ont besoin : Agenda, Animaux, Objectifs, Statistiques et formulaires concernés.
- Un filtre local ne doit jamais modifier silencieusement une autre page.

### Navigation et iconographie

- Aligner exactement les noms visibles et la sémantique des icônes sur l'app mobile :

| Destination | Nom mobile à reprendre | Icône mobile de référence | Équivalent web attendu |
| --- | --- | --- | --- |
| `/dashboard` | Accueil | `home-outline` | maison contour, pas une grille de dashboard |
| `/performances/*` | Suivi | `chart-line` | courbe/statistiques, pas une cible |
| `/calendar` | Agenda | `calendar-month-outline` | calendrier mensuel contour |
| `/animals` | Animaux | `paw-outline` | patte contour |
| hub secondaire | Autre | `menu` | menu, pas trois points d'action |
| `/notifications` | Notifications | `bell-outline` | cloche contour ; variante pleine si non lu si utile |
| `/profile` | Profil | `account-outline` | utilisateur contour |

- Sur desktop, `Suivi` devient une section dépliable du rail avec deux sous-destinations explicites : `Objectifs` et `Statistiques`. Son état ouvert est conservé pendant la session ; la destination active reste annoncée indépendamment de la couleur.
- Les libellés `Plus`, `Compte` ou `Profil et compte` ne doivent pas créer de divergence arbitraire : reprendre `Autre` pour le hub secondaire et `Profil` pour la destination racine, puis nommer précisément les sections à l'intérieur.

### App Rail et mouvement

- Garder le bouton de réduction à une position fixe et prévisible dans l'en-tête du rail. Le chevron peut inverser sa direction pour annoncer l'action suivante, mais il ne doit jamais changer de ligne, d'alignement ou de cible visuelle entre les états.
- Transition proposée : largeur du rail 240 à 280 ms avec `ease-emphasis`, libellés révélés par `opacity` et léger `clip` sans translation spectaculaire, indicateur actif et icônes conservant leur axe. L'ouverture et la fermeture sont interruptibles.
- Le contenu principal accompagne le changement de largeur sans saut ; aucun élément de navigation ne se remonte après coup et aucune icône ne change de centre optique.
- Avec `prefers-reduced-motion: reduce`, la largeur et les libellés changent instantanément ou par un fondu inférieur ou égal à 100 ms.
- Le choix d'un rail replié ou déplié est mémorisé, sans provoquer de flash d'état incorrect à l'hydratation.

### Hauteur utile et top bar

- La top bar actuelle de 72 px, ajoutée au rail flottant et à ses marges, réduit trop la zone visible. La remplacer sur Medium/Wide par un en-tête de contenu compact et non flottant, intégré à la page, d'environ 44 à 52 px selon le besoin.
- Le titre reste le `h1` unique de la page mais ne justifie pas à lui seul une grande surface sticky.
- La synchronisation devient une action compacte et discrète dans la barre d'outils locale, avec fraîcheur dans un tooltip, un popover ou un libellé secondaire lorsque nécessaire.
- Une top bar globale n'est conservée sur Compact que pour les accès réellement globaux. Le contenu prioritaire doit apparaître sans scroll sur un viewport laptop courant.

### Création globale et doublons

- Le bouton global `Créer` du rail est l'entrée de création générique.
- Supprimer les boutons de page qui déclenchent exactement le même flux générique, notamment `Nouvel événement` et `Ajouter` dans Agenda, ainsi que les CTA équivalents repérés ailleurs.
- Conserver seulement les actions contextuelles non substituables : `Ajouter une mesure`, `Inviter un membre`, `Ajouter un document`, etc.
- Un état vide peut expliquer la marche à suivre mais ne duplique pas automatiquement le CTA global.

## Propositions par page

### Accueil privé

- Recomposer la grille par importance et volume réel d'information.
- La météo devient une tuile compacte de synthèse, idéalement une largeur de colonne et une hauteur minimale : lieu, icône, température et condition. Les détails restent accessibles par expansion ou lien.
- `Aujourd'hui` reçoit la zone la plus immédiatement visible ; `Prochains jours` et `Objectifs` occupent les surfaces plus riches.
- Placer la poignée de déplacement dans l'angle supérieur droit de chaque tuile, alignée avec son menu d'actions, jamais au-dessus du titre.
- Sur tactile et clavier, fournir un mode `Organiser les tuiles` avec actions Déplacer avant/après et Réinitialiser ; ne pas dépendre du drag.
- Rebaseliner les layouts enregistrés afin que l'ancienne grande tuile météo ne survive pas à la correction.

### Agenda

- Corriger la sélection d'un jour : activation souris, tactile, `Entrée` ou `Espace` met à jour la date sélectionnée, `aria-selected`, le focus logique et la liste de la journée.
- Donner davantage de hauteur au calendrier : viser l'occupation du viewport disponible, avec cellules plus respirantes et minimum contrôlé plutôt qu'une hauteur fixe écrasée.
- Corriger le champ de recherche avec une primitive commune garantissant l'espace réservé à l'icône et au texte.
- Ajouter les filtres animaux présents dans l'app mobile, combinables avec recherche et types d'événements, avec remise à zéro explicite.
- Supprimer les créations redondantes avec le bouton global du rail.
- En Wide, privilégier une composition calendrier large + panneau du jour plus étroit ; en Medium/Compact, empiler sans réduire excessivement la grille.

### Animaux

- Repenser entièrement la composition comme un workspace, pas comme une série de cards compressées.
- En tête de contenu : sélecteur horizontal des animaux, puis identité de l'animal sélectionné avec photo, informations courtes, provenance partagée et menu d'actions.
- Le sélecteur reprend le comportement mobile : aucun anneau pour un item non sélectionné, anneau en dégradé uniquement pour la sélection, aucun rectangle rouge de fond sur l'item.
- Sous l'identité : onglets `Informations`, `Santé`, `Physique` conservant l'animal sélectionné. Chaque onglet utilise une grille adaptée au contenu, avec grandes zones pour l'historique ou les médias et petits modules pour les métriques.
- En Wide, autoriser une colonne de synthèse stable et une zone de détail ; en Compact, une seule colonne avec hiérarchie nette. Ne jamais forcer des contenus courts à remplir une grande card.

### Suivi — Objectifs

- Faire de `Suivi` un parent de navigation et d'`Objectifs` une page autonome.
- Proposition : bandeau de synthèse compact (actifs, terminés, progression moyenne), segments `En cours`/`Terminés`, puis grille de cartes avec progression lisible, prochaine étape et animal concerné.
- Le détail d'un objectif s'ouvre dans un panneau sur Wide et en page sur Compact. Les actions secondaires restent dans `…`.
- Éviter l'empilement de grandes surfaces colorées ; une couleur ou un gradient local peut porter la progression et la réussite.

### Suivi — Statistiques

- Page analytique autonome, accessible depuis le sous-menu `Suivi`.
- Barre de contrôles compacte et sticky seulement dans la zone de contenu : animaux, période et indicateur.
- Hiérarchie proposée : métrique principale, évolution, comparaison, résumé textuel, puis table de données accessible.
- Utiliser une grande visualisation utile plutôt qu'une mosaïque de petits graphiques. Les sept statistiques restent sélectionnables et chaque état de données insuffisantes explique quoi faire.

### Groupes

- Passer à une exploration maître/détail sur Wide : liste de groupes à gauche, groupe actif à droite ; page entière sur Compact.
- Les cartes de groupe montrent identité, avatars des membres, nombre d'animaux partagés, rôle de l'utilisateur et état actif/inactif sans surcharge.
- Le détail est structuré en aperçu, membres, animaux partagés et invitations/propositions, avec compteurs et actions contextuelles.
- Le Premium et les permissions sont visibles mais calmes ; ne pas transformer la page en succession de grands encarts d'alerte.

### Contacts

- Reprendre le modèle d'un répertoire téléphonique : contacts triés et regroupés sous des lettres, en lignes denses avec avatar/initiales et coordonnées essentielles.
- Ajouter un index alphabétique vertical à droite. Il permet clic, tactile et clavier, annonce la lettre courante et défile vers un en-tête de groupe sticky.
- Corriger le champ de recherche via la primitive commune afin que l'icône ne chevauche jamais le placeholder.
- En Wide, le détail peut occuper un panneau latéral ; en Compact, une page dédiée.

### Notes

- Remplacer la grille uniforme actuelle par une bibliothèque éditoriale plus légère : notes épinglées mises en avant, liste ou grille adaptative, densité variable selon l'extrait.
- Rendre le Markdown en contenu formaté sûr sur les cards et dans le détail ; ne jamais exposer les marqueurs bruts comme `**`, `#` ou les syntaxes de lien.
- Limiter les extraits par hauteur, préserver titres, listes et emphases utiles, puis afficher date et état épinglé en métadonnées discrètes.
- En Wide, privilégier liste + aperçu/éditeur ; en Compact, navigation liste → détail → édition.

### Souhaits

- Adopter une composition inspirée de Pinterest : masonry visuel, images de ratios variables, colonnes décalées et cartes de hauteur intrinsèque.
- Superposer avec parcimonie prix, statut acquis et menu ; conserver nom et destinataire lisibles sous l'image.
- Maintenir un ordre DOM logique indépendant de l'effet masonry, une navigation clavier prévisible et une alternative lorsque CSS masonry n'est pas disponible.
- Le détail reste une surface dédiée, pas une card agrandie dans la grille.

### Notifications

- Conserver la base fonctionnelle mais enrichir la page en flux d'activité groupé par `Aujourd'hui`, `Cette semaine` et `Plus ancien`.
- Distinguer non lu, priorité et type par combinaison surface + icône + libellé, jamais par couleur seule.
- Ajouter des actions contextuelles courtes et un retour visuel de lecture doux ; éviter une surenchère de cards.

### Profil et compte

- Repenser la page comme un centre de réglages premium et structuré, pas comme un empilement de formulaires.
- En Wide : navigation secondaire ou sommaire à gauche, section active à droite. En Compact : liste de rubriques puis détail.
- Sections proposées : `Profil`, `Préférences`, `Notifications`, `Abonnement`, `Sécurité et confidentialité`.
- Introduire un en-tête de profil soigné avec photo, identité et état d'abonnement ; isoler la zone dangereuse en fin de parcours.
- L'édition est progressive : lecture claire par défaut, modification à la demande, feedback de sauvegarde local.

## Arbitrages explicitement reportés

- Aucune modification du fichier Figma dans ce cycle.
- L'effet Pinterest concerne la composition des souhaits, pas la copie de la marque, de ses interactions propriétaires ou de son contenu.
- Le détail exact des traitements visuels de Notifications sera arrêté pendant I17 après comparaison avec les autres pages de listes ; la page est acceptable fonctionnellement mais pas encore considérée premium.

## Critères communs d'acceptation

- L'information principale de chaque page est visible sans scroll forcé à 1440 × 900 et 1280 × 720, hors contenus naturellement longs.
- Aucun sélecteur global de contexte animal ne subsiste.
- Aucun CTA de création ne double le bouton global `Créer`.
- Les champs de recherche réservent correctement la place de leur icône à 320 px, 200 % de zoom et avec une police agrandie.
- Les écrans sont vérifiés en Light, Dark, Accessible, Reduced Motion et fallback Solid.
- Les nouvelles compositions conservent loading, vide, erreur, refresh error, lecture seule, permissions et Premium lorsqu'ils s'appliquent.
- Les décisions sont validées sur le rendu navigateur réel ; les anciennes frames Figma ne bloquent pas une correction explicitement demandée dans cette revue.
