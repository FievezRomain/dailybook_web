# Documentation Vasco Web

État au 19 septembre 2026 : la refonte UX/UI web, la recette I11 et le cycle correctif I12–I18 sont clôturés. `web-implementation-plan.md` constitue désormais l’historique d’exécution ; les futurs travaux relèvent de la maintenance ou de la phase 6 — Industrialisation de `refactor-plan.md`.

## Ordre de lecture produit et technique

1. [Règles métier](business-rules.md) — décisions communes à tous les clients Vasco.
2. [Architecture cible](architecture.md) — BFF Next.js, arborescence et règles de dépendance.
3. [Authentification et sécurité](authentication.md) — session, CSRF, XSS, uploads et headers.
4. [Contrat API](api-services.md) — correspondance `/api` web vers `/api/v1` FastAPI.
5. [Plan de refonte](refactor-plan.md) — phases, lots et critères de sortie.
6. [Plan d’implémentation web](web-implementation-plan.md) — backlog exécutable de la phase UX/UI, avec lots, cases à cocher et critères de sortie.
7. [Prompt de reprise](new-conversation-prompt.md) — modèle borné pour reprendre le premier lot d’implémentation encore ouvert.
8. [Mise en service](mise-en-service.md) — lancement local, image Docker, déploiement, contrôles et retour arrière.

## Refonte graphique web

Lire ces documents dans cet ordre avant de produire les maquettes ou d'implémenter un écran :

1. [Audit de l'existant](web-current-state-audit.md) — ce qui est réutilisable et ce qui doit être reconstruit.
2. [Direction UX/UI](web-design-direction.md) — personnalité, composition, responsive et tendances admises.
3. [Navigation et interactions](web-navigation-and-interactions.md) — architecture d'information, conteneurs web et parcours.
4. [Design system](web-design-system-specification.md) — tokens, composants, modes et accessibilité.
5. [Motion et matériaux](web-motion-and-materials.md) — durées, courbes, transitions, Glass et fallback Solid.
6. [Standards d'implémentation](web-ux-ui-standards.md) — règles de code et Definition of Done.
7. [Préparation et handoff Figma](web-figma-handoff.md) — structure du fichier, lots, états et annotations.
8. [Plan des maquettes Figma](web-figma-mockup-plan.md) — backlog exécutable des sources, composants, overlays et prototypes MCP.
9. [Matrice de validation des écrans](web-screen-validation.md) — couverture attendue par route, largeur et état.
10. [Revue produit visuelle du 6 septembre 2026](web-product-visual-review-2026-09-06.md) — retours post-recette, décisions prioritaires et propositions de recomposition sans modification de Figma.
11. [Matrice du cycle correctif](web-visual-correction-matrix.md) — baseline I12, preuves I13, inventaires, correspondance mobile/web et validations I12–I18.
12. [Plan d’implémentation web](web-implementation-plan.md) — ordre de réalisation I0–I18 et suivi d’avancement du code.

Ces documents définissent la cible web. Le code actuel n'est jamais une source visuelle, même en l'absence temporaire de frame Figma.

## Références d’implémentation web

- [Stack et décisions techniques](stack.md)
- [Baseline tests, performance et accessibilité](quality-baseline.md)
- [Gestion de l’état](contexts.md)
- [Composants et conventions Next.js](components-nextjs.md)
- [Thème et tokens](tailwind-colors.md)
- [Standards UX/UI web](web-ux-ui-standards.md)
- [Matrice de validation UX/UI web](web-screen-validation.md)

## Gouvernance

- Une règle métier est modifiée dans la documentation produit commune avant adaptation des clients.
- Une décision propre au navigateur est documentée ici et ne s’impose pas automatiquement au mobile.
- Toute évolution de route met à jour le contrat API, les schémas, les tests de contrat et le plan de migration concerné.
- Les documents décrivent l’architecture cible. Le plan de refonte indique ce qui reste à migrer dans le code actuel.
