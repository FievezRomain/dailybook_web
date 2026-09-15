# Baseline qualité de Vasco Web

## Périmètre initial

La baseline couvre les pages publiques `/`, `/login` et `/register`. Les parcours privés et les scénarios de session sont ajoutés dans le livrable E2E dédié de la phase 0.

## Commandes de référence

- `npm run typecheck` : TypeScript strict ;
- `npm run lint:ci` : ESLint bloquant sur toute erreur et sur toute augmentation au-delà de la baseline legacy de 117 avertissements ;
- `npm test` : tests unitaires et composants Vitest ;
- `npm run test:coverage` : couverture avec seuil cible de 70 % ;
- `npm run test:a11y` : axe sur desktop Chromium et viewport mobile ;
- `npm run test:performance` : budgets Playwright de durée de chargement et de transfert réseau ;
- `npm run test:e2e` : suite Playwright complète.

## Seuils initiaux

| Axe | Seuil bloquant |
|---|---|
| Tests | aucun test en échec |
| Couverture cible | 70 % lignes, fonctions, branches et statements |
| Accessibilité axe | aucune violation `critical` ou `serious` |
| Chargement local Playwright | moins de 5 s |
| Transfert des ressources | moins de 3 Mo par page |

La couverture globale est une cible de refonte et non un résultat déjà atteint : elle devient bloquante lorsque les domaines migrés remplacent le legacy. Chaque nouveau domaine doit respecter le seuil sans abaisser la configuration.

## Baseline technique observée

- Le build de production génère 25 routes/pages.
- Le JavaScript partagé initial est d’environ 101 kB lors de la mesure du 23 août 2026.
- Les pages privées les plus lourdes observées sont `/calendar` (environ 256 kB de First Load JS) et `/dashboard` (environ 228 kB).
- Le dépôt ne possédait auparavant ni runner de tests, ni audit axe reproductible, ni budget Lighthouse.
- Vitest : 1 test de socle réussi sur 1. Couverture legacy mesurée : 0,07 % des lignes/statements et 47,79 % des branches/fonctions selon l’instrumentation V8 ; le seuil cible de 70 % échoue donc volontairement tant que les domaines ne sont pas testés.
- Axe : les 6 contrôles desktop/mobile échouent sur une violation sérieuse commune, l’absence de `<title>` sur les trois pages publiques.
- Lighthouse, médiane de trois passages : `/` performance 0,71, accessibilité 0,95, bonnes pratiques 0,96 ; `/login` 0,90/0,96/0,96 ; `/register` 0,72/0,96/0,96.
- La page `/` présente un LCP anormal d’environ 48,6 s. `/register` présente une médiane proche de 4,9 s, contre environ 2,8 s pour `/login`.
- Lighthouse relève également des erreurs console, du JavaScript inutilisé/legacy, des ressources bloquantes et l’absence de métadonnées. Ces résultats constituent la dette initiale ; ils ne sont pas masqués par la configuration.
- L’audit npm après installation de la baseline annonçait 41 vulnérabilités, dont 7 critiques et 20 élevées. Après mise à niveau, retrait de Lighthouse CI et actualisation compatible du 24 août 2026, il ne reste aucune vulnérabilité critique ou élevée en production ; 6 modérées transitives subsistent dans la chaîne Google Cloud de Firebase Admin. Elles proviennent notamment de `uuid@9`, imposé par les plages majeures de `gaxios` et `teeny-request` : `npm audit` propose à tort une rétrogradation de Firebase Admin 14.3 vers 10.3. Aucun override de major non supporté n’est appliqué.

ESLint 9 utilise la configuration flat native de Next 16. La remise en service a corrigé les violations d’ordre des hooks et les assertions optionnelles dangereuses. Les 117 avertissements legacy restants sont plafonnés en CI et leurs exceptions sont limitées à des fichiers nommés dans `eslint.config.mjs` ; une nouvelle erreur ou un avertissement supplémentaire échoue la livraison.

Firebase Admin 14 dépend de `jwks-rsa` 4, dont le chargement CommonJS de `jose` 6 ESM échoue lorsque Next.js externalise le SDK serveur. L’override npm limite donc `jose` 4.15.9 au seul sous-arbre `jwks-rsa`; les autres consommateurs conservent leur version normale. La CI charge explicitement le point d’entrée public `firebase-admin/auth` afin de détecter toute régression de cette compatibilité runtime.

Lighthouse CI a servi à établir cette photographie puis a été supprimé : sa propre chaîne Puppeteer contenait des vulnérabilités élevées sans correctif compatible. Le contrôle continu utilise Playwright, déjà nécessaire aux E2E, afin de ne pas conserver un outil vulnérable uniquement pour préserver la baseline.

## Relevé de reprise avant implémentation — 4 septembre 2026

Le lot I0 de l’implémentation Figma a rejoué la baseline avec Node.js 22.13.0 :

| Commande | Résultat |
|---|---|
| `npm test` | 186 tests réussis sur 187 ; un test de suppression de document événement attend `422` et reçoit `502` |
| `npm run lint:ci` | réussi |
| `npm run typecheck` | réussi |
| `npm run build` | réussi avec Next.js 16.3.2/Turbopack ; 35 pages générées |
| `npm run test:e2e` | 24 réussis, 12 échoués et 4 non exécutés sur 40 |

Les échecs E2E se répartissent entre six contrôles axe sur l’absence de `<title>`, deux attentes utilisant encore `/profil` au lieu de `/profile`, deux connexions refusées à l’émulateur Firebase `127.0.0.1:9099` et deux contrôles CSP qui refusent `'unsafe-eval'`. Les quatre scénarios de cycle de session placés après l’échec série ne sont pas exécutés. Cette photographie est une baseline de dette, pas une dérogation aux seuils de sortie : les lots d’implémentation doivent empêcher toute régression et la recette I11 doit retrouver une suite verte.
