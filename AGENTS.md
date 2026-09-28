# Vasco Web — règle de refonte impérative

Ce dépôt est une refonte en rupture. Le code historique sert uniquement à comprendre les fonctionnalités, les données et les contraintes métier. Il n'est pas une cible de compatibilité.

## Sources de vérité UX/UI

En cas de conflit, respecter cet ordre :

1. décisions produit explicites consignées dans `docs/web-product-visual-review-2026-09-06.md`, traduites en cibles vérifiables par `docs/web-visual-correction-matrix.md`, pour le cycle correctif I12–I18 ;
2. maquettes Vasco Web validées et leur prototype pour tout ce que la revue produit ne contredit pas ;
3. `docs/web-design-direction.md` et `docs/web-navigation-and-interactions.md` ;
4. `docs/web-design-system-specification.md` et `docs/web-motion-and-materials.md` ;
5. `docs/web-ux-ui-standards.md`, `docs/web-figma-handoff.md`, `docs/web-figma-mockup-plan.md` et `docs/web-screen-validation.md` ;
6. règles métier, contrats FastAPI et documents techniques ;
7. code existant, uniquement pour l'inventaire fonctionnel et technique.

Le fichier Figma mobile partage l'identité Vasco et les règles produit mais n'est pas une référence géométrique ou interactionnelle pour le navigateur.

Avant toute implémentation visuelle, identifier la décision applicable dans la revue produit, puis le frame web compatible, ses états, ses largeurs Compact/Medium/Wide, ses modes Light/Dark, son comportement Glass/Solid, sa variante Reduced Motion et son parcours complet. I12–I18 ont été validés dans le navigateur et ne doivent pas être rouverts sans régression démontrée ou nouvelle décision produit.

## Politique de rupture

- Ne jamais ajouter de fallback, alias, façade de réexport, double variable d'environnement, double route, feature flag de transition ou couche de compatibilité pour maintenir le legacy.
- Supprimer ce qui est obsolète, réécrire ce qui ne respecte pas les pratiques actuelles et conserver uniquement ce qui est déjà adapté à l'architecture cible.
- Une fonctionnalité historique peut rester volontairement cassée ou être supprimée jusqu'à sa réimplémentation propre. Signaler cet état dans `docs/refactor-plan.md` et dans le compte rendu.
- Ne pas reproduire une architecture, une dépendance, un modèle React/Next.js, une règle de sécurité ou un design uniquement parce qu'il existe dans l'ancien projet.
- Toute exception de compatibilité nécessite une décision explicite du produit dans la conversation concernée.

## Architecture cible

- Le navigateur appelle exclusivement les Route Handlers Next.js `/api/*` via `shared/api/web-api-client.ts`.
- Les Route Handlers appellent FastAPI côté serveur via `shared/api/backend-api-client.ts` et `VASCO_API_URL`.
- Aucun secret, credential ou URL FastAPI interne ne doit être exposé dans une variable `NEXT_PUBLIC_*`.
- Les contrats REST `/api/v1`, les contrôles FastAPI et la documentation métier sont les sources de vérité. Les anciennes routes `xxxByUser`, `createXxx` et équivalentes ne doivent pas être conservées.

## Travail par conversation

Lire `docs/README.md`, puis `docs/refactor-plan.md`. La phase 5, I11 et les lots I0–I18 sont clôturés depuis le 19 septembre 2026 ; `docs/web-implementation-plan.md` sert d’historique vérifié. Une nouvelle conversation traite une maintenance explicitement demandée ou, sur autorisation, une tranche bornée de la phase 6 — Industrialisation. Ne pas rouvrir spontanément le cycle correctif graphique.

Dans la phase active, suivre également l’ordre des lots numérotés lorsqu’il existe. Mettre à jour les checkboxes de `docs/refactor-plan.md` et `docs/web-implementation-plan.md` immédiatement après implémentation et vérification. Les migrations restent découpées par domaine pour maîtriser le risque, mais chaque domaine est remplacé proprement sans période de coexistence avec son implémentation legacy.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
