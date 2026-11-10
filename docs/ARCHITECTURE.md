# Architecture

## Deux univers

L’accueil `/` charge le contenu `portail.md`. L’ancien accueil de l’autrice, toujours alimenté par `index.md`, est à `/romans/`. Les autres routes de l’autrice sont conservées. `Layout.astro` accepte `universe: author | atelier | portal` et applique l’identité, la navigation, le favicon et les métadonnées correspondantes. `universes.css` ajoute les palettes du portail et de l’atelier sans modifier les styles elfique et or d’origine.

La collection `atelier` lit `src/content/settings/atelier.yaml`. La collection `creations` valide les réalisations couture et dessin, leurs images, leur ordre et leurs indicateurs `demo` / `draft`. Les fiches sont générées statiquement avec les mêmes règles de visibilité que les livres. Le contact de l’atelier utilise uniquement `PUBLIC_ATELIER_EMAIL` ; son message peut être copié ou préparé dans une messagerie. Voir [le guide de l’atelier](ATELIER.md), notamment la spécification de la page de mesures reportée à une étape ultérieure.

Le site utilise Astro en génération statique et TypeScript strict. Chaque route produit du HTML dans `dist/`, compatible avec Cloudflare Pages. Aucun serveur applicatif, base de données, compte visiteur ou paiement dans cette version.

- `src/content/pages/` : textes des huit pages éditoriales, en-têtes YAML et corps Markdown ; schéma par modèle dans `src/lib/page-schema.ts`, chargement typé avec `src/lib/pages.ts`.
- `src/content/settings/site.yaml` : phrase `footerTagline` sous le nom de l’auteur dans le pied de page ; collection `settings`, chaîne obligatoire non vide validée dans `src/content.config.ts`, consommée par le layout commun sur toutes les routes.
- `src/content/legal/site.yaml` : informations communes aux deux pages légales et crédit développeur facultatif ; collection `legal`, schéma partagé avec la validation de publication dans `src/lib/legal-schema.mjs`, résolution des contacts dans `src/lib/legal.ts`.
- `src/content/books/` et `src/content/blog/` : fichiers Markdown, validés par les schémas de `src/content.config.ts`.
- `src/pages/` : gabarits et routes consommant les contenus éditoriaux, fiches livres et articles générés avec `getStaticPaths()`.
- `src/layouts/Layout.astro` : navigation, pied de page, métadonnées, canonical, JSON-LD.
- `src/components/` : couvertures, logo, partage, titres éditoriaux et gabarit des pages légales réutilisables.
- `src/styles/global.css` : palette forêt/or, typographie et adaptations mobiles.
- `src/lib/site.ts` : configuration publique et règles de visibilité.
- `src/assets/` : sources des images traitées par Astro ; `public/` : logo fourni (`images/logo.png`, également utilisé comme favicon), image sociale et en-têtes Cloudflare.
- `scripts/lib/page-content.mjs` : lecture YAML/Markdown pour les contrôles de publication et les tests ; `scripts/validate-production.mjs` vérifie les contenus éditoriaux réels plutôt que les gabarits.
- `tests/` : intégrité du build, liens, métadonnées, validation de publication, édition dans une copie temporaire et scénarios navigateur.

JavaScript limité au menu mobile, au partage et à la préparation des e-mails. Les liens, articles et livres restent lisibles sans JavaScript. Le catalogue est généré en HTML statique et affiche tous les romans visibles par date de publication décroissante, sans filtres ni script dédié. Les paramètres d’URL ne modifient pas cette liste. Un état vide est affiché si aucun livre n’est publié. Le contact repose sur la messagerie du visiteur : aucun faux envoi, aucune collecte côté site. Sans adresse configurée, le formulaire n’est pas affiché.

Illustrations et couvertures optimisées par Astro en WebP ; le logo fourni est servi directement depuis `public/images/logo.png`. Images avec dimensions explicites, chargement différé hors illustration principale. Polices Cormorant Garamond et Manrope auto-hébergées via Fontsource. Sitemap généré automatiquement. Un mode démonstration applique `noindex, nofollow` et `Disallow: /` ; il ne protège pas l’accès aux pages.

## Contenus des pages

La collection `pages` utilise une union discriminée par `template` : `home`, `author`, `catalogue`, `blog`, `contact`, `legal`, `error`. Les champs requis et les jetons `{count}`, `{title}`, `{book}` sont vérifiés au build. `getPage` vérifie aussi que chaque route reçoit le modèle attendu. Les chaînes YAML sont échappées au rendu ; le Markdown des fichiers du dépôt est rendu par Astro. Aucun éditeur public ni stockage navigateur n’est ajouté : l’édition est persistée dans les fichiers versionnés.

La page auteur présente la biographie à côté de l’illustration existante, puis la présentation complète dans une colonne de lecture. Le texte est issu du document fourni ; l’accueil en reprend un extrait. Ces contenus restent visibles hors mode démo. Les livres et articles conservent leurs règles `demo`/`draft`. La bannière de démonstration précise que certains livres et articles sont fictifs.

Les pages légales portent un indicateur `approved`, faux par défaut, et une notice facultative. Le contrôle de production exige `approved: true`, aucun avis provisoire et un corps non vide, en plus des variables publiques déjà requises. Il contrôle aussi une présentation et une biographie non vides. La validation de ces indicateurs reste humaine. Le contrôle vérifie aussi le schéma et la complétude de `src/content/legal/site.yaml`. Les liens de prestataires/développeur doivent utiliser HTTP(S). Le responsable reprend l’éditeur si non précisé, les contacts reprennent l’adresse publique configurée. Les pages affichent les faits avec des listes de définitions, une date de mise à jour et des champs à compléter. Le crédit développeur est masqué sans nom et peut être affiché sur toutes les pages via `developer.showInFooter`. Les titres et libellés des groupes restent éditables dans les fichiers Markdown.

Les titres SEO des livres incluent désormais leur sous-titre (ou le tome) lorsqu’il existe, afin de distinguer notamment les trois « Le Signe du Sang » sans changer leurs titres visibles ni leurs URL.

Un livre peut contenir une deuxième histoire avec le bloc facultatif `followedBy` : titre non vide obligatoire, accroche `description` (300 caractères maximum) et résumé `summary` facultatifs. `BookFollowUp.astro` partage la mention « suivi de » entre les cartes et la fiche. Le résumé principal reste le corps Markdown ; la deuxième histoire possède sa propre section lorsqu’un texte est renseigné. Ses champs YAML sont échappés comme texte brut, avec les paragraphes du résumé séparés par des lignes vides. Les titres SEO et de partage incluent la mention, et le JSON-LD du livre décrit l’histoire via `hasPart`. Une seule route et un seul contact sont conservés pour le volume.

## Évolutions préparées, non développées

Les identifiants de livres correspondent aux noms de fichiers et doivent rester stables. Ils pourront être référencés par une bibliothèque d’exemplaires, des emprunts ou des commandes. Les champs bibliographiques facultatifs existent, mais aucun achat, inscription, compte, emprunt ou newsletter n’est implémenté.

Les filtres et la recherche textuelle sont reportés à une évolution éventuelle. Les champs facultatifs `genre` et `series` et la date obligatoire `publicationDate` des livres sont conservés pour permettre leur ajout sans migration des contenus. Les options de futurs filtres pourront être dérivées des livres visibles ; leur interface, leur logique et leurs tests seront ajoutés lorsque cette évolution sera demandée. Aucun formulaire ou script de filtrage désactivé ni index de recherche n’est conservé dans la version actuelle.

La suite devra définir séparément :

1. Newsletter : choix du prestataire, consentement, confirmation d’inscription et désinscription.
2. Bibliothèque : exemplaires physiques, lecteurs, disponibilités, durée d’emprunt et authentification.
3. Vente : formats, prix, stock, prestataire de paiement, commandes et obligations applicables.

Ces fonctions pourront être ajoutées derrière des services dédiés ou des routes serveur Astro. Elles nécessiteront une décision sur l’adaptateur Cloudflare et le stockage. Les composants de présentation et les collections existantes pourront être conservés. Aucun adaptateur serveur ni schéma de base hypothétique n’est ajouté maintenant.

## Références techniques

- [Collections de contenu Astro](https://docs.astro.build/en/guides/content-collections/)
- [Déploiement Cloudflare Pages depuis une CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)

Le choix confirmé est **Astro avec design sur mesure**, et non le thème WordPress Astra.
