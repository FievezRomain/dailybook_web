# Gestion de l’état

## Catégories d’état

| Type | Outil | Exemples |
|---|---|---|
| État serveur | TanStack Query v5 | animaux, événements, groupes, notifications |
| État URL | route et search params | date d’agenda, filtre, onglet, pagination |
| État local | `useState` / reducer | modal ouverte, sélection temporaire |
| Formulaire | React Hook Form | valeurs, erreurs, dirty state |
| État transverse client | store ciblé ou Context | brouillon multi-étapes, préférences UI |
| Authentification | serveur + provider léger | utilisateur courant et entitlements affichés |

## Règles

- Ne pas recopier dans un Context les listes déjà détenues par le cache réseau.
- Les mutations passent par les hooks de domaine et invalident les clés concernées.
- Les états de formulaire non sauvegardés restent locaux ou dans un store de brouillon dédié.
- Les filtres partageables ou restaurables appartiennent à l’URL.
- Le backend reste la source de vérité des permissions et entitlements.
- Aucun Context ne doit exposer `isError: any` ; utiliser un type d’erreur commun.

## Migration des Contexts existants

Pour chaque domaine :

1. créer les schémas et types ;
2. créer les hooks de lecture/mutation ;
3. migrer les composants consommateurs ;
4. déplacer l’état purement visuel au plus près des composants ;
5. supprimer le Context seulement lorsqu’il n’a plus de consommateur.

Conserver un Context uniquement lorsqu’il coordonne réellement plusieurs branches de l’interface et ne représente pas une copie de données serveur.
