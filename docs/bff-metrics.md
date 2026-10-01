# Métriques BFF — US-017

## Périmètre

Les deux clients backend communs mesurent chaque tentative HTTP vers Vasco :
`vasco_bff_upstream_requests_total` et `vasco_bff_upstream_duration_seconds`.
La durée inclut le transport et la réception de la réponse Axios, mais pas la
vérification Firebase préalable, la validation métier du BFF ou le rendu navigateur.
Un HTTP 200 avec un contrat invalide reste un succès de transport ; le journal BFF
conserve l'erreur de contrat. Ce ne sont pas des métriques de disponibilité complète.

Labels fermés : méthode, route normalisée, résultat (`success`, `http_4xx`,
`http_5xx`, `timeout`, `network_error`, `internal_error`). Les routes inconnues
deviennent `__unmatched__`. Aucun identifiant, query string, corps, cookie ou
message d'erreur n'est exporté. Le mobile relève des métriques API, pas de ce BFF.
Les timeouts restent 10 secondes pour JSON et 30 secondes pour l'export PDF existant.

## Activation privée

- `BFF_METRICS_ENABLED=true` active collecte et export ; absent ou autre valeur : désactivés.
- `BFF_METRICS_TOKEN` : secret aléatoire dédié d'au moins 32 caractères sans espaces de bord.
  Ne jamais utiliser `NEXT_PUBLIC_*`, un token utilisateur ou le secret admin.
- `GET /api/internal/metrics` exige `Authorization: Bearer <secret>`.
  Réponses : 404 désactivé, 503 configuration invalide, 401 credential incorrect,
  200 exposition Prometheus. Toujours `Cache-Control: no-store`.
- Bloquer `/api/internal/` sur le routeur public ; le collecteur contacte le service
  sur le réseau privé. Ne pas publier de port supplémentaire. TLS obligatoire
  si ce trafic quitte un réseau privé de confiance. La protection du routeur est
  une condition de mise en service, pas une configuration déployée par cette PR.

Configuration indicative Prometheus (aucun secret dans Git) :

```yaml
scrape_configs:
  - job_name: vasco-web-bff
    metrics_path: /api/internal/metrics
    scrape_interval: 30s
    authorization:
      credentials_file: /run/secrets/vasco_bff_metrics_token
    static_configs:
      - targets: [frontend-new:3000]
```

## Lecture Grafana

Débit par route :
```promql
sum by (route) (rate(vasco_bff_upstream_requests_total[5m]))
```

p95 du transport en secondes :
```promql
histogram_quantile(0.95, sum by (le, route) (rate(vasco_bff_upstream_duration_seconds_bucket[5m])))
```

Timeouts et erreurs serveur doivent être affichés séparément avec les filtres
`outcome="timeout"` et `outcome="http_5xx"`. Une division par débit nul ou un p95
sans observations doit rester « aucune mesure », jamais être forcé à zéro.
Ajouter les dimensions service/instance/environnement côté collecteur.

## Limites et vérification

Registre en mémoire du processus Node, réinitialisé au redémarrage. Le singleton
est partagé entre modules serveur dans ce processus ; déployer un processus par
conteneur et collecter chaque instance séparément. Les workers multiples et
l'hébergement serverless nécessitent une autre stratégie de collecte.
Un échec d'observation ne modifie pas la réponse métier.

Tests ciblés : export protégé/désactivé, normalisation, absence de données privées,
timeouts, HTTP 500, erreur réseau, tolérance aux erreurs du collecteur et passage
réel par les helpers JSON/PDF. La collecte dans Prometheus et les panneaux Grafana
restent à raccorder et à vérifier avant clôture de US-017. Aucun déploiement production.

Recette HTTP locale du 01/10 : `scripts/start-metrics-recipe.mjs` et
`scripts/test-metrics-recipe.mjs`, avec Firebase émulé sur 9099 et la fixture
FastAPI dédiée sur 8008, vérifient les vrais Route Handlers Next en développement.
Succès, erreur API 500 et timeout réel à 10 s passent et sont visibles depuis
l'export (registre partagé entre routes). Prometheus les collecte ; les secrets
de test sont absents des métriques. Le build de production reste à qualifier.
Le compte émulé créé par la recette est supprimé dans un `finally`.

Complément : build standalone et même recette HTTP réussis en mode production
local sur 3013 (`--production` sur les deux scripts). La signature du handler
Agenda exige désormais explicitement `Request`, conformément aux types générés
Next ; ses cinq tests passent avec de vraies requêtes, sans valeur implicite.
