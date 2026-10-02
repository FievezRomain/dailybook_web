# Droits d’abonnement au retour dans l’onglet — Admin US-012

Le hook canonique `useCurrentUser` relit `/api/me` au retour au premier plan et
au rétablissement du réseau, même si le cache du profil a moins d’une minute.
Le BFF reste le seul interlocuteur du navigateur et lit `/api/v1/users/me`.
Pas de polling, de nouvel endpoint, de changement Firebase ni d’appel admin
depuis le client web.

Les options s’appliquent uniquement au profil. Le comportement global des autres
requêtes (`refetchOnWindowFocus: false`) reste inchangé. Les consommateurs du
hook reçoivent le nouveau droit, cadeau ou révocation. Une erreur conserve la
dernière valeur connue avec `isError`, sans annoncer une actualisation réussie.
Le backend reste responsable de chaque autorisation Premium.

## Vérifications et recette restante

Quatre tests du hook passent : attribution, révocation, reconnexion réseau,
échec du rafraîchissement. Le typage passe également.

Sur un compte local autorisé : ouvrir le web, changer ses droits depuis l’admin,
revenir à l’onglet et vérifier profil et gates Premium sans déconnexion. Répéter
avec révocation, expiration et autre droit actif. Vérifier séparément les listes
de groupes déjà en cache : cette correction rafraîchit le profil, pas toutes les
listes métier. Contrôler aussi les refus serveur avec une interface obsolète.
Ces recettes complètes ne sont pas déclarées effectuées et l’US reste ouverte.

Aucun déploiement de production n’est réalisé par ce changement.
