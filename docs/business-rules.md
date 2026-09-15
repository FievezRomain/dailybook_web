# Règles métier applicables à Vasco Web

## Source de vérité

Les règles métier sont communes au backend, au mobile et au web. Le document complet de référence reste celui du produit Vasco. Ce document synthétise ce que le client web doit respecter sans redéfinir les règles côté interface.

Le backend est la source de vérité des droits, projections de dates, récurrences, partages, propriété et entitlements. Le web affiche et accompagne ces décisions, mais ne les sécurise jamais seul.

## Principes transverses

- Toute mutation sensible ou destructive est confirmée explicitement.
- Une fonctionnalité Premium reste visible et expliquée ; elle n’est pas simplement masquée ou désactivée.
- Les erreurs métier sont présentées dans un langage compréhensible sans exposer de détails techniques.
- Les données saisies sont conservées après une erreur ou un retour dans un parcours.
- Les accès à une ressource sont filtrés et contrôlés côté backend, même si l’UI masque l’action.

## Premium

Sont Premium : statistiques, création et gestion des groupes, création assistée par IA et notes vocales. Les documents médicaux et le suivi corporel suivent les entitlements définis par le backend.

Un membre Gratuit d’un groupe actif peut accepter/refuser une invitation, consulter le groupe, proposer ses propres animaux et contribuer selon les permissions métier. La création et la gestion du groupe restent Premium.

## Animaux

- Le créateur d’un animal en est le propriétaire direct.
- Seul le propriétaire peut modifier, supprimer ou enrichir l’animal.
- Un membre autorisé peut consulter un animal partagé via un groupe actif.
- Un animal partagé expose sa provenance et reste identifiable comme partagé.
- Les photos, historiques et documents privés nécessitent un contrôle d’accès avant signature.
- Le dossier médical retient les soins et rendez-vous éligibles, sans dupliquer les occurrences récurrentes.
- Le suivi corporel autorise au plus une photo par animal et mois, dans la fenêtre temporelle définie, avec contrôle concurrent côté backend.

## Événements

- Un événement peut concerner un animal possédé ou accessible via un groupe actif.
- L’auteur contrôle modification, duplication et suppression selon les règles backend.
- Une série récurrente exige un scope explicite pour modifier ou supprimer une occurrence.
- L’état initial dépend de la date mais peut être explicitement remplacé.
- Le partage n’est possible qu’avec les groupes contenant tous les animaux sélectionnés.
- Un animal reçu par partage ne peut pas être repartagé indirectement vers un autre groupe.
- Les documents sont limités aux formats autorisés et contrôlés par entitlement et accès.
- Les anniversaires et rappels annuels proviennent de `/events/highlights` ; le web ne les recalcule pas.

## Groupes

- Le créateur Premium devient gestionnaire.
- Un groupe est actif tant que son gestionnaire conserve un Premium actif.
- Une invitation n’accorde aucun accès avant acceptation.
- Un membre peut quitter un groupe et retirer son propre animal selon les règles métier, même s’il est Gratuit.
- Seuls les animaux possédés directement peuvent être proposés.
- Les propositions en attente et les animaux acceptés restent distincts.
- Le retrait d’un partage supprime les liens du groupe, jamais les données originales de l’animal.

## Objectifs

- Un objectif appartient à son utilisateur et peut viser des animaux accessibles.
- Au moins une sous-étape utile est requise.
- Les sous-étapes vides ne sont pas persistées.
- L’état d’une sous-étape se met à jour par la route dédiée.
- La duplication crée une nouvelle entité sans réutiliser les identifiants techniques.

## Notes, souhaits et contacts

- Chaque entité est isolée par propriétaire.
- Les notes utilisent le format courant défini par le backend et conservent les métadonnées historiques nullables.
- La note vocale est Premium et sa transcription reste un brouillon à confirmer avant création.
- Un souhait peut contenir les métadonnées et l’image autorisées par le contrat.
- Les champs de contact ne donnent jamais accès à une ressource appartenant à un tiers par simple connaissance de son identifiant.

## Notifications

- Les notifications persistantes sont la source d’affichage dans l’application.
- Lecture individuelle, lecture globale et suppression utilisent les routes backend.
- Le badge correspond aux notifications non lues fournies par le backend.
- `dailyReminderEnabled` active ou désactive les notifications quotidiennes de l’utilisateur ; cette préférence est gérée depuis la page Compte et enregistrée immédiatement via le backend.
- Une préférence utilisateur ne remplace pas les obligations fonctionnelles ou de sécurité.

## Fichiers

- Le web demande un ticket d’upload avant tout transfert.
- La finalisation confirme au backend qu’un upload a abouti.
- Les fichiers ne sont téléchargeables qu’après vérification de la ressource associée.
- HTML, SVG actif et MIME non autorisés sont refusés.
- Une suppression de fichier est liée à la mutation métier concernée et confirmée lorsqu’elle entraîne une perte.

## Évolution

Toute nouvelle règle est d’abord définie dans la documentation produit commune et sécurisée dans le backend. Les clients web et mobile sont ensuite alignés, avec des interactions propres à leur plateforme.
