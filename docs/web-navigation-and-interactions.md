# Navigation et interactions de Vasco Web

## 1. Principes

- Une destination métier importante possède une URL stable et partageable lorsque les droits le permettent.
- Navigation, filtres et overlays respectent retour/avance, rechargement et ouverture dans un nouvel onglet.
- Les paramètres d'URL portent des identifiants et un état sérialisable utile, jamais un objet métier complet.
- Une carte ouvre le détail ; `…` ouvre les actions ; un bouton déclenche une action.
- Hover est un enrichissement, jamais un prérequis.
- Tout geste de drag possède une alternative par activation simple, conformément à WCAG 2.2.
- Un retour restaure autant que possible scroll, filtre, tab, date, animal et page de pagination.

## 2. Architecture d'information cible

### Navigation primaire

1. Accueil
2. Suivi
3. Agenda
4. Animaux
5. Autre

Cet ordre, ces noms et la sémantique des icônes reprennent Vasco mobile. `Suivi` regroupe Objectifs et Statistiques dans un sous-menu explicite du rail desktop. `Autre` donne accès à Groupes, Contacts, Notes et Souhaits. Notifications et Profil sont globaux.

L'ordre final peut être ajusté après test de fréquence sur le web, mais le vocabulaire reste aligné avec Vasco mobile.

### Accès globaux

- Recherche ou palette de commandes, si validée après inventaire des actions ;
- Création globale ;
- Notifications avec compteur non lu ;
- Apparence ;
- Profil/compte.

La création globale remplace les CTA de page qui ouvrent exactement le même flux. `Nouvel événement` et `Ajouter` sont donc retirés de l'Agenda. Les créations réellement contextuelles, comme `Ajouter une mesure` dans Animaux, restent près de leur objet.

Le sélecteur global `Contexte animal` est supprimé. Agenda, Animaux, Objectifs et Statistiques utilisent chacun un filtre ou sélecteur local lorsque le domaine le nécessite ; ce choix ne fuit pas vers une autre destination.

## 3. Adaptation du shell

| Contexte | Navigation | Contenu | Overlays privilégiés |
| --- | --- | --- | --- |
| Compact | top bar + navigation compacte ; menu si nécessaire | une colonne | page, dialog bref, drawer/bottom drawer court |
| Medium | rail compact ou drawer de navigation | une ou deux zones | drawer latéral ou page |
| Expanded/Wide | rail persistant + en-tête de contenu compact | maître/détail possible | drawer latéral, dialog, popover |
| Ultra-wide | rail + largeur centrale bornée + rail contextuel utile | pas d'étirement vide | panneau contextuel |

La navigation compacte ne doit pas forcément reprendre une bottom bar mobile native. Figma doit comparer au moins : barre basse web, rail compact et menu de destinations, avec clavier et zoom.

## 4. Choix du conteneur d'interaction

| Conteneur | Quand l'utiliser | Quand l'éviter |
| --- | --- | --- |
| Page | tâche longue, URL utile, historique, comparaison, formulaire complexe | confirmation brève |
| Vue maître/détail | exploration répétée d'une liste sur large écran | petit écran ou objets sans détail riche |
| Drawer latéral | consulter/éditer sans perdre le contexte, tâche moyenne | flux très long ou nécessitant une URL indépendante |
| Dialog modal | décision focalisée, confirmation, formulaire bref | navigation, contenu long, aide générale |
| Popover | menu, filtre bref, information ancrée non modale | contenu critique ou complexe |
| Bottom drawer compact | choix ou action courte au tactile | copie systématique des bottom sheets mobiles |
| Inline disclosure | détails secondaires et progressifs | contenu essentiel masqué par défaut |

Les popovers sont non modaux ; un vrai blocage utilise un dialog. Référence : [MDN — Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API). Les dialogs suivent le focus trap, l'initial focus, `Escape` et la restauration décrits par le [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

## 5. Routage recommandé

Les routes actuelles restent un inventaire. La structure finale sera arbitrée dans Figma puis alignée au routeur, sans alias de compatibilité.

| Domaine | Destination canonique envisagée | Détails à représenter |
| --- | --- | --- |
| Accueil | `/dashboard` ou future route décidée explicitement | aperçu, météo, aujourd'hui, prochains jours, objectifs |
| Agenda | `/calendar` | date, recherche, filtres ; détail événement par route ou intercepting route |
| Animaux | `/animals` | animal sélectionné et onglet sérialisables si utile |
| Objectifs | `/performances/objectives` | détail objectif |
| Statistiques | `/performances/statistics` | portée animaux, période, indicateur |
| Groupes | `/groups` | détail groupe, invitations |
| Contacts | `/contacts` | page à créer ; détail contact |
| Notes | `/notes` | détail note |
| Souhaits | `/wishes` | détail souhait |
| Notifications | `/notifications` | préférence accessible via section stable |
| Compte | `/profile` | profil, apparence, abonnement, confidentialité |

Les détails ouverts en panneau desktop peuvent utiliser une route interceptée afin que refresh, partage et nouvel onglet gardent un résultat cohérent. Sur petit écran, la même URL devient une page entière.

## 6. Parcours transversaux

### Création globale

Ordre : Événement, Animal, Objectif, Note, Contact, Souhait, Groupe. Groupe reste visible et Premium. L'IA et la voix restent hors périmètre web tant qu'une décision produit ne les active pas.

- Desktop : palette ou popover enrichi depuis le CTA global.
- Compact : drawer d'actions ou page courte.
- Après choix : page ou drawer de formulaire selon complexité et largeur.
- Annulation d'un brouillon modifié : confirmation de perte.
- Succès : fermeture/retour au contexte, sélection de l'objet créé et feedback discret.

### Formulaires

- Une étape correspond à une intention, pas à une hauteur d'écran.
- Desktop peut regrouper plusieurs étapes mobiles si la charge cognitive reste faible.
- Le résumé final est requis pour les créations complexes ou irréversibles, pas comme cérémonie systématique.
- Valeurs préservées entre étapes, erreurs et changement de largeur.
- CTA principal unique ; `Entrée` ne soumet pas prématurément un formulaire multi-étapes.
- Sortie par navigateur, lien, fermeture ou `Escape` soumise à la même politique de brouillon.
- Le socle Web utilise un panneau latéral large et plein écran sur Compact pour les tâches complexes. Événement suit `Essentiel → Animaux → Détails → Finaliser`, Animal `Identité → Caractéristiques → Quotidien → Compléments` et Objectif `Objectif → Animaux → Étapes`. La progression, le retour, les validations intermédiaires et les actions fixes en pied sont communs.
- Groupe, Contact, Note et Souhait restent volontairement sur une étape : en-tête éditorial, champs regroupés par intention et pied d'actions stable. Une étape artificielle ne doit pas être ajoutée à un formulaire court.

### Actions d'entité

- Action fréquente : visible près du titre ou dans la zone concernée.
- Actions secondaires : menu `…` ancré sur desktop, drawer court sur compact si la liste est longue.
- Une action qui ouvre un dialog porte une ellipse dans son libellé lorsque cela aide à annoncer une étape supplémentaire.
- Suppression, départ, décès, retrait, refus et suppression de compte : confirmation explicite avec impact.

### Premium

1. Entrée visible avec badge textuel et icône.
2. Activation ouvre une explication contextualisée.
3. `Comparer les offres` ouvre le comparatif.
4. Retour conserve le contexte.
5. Refus backend actualise les entitlements avant d'afficher le même parcours.

## 7. Parcours par domaine

### Accueil

Présente météo, Aujourd'hui, Prochains jours et Objectifs en cours. Chaque module échoue indépendamment. La météo reste une synthèse compacte ; Aujourd'hui reçoit la priorité visuelle. Chaque tuile expose directement sa poignée à six points en haut à droite et son angle de redimensionnement en bas à droite, sans mode d'organisation intermédiaire.

### Agenda et événements

- Calendrier et liste du jour restent liés sans navigation inutile.
- Recherche, types et animaux sont combinables ; la politique de reset suit les règles métier communes.
- Desktop : calendrier + liste, détail événement dans un panneau latéral large de 620 px afin de préserver le contexte du jour sélectionné ; les actions restent ancrées en pied.
- Compact : calendrier condensé puis liste ; le même détail devient un panneau plein écran au-dessus du shell, avec contenu défilant et actions toujours accessibles.
- Création/modification couvre les sept types, récurrence, animaux, groupes, dossier médical et documents.
- Une série demande la portée occurrence/suivantes/série avant mutation complète ou suppression.

### Animaux

- Sélecteur d'animal persistant dans le workspace.
- Animaux présents en premier ; historique révélé progressivement.
- Onglets Informations, Physique et Santé sans perdre la sélection.
- Partagé : provenance et lecture seule annoncées par texte + icône.
- Mesure : création contextuelle courte ; historique accessible depuis la métrique.
- Formulaire animal : tâche complexe, préférable en page ou grand drawer desktop ; page sur compact.
- Le sélecteur local reprend le mobile : anneau dégradé seulement autour de l'animal sélectionné, aucun rectangle de sélection derrière l'item.

### Suivi

- Objectifs et Statistiques sont deux sous-destinations stables.
- Les listes d'objectifs ouvrent un détail ; progression et sous-étapes sont actionnables au clavier.
- Les statistiques commencent par portée animale, période et indicateur.
- Chaque graphique possède tableau/résumé accessible et état données partielles.
- Compte Gratuit : parcours Premium avant requête coûteuse lorsque l'entitlement est connu.

### Plus

Hub secondaire sobre : Groupes, Contacts, Notes, Souhaits. Sur desktop, ces destinations peuvent aussi apparaître dans une section secondaire du rail ; le hub reste utile en compact.

### Notifications et compte

- La cloche reflète le compteur backend avec `99+` et un libellé accessible.
- Une notification actionnable propose Accepter/Refuser sans rendre toute la ligne ambiguë.
- Le profil sépare identité, apparence, notifications, abonnement, sécurité et confidentialité.
- La suppression de compte reste une zone danger dédiée.

## 8. Clavier, focus et pointeur

- `Tab` parcourt les contrôles réels dans l'ordre visuel ; pas de `tabindex` positif.
- Flèches seulement pour les widgets qui suivent un pattern ARIA défini : tabs, menu, radio, listbox, grille interactive.
- `Escape` ferme l'overlay supérieur lorsque cela ne détruit pas silencieusement un brouillon.
- Le focus initial dépend du contenu : titre statique pour un long dialog, premier contrôle pour une tâche brève, action la moins destructive pour une confirmation.
- À la fermeture, retour au déclencheur ou à l'objet nouvellement créé.
- Le focus ne passe jamais sous une barre sticky ; WCAG 2.2 AA exige qu'il ne soit pas entièrement masqué.
- Les cibles visent 44 × 44 CSS px pour les contrôles d'application ; le minimum WCAG 2.2 AA de 24 × 24 reste un plancher, pas la cible Vasco.
- Tout drag, swipe ou resize possède boutons, menu ou saisie alternative.

Références : [WCAG 2.2](https://www.w3.org/TR/WCAG22/) et [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/).

## 9. États de navigation

- Route en chargement : shell stable, skeleton de la destination.
- Accès interdit : explication et destination sûre, pas un écran vide.
- Session expirée : conserver si possible la destination et le brouillon non sensible, reconnecter, puis revenir.
- 404 métier : retour vers la liste avec message compréhensible.
- Offline/réseau : données conservées si cachées, mutation non répétée automatiquement si sensible.
- Retour arrière pendant mutation : désactivé seulement si nécessaire et expliqué ; sinon mutation annulable ou poursuivie côté serveur.

## 10. Prototype Figma obligatoire

Cette obligation décrit la conception initiale M0–M10. Pour le cycle correctif I12–I18, les prototypes existants servent uniquement à préserver les parcours non contredits ; la validation se fait dans le navigateur et aucune modification Figma n'est requise.

Le prototype web doit démontrer au minimum :

1. connexion → accueil ;
2. navigation entre les cinq domaines ;
3. Agenda → détail → modification → confirmation ;
4. Animaux → changement d'animal → mesure → historique ;
5. Objectifs → détail → progression ;
6. Statistiques Gratuit puis Premium ;
7. Groupe : invitation et proposition ;
8. création globale → formulaire → abandon/succès ;
9. notification → entité ;
10. passage Wide → Compact avec la même tâche et le même état.
