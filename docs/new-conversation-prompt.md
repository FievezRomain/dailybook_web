# Prompt de reprise de l’implémentation Vasco Web

Copier le bloc ci-dessous dans une nouvelle conversation Codex. Le cycle UX/UI I0–I18 étant clôturé, une nouvelle conversation traite soit une demande de maintenance explicitement fournie, soit une tranche de la phase 6 — Industrialisation.

État de reprise au 19 septembre 2026 : I0–I18, I11 et la phase 5 sont clôturés. Aucun lot correctif graphique n’est ouvert ; la phase 6 reste à planifier séparément.

```text
Tu reprends l’implémentation de Vasco Web dans :
C:\DEV\MyDailyBook\dailybook_front_next\dailybook

Le backend FastAPI est dans :
C:\DEV\MyDailyBook\dailybook_srv_javascript

L’application mobile et la documentation produit historique sont dans :
C:\REFONTE\dailybook

Le fichier Figma web validé est :
https://www.figma.com/design/CzdthSttGqMnjCh3ycZECp

Objectif de cette conversation :
traiter la demande de maintenance fournie par l’utilisateur ou, sur demande explicite, une tranche bornée de la phase 6 indiquée dans `docs/refactor-plan.md`. Ne pas rouvrir I0–I18 sans nouvelle régression démontrée ou décision produit explicite.

Si je fournis un objectif plus précis, reste strictement dans ce périmètre. Ne lance pas spontanément un chantier d’industrialisation ou une nouvelle refonte visuelle.

Avant toute modification :
1. Lis complètement `AGENTS.md` et `docs/README.md`.
2. Lis complètement `docs/refactor-plan.md` et confirme que la phase 5 est clôturée et que la phase 6 est la première phase éventuellement ouverte.
3. Consulte `docs/web-implementation-plan.md` comme historique vérifié de la refonte I0–I18.
4. Pour une régression graphique, lis `docs/web-product-visual-review-2026-09-06.md` puis `docs/web-visual-correction-matrix.md`. Consulte ensuite Figma uniquement pour les comportements non contredits par les décisions produit plus récentes.
5. Lis seulement les autres documents routés ci-dessous nécessaires au lot ; ne charge pas toute la documentation ni tout le dépôt.
6. Inspecte les fichiers de code et tests directement concernés. Utilise `rg` pour localiser les consommateurs.
7. Vérifie l’état Git et préserve toutes les modifications existantes non liées.
8. Lis dans `node_modules/next/dist/docs/` les guides Next.js 16 nécessaires avant d’écrire du code concerné par ces APIs.

Routage documentaire :
- suivi d’implémentation obligatoire : `docs/web-implementation-plan.md` ;
- brief prioritaire I12–I18 : `docs/web-product-visual-review-2026-09-06.md` ;
- matrice de cibles, baseline et tests I12–I18 : `docs/web-visual-correction-matrix.md` ;
- plan global et phase active : `docs/refactor-plan.md` ;
- node IDs, composants et flows Figma : `docs/web-figma-mockup-plan.md` ;
- handoff Figma : `docs/web-figma-handoff.md` ;
- métier ou permissions : `docs/business-rules.md` ;
- architecture/arborescence : `docs/architecture.md` ;
- routes et DTO : `docs/api-services.md`, puis les routes/modèles FastAPI concernés ;
- session, BFF, CSRF, XSS ou fichiers : `docs/authentication.md` ;
- état/cache/Contexts : `docs/contexts.md` ;
- composants/formulaires : `docs/components-nextjs.md` ;
- thème et tokens : `docs/tailwind-colors.md`, puis `docs/web-design-system-specification.md` ;
- direction graphique : `docs/web-design-direction.md` ;
- navigation ou parcours : `docs/web-navigation-and-interactions.md` ;
- motion, Glass ou transitions : `docs/web-motion-and-materials.md` ;
- UX/UI, responsive et accessibilité : `docs/web-ux-ui-standards.md` et `docs/web-screen-validation.md` ;
- outils, scripts et CI : `docs/stack.md`.

Contraintes impératives :
- Pour I12–I18, la revue produit du 6 septembre 2026 prime sur les anciennes frames web. Figma reste la source pour ce qu'elle ne contredit pas. L’app mobile fournit l’identité, le slogan, le logo, les noms et l’iconographie partagée, pas la géométrie du navigateur.
- Le legacy sert uniquement à comprendre les fonctionnalités et les consommateurs ; il n’est jamais une cible visuelle ou de compatibilité.
- Remplace directement l’existant. N’ajoute aucun suffixe V1/V2, fallback, façade, alias, double route ou feature flag de transition.
- Réutilise les composants partagés. Ne recrée pas localement navigation, topbar, formulaires, cards, overlays ou icônes déjà disponibles.
- Applique la structure corrective : App Rail animé et aligné mobile, sous-menus Suivi/Autre imbriqués sous leur parent uniquement à partir de 1536 px mais conservés en panneau/sélecteur sur les formats inférieurs, aucun contexte animal global, en-tête desktop compact et création globale sans CTA de page redondant.
- Implémente réellement Wide, Medium et Compact ; ne réduis pas simplement une frame desktop.
- Chaque page de données couvre selon pertinence loading, vide, erreur, refresh error, succès, lecture seule et Premium.
- Respecte Light/Dark, Standard/Accessible, Full/Reduced Motion et Glass/Solid.
- Vasco Web utilise un BFF : navigateur -> endpoint Next `/api/*` -> `backendApiClient` serveur -> FastAPI `/api/v1/*`.
- Le navigateur ne doit jamais appeler FastAPI directement ni connaître son URL interne.
- Réutilise les hooks TanStack Query, schémas Zod, erreurs, protections CSRF et permissions existants.
- Aucun secret ni URL FastAPI interne sous `NEXT_PUBLIC_*`.
- Aucun `dangerouslySetInnerHTML`, HTML utilisateur non assaini, URL externe non validée ou upload HTML/SVG actif.
- Utilise les endpoints REST actuels ; ne réintroduis aucune route legacy.
- Supprime dans le même lot les anciens composants, styles et dépendances devenus inutiles.

Rappels produit importants :
- Accueil public/Auth : conserver la page d’entrée éditoriale premium — hero typographique asymétrique, slogan mobile exact « Retrouvez simplement le quotidien de vos animaux. », aperçu produit composé d’un agenda, d’une météo sans commune codée en dur et d’un objectif, comparatif officiel Gratuit/Premium, bénéfices numérotés et CTA Auth explicites — sans ajouter de prix, de page Tarifs ou de paiement. Connexion et inscription utilisent le shell immersif Vasco avec grand logo sur disque blanc contrasté, discours éditorial adapté, aperçu de journée sur desktop, formulaire focalisé et affichage contrôlé du mot de passe ; ne pas rétablir le panneau beige ni les cards Auth génériques.
- Onboarding : parcours de première connexion intégré à Home.
- Home : météo compacte avec ville/pays visible, acquisition navigateur fraîche et recherche manuelle de ville en repli ; contenu utile visible sans scroll forcé, déplacement direct par poignée à six points en haut à droite, redimensionnement direct par le coin inférieur droit et bouton de restauration de la disposition initiale. Dans chaque tuile, l’icône et le titre restent sur une même ligne. Les cartes événements et objectifs utilisent la composition dense harmonisée (accent discret, métadonnées lisibles, progression et actions secondaires), sans aplat de type surdimensionné. Le panneau du jour sélectionné dans l’Agenda réutilise exactement ces cartes événement. Les sept types d’événement reprennent les couleurs chaudes de l’app mobile via les aliases `event-*`, jamais les anciens rôles bleu/vert/violet génériques ; les événements dans la grille du calendrier utilisent la couleur pleine de leur type. Le détail événement n’est plus une grande modale centrée : il s’ouvre en panneau latéral de 620 px sur desktop pour préserver le calendrier, et en panneau plein écran sur Compact. Son ordre de lecture est type/statut, titre, date-heure-lieu, animaux, détails métier, note, documents et partage, avec actions persistantes en pied.
- Agenda : calendrier remonté et agrandi, aucun total d’événements au-dessus, panneau du jour strictement aligné sur la hauteur de la colonne calendrier en Wide, sélection de date fiable, bouton de filtres intégré à l’en-tête ouvrant une modale et aucun bouton de création redondant.
- Formulaires d’entités : toutes les créations et modifications s’ouvrent dans une belle modale centrée, dimensionnée au contenu et scrollable dans le viewport, avec la page d’origine conservée derrière. Le header, la progression et le pied restent compacts afin de réserver l’essentiel de la hauteur aux champs ; dans tout parcours multi-étapes, une ligne relie les jalons et matérialise la progression accomplie. Événement commence en création par un écran visuel de choix parmi les sept types, comme sur mobile ; sélectionner un type ouvre immédiatement la suite. Animal et Objectif gardent leur progression multi-étapes ; Groupe, Contact, Note et Souhait gardent une étape unique structurée. Toutes les listes déroulantes reposent sur `Select`, `Combobox` ou `MultiSelect`, et toutes les dates/heures sur `DateInput`, `TimeInput` ou `DateRangeInput`, sans contrôle natif ou style local divergent. Préserver tous les champs, validations, droits, uploads, récurrences et contrats métier existants.
- Animaux : workspace entièrement recomposé autour d’un aperçu de profil puis de quatre zones respirantes — identité, santé, mesures/historique et suivi photo. Le sélecteur reste horizontal mais n’a ni card englobante, ni contour sur les animaux non sélectionnés, ni fond rectangulaire ; seul l’animal sélectionné conserve l’anneau dégradé demandé.
- Objectifs : cockpit de progression avec anneau global, volumes En cours/Terminés, filtre animal local et segments d’état. Chaque carte met en avant le statut, l’échéance, la progression et une seule prochaine étape directement actionnable ; les autres actions restent dans le menu contextuel. La création passe exclusivement par l’action globale `Créer`, qui contient l’entrée Objectif.
- Statistiques : page analytique autonome avec contrôles animaux/période/indicateur compacts dans le flux normal de la page — ils défilent avec le contenu et ne restent jamais au premier plan. Toute modification d’un contrôle déclenche directement la nouvelle requête, sans bouton de validation. Afficher une métrique principale, un grand visuel adapté — anneau pour dépenses, histogramme pour activités/concours, courbe pour poids/taille, heatmap pour alimentation — un résumé textuel et la table exacte accessible. Les sept indicateurs, données partagées partielles, insuffisance, erreur et gate Premium restent couverts.
- Groupes : exploration maître/détail sur Wide et liste vers détail sur Compact, avec identité, rôle, membres, animaux et état actif immédiatement lisibles ; les invitations et permissions Premium restent intégrées calmement au flux.
- Contacts : répertoire alphabétique en lignes denses avec initiales, raccourcis téléphone/e-mail, index A–Z utilisable au clavier et détail en panneau latéral ; la recherche réagit pendant la saisie.
- Notes : bibliothèque éditoriale à densité variable, épinglées prioritaires, recherche instantanée et Markdown sûr réellement rendu dans les extraits comme dans le détail.
- Souhaits : tableau d’inspiration en masonry accessible, avec ratios de visuels alternés, hauteurs intrinsèques et colonnes décalées. Prix, statut et menu restent superposés avec parcimonie ; nom et destinataire restent sous l’image. La recherche et les segments Tous/Envies/Acquis réagissent immédiatement, et le détail utilise une surface dédiée.
- Notifications : la page est uniquement un centre d’activité ; elle ne contient aucun réglage de préférence.
- Profil : page compte classique sans navigation interne. Une grande carte de présentation réunit uniquement photo, nom, e-mail et type d’abonnement, sans badges artificiels « compte vérifié » ou « session sécurisée ». Les informations modifiables, l’apparence, le switch `dailyReminderEnabled` des notifications quotidiennes et la confidentialité se succèdent naturellement en dessous. L’édition d’identité utilise une modale centrée et les mutations BFF existantes restent la source de vérité.
- Maquettes et flows : versions Web et Compact, grandes et lisibles, sans variante V1/V2 concurrente.

Méthode attendue :
1. Identifie la demande de maintenance ou la tranche d’industrialisation explicitement autorisée et résume son périmètre.
2. Pour I0, établis la matrice Figma/code/tests et la baseline avant toute refonte visuelle.
3. Pour I12–I18, pars du brief produit prioritaire, puis identifie les composants partagés et les éventuelles frames Figma encore compatibles.
4. Établis un plan court pour la tranche courante et indique les fichiers probablement concernés.
5. Implémente verticalement avec des changements bornés, jusqu’à un résultat utilisable.
6. Ajoute ou adapte les tests proportionnés au risque.
7. Exécute les vérifications ciblées puis lint, typecheck, build ou E2E selon la Definition of Done.
8. Compare visuellement le résultat au brief produit dans le navigateur réel ; utilise Figma seulement pour les zones non contredites.
9. Après chaque résultat entièrement vérifié, mets immédiatement à jour les cases de `docs/web-implementation-plan.md`.
10. Mets aussi `docs/refactor-plan.md` à jour seulement lorsqu’un livrable de phase est réellement terminé.
11. Ne coche jamais une clôture de lot tant que son critère de sortie n’est pas démontré.
12. Termine par : résultat, documentation éventuellement mise à jour, fichiers modifiés, tests exécutés et écarts restant ouverts.

Critères d’acceptation supplémentaires pour cette conversation :
[OPTIONNEL — AJOUTER 3 À 8 CRITÈRES MESURABLES]

Hors périmètre supplémentaire :
[OPTIONNEL — LISTER CE QUI NE DOIT PAS ÊTRE MODIFIÉ]
```

## Découpage conseillé des conversations

1. I0 — baseline et matrice Figma/code/tests.
2. I1 — tokens, thèmes et primitives communes.
3. I1 — formulaires et overlays de base.
4. I2 — shell Wide/Medium.
5. I2 — shell Compact et navigation globale.
6. I3 — Auth et onboarding Home.
7. I3 — grille Home, météo, événements et objectifs.
8. I4 — Agenda puis formulaires Événements.
9. I5 — workspace Animaux puis formulaires/historiques.
10. I6 — Objectifs puis Statistiques.
11. I7 — Groupes et invitations.
12. I8 — Notes, Contacts puis Souhaits.
13. I9 — Notifications puis Compte.
14. I10 — overlays, états transverses et 16 flows.
15. I11 — recette, accessibilité, suppression du legacy et bascule finale.
16. I12 — rebaseline visuelle et fondations correctives.
17. I13 — shell, navigation et identité.
18. I14 — Home puis Agenda.
19. I15 — Animaux puis Objectifs/Statistiques.
20. I16 — Groupes puis Contacts.
21. I17 — Notes/Souhaits puis Notifications/Profil.
22. I18 — recette visuelle corrective et clôture I11/phase 5.

Cette liste reste un historique de découpage. Aucun de ces lots ne doit être rejoué sans régression démontrée ou nouvelle décision produit.
