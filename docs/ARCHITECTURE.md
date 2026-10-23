# Architecture

Le site utilise Astro en génération statique et TypeScript strict. Chaque route produit du HTML dans `dist/`, compatible avec Cloudflare Pages. Aucun serveur applicatif, base de données, compte visiteur ou paiement dans cette version.

- `src/content/books/` et `src/content/blog/` : fichiers Markdown, validés par les schémas de `src/content.config.ts`.
- `src/pages/` : routes, fiches livres et articles générés avec `getStaticPaths()`.
- `src/layouts/Layout.astro` : navigation, pied de page, métadonnées, canonical, JSON-LD.
- `src/components/` : couvertures, logo de l’auteur et partage réutilisables.
- `src/styles/global.css` : palette forêt/or, typographie et adaptations mobiles.
- `src/lib/site.ts` : configuration publique et règles de visibilité.
- `src/assets/` : sources des images traitées par Astro ; `public/` : logo fourni (`images/logo.png`, également utilisé comme favicon), image sociale et en-têtes Cloudflare.
- `tests/` : intégrité du build, liens, métadonnées et scénarios navigateur.

JavaScript limité au menu mobile, au partage et à la préparation des e-mails. Les liens, articles et livres restent lisibles sans JavaScript. Le catalogue est généré en HTML statique et affiche tous les romans visibles par date de publication décroissante, sans filtres ni script dédié. Les paramètres d’URL ne modifient pas cette liste. Un état vide est affiché si aucun livre n’est publié. Le contact repose sur la messagerie du visiteur : aucun faux envoi, aucune collecte côté site. Sans adresse configurée, le formulaire n’est pas affiché.

Illustrations et couvertures optimisées par Astro en WebP ; le logo fourni est servi directement depuis `public/images/logo.png`. Images avec dimensions explicites, chargement différé hors illustration principale. Polices Cormorant Garamond et Manrope auto-hébergées via Fontsource. Sitemap généré automatiquement. Un mode démonstration applique `noindex, nofollow` et `Disallow: /` ; il ne protège pas l’accès aux pages.

## Évolutions préparées, non développées

Les identifiants de livres correspondent aux noms de fichiers et doivent rester stables. Ils pourront être référencés par une bibliothèque d’exemplaires, des emprunts ou des commandes. Les champs bibliographiques facultatifs existent, mais aucun achat, inscription, compte, emprunt ou newsletter n’est implémenté.

Les filtres et la recherche textuelle sont reportés à une évolution éventuelle. Les champs `genre`, `series` et `publicationDate` des collections sont conservés pour permettre leur ajout sans migration des contenus. Les options de futurs filtres pourront être dérivées des livres visibles ; leur interface, leur logique et leurs tests seront ajoutés lorsque cette évolution sera demandée. Aucun formulaire ou script de filtrage désactivé ni index de recherche n’est conservé dans la version actuelle.

La suite devra définir séparément :

1. Newsletter : choix du prestataire, consentement, confirmation d’inscription et désinscription.
2. Bibliothèque : exemplaires physiques, lecteurs, disponibilités, durée d’emprunt et authentification.
3. Vente : formats, prix, stock, prestataire de paiement, commandes et obligations applicables.

Ces fonctions pourront être ajoutées derrière des services dédiés ou des routes serveur Astro. Elles nécessiteront une décision sur l’adaptateur Cloudflare et le stockage. Les composants de présentation et les collections existantes pourront être conservés. Aucun adaptateur serveur ni schéma de base hypothétique n’est ajouté maintenant.

## Références techniques

- [Collections de contenu Astro](https://docs.astro.build/en/guides/content-collections/)
- [Déploiement Cloudflare Pages depuis une CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)

Le choix confirmé est **Astro avec design sur mesure**, et non le thème WordPress Astra.
