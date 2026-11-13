# Architecture simplifiée

## Principe

Les contenus sont séparés de la présentation. Astro génère des fichiers HTML, CSS, JavaScript et images dans `dist/`. L’hébergement sert ces fichiers ; aucune base de données ni interface d’administration n’est nécessaire.

```text
src/content/site.yaml       → réglages communs et informations légales
src/content/pages/*.md      → textes des huit pages fixes
src/content/books/*.md      → livres et résumés
src/content/blog/*.md       → articles
src/assets/                → images optimisées par Astro
public/                    → fichiers copiés tels quels
src/pages/                 → routes et gabarits
src/components/            → éléments de présentation partagés
src/layouts/Layout.astro   → document HTML, navigation, pied de page, métadonnées
src/styles/global.css      → présentation et adaptations aux écrans
src/lib/                   → validation et accès aux contenus
```

## Où modifier le code

| Besoin | Emplacement |
| --- | --- |
| Structure de l’accueil, du catalogue ou d’une page fixe | Fichier correspondant dans `src/pages/` |
| Structure des fiches livres ou articles | `src/pages/livres/[id].astro`, `src/pages/blog/[id].astro` |
| Cartes, partage, titres, seconde histoire, logo | `src/components/` |
| Présentation des deux pages légales | `src/components/LegalPage.astro` |
| Couleurs, tailles, espacements et responsive | `src/styles/global.css` |
| Champs acceptés dans les pages, livres et articles | `src/lib/content-schema.ts` |
| Configuration commune et données légales | `src/lib/site-schema.mjs` |
| Ordre des livres/articles et sélection des contenus visibles | `src/lib/collections.ts`, avec `isVisible` dans `site.ts` |
| Métadonnées communes, variables de texte, dates et mode démo | `src/lib/site.ts` |
| Contrôle des informations avant publication | `scripts/validate-production.mjs` |

## Flux des contenus

`src/content.config.ts` déclare seulement trois collections : `pages`, `books` et `blog`. Leurs schémas sont aussi utilisés par les tests. `getPage` vérifie que la page demandée utilise le bon gabarit. `getBooks` et `getPosts` appliquent une sélection commune aux listes et aux fiches, puis trient les contenus par date ; l’accueil peut privilégier les livres mis en avant.

`site.ts` charge et valide directement l’unique fichier `src/content/site.yaml`. Les informations légales viennent de sa rubrique `legal` ; elles ne passent plus par des collections supplémentaires. `legal.ts` prépare les valeurs et liens affichés, avec les mêmes reprises de nom et d’e-mail qu’auparavant. Le contrôle de publication partage ce schéma et la règle de priorité de l’identité.

Le corps Markdown s’affiche sur chacune des huit pages. Les chaînes YAML restent échappées comme du texte. Les variables de libellé sont remplacées en une passe, y compris si les valeurs contiennent des accolades ou des dollars.

## Comportements conservés

Le site conserve les adresses des pages, les contenus, les visuels, les polices locales, les métadonnées et les données structurées. Il garde les livres minimaux/complets, séries, secondes histoires, brouillons, démonstrations, articles, portrait facultatif, partage et contact par messagerie. Lecture et navigation fonctionnent sans JavaScript. Le JavaScript sert au menu mobile, au formulaire de préparation d’e-mail et au bouton de partage natif disponible dans le navigateur.

La simplification réunit les anciens fichiers `src/content/settings/site.yaml` et `src/content/legal/site.yaml` dans `src/content/site.yaml`, avec les données légales sous `legal`. Les libellés des anciennes options de partage séparées ont été retirés. Les styles sont remis en forme pour être lisibles ; leurs valeurs et l’ordre des règles sont conservés.

## Ajouter une nouvelle fonctionnalité

Modifier le schéma seulement si de nouvelles données sont nécessaires, puis le gabarit qui les affiche. Ajouter un test du comportement réel et mettre à jour le guide d’édition. Pour une page fixe supplémentaire, créer son contenu et sa route ; un nouveau fichier dans `pages/` ne crée pas automatiquement une route.

Les fonctions d’achat, filtres, newsletter et comptes lecteurs ne font pas partie du site actuel. Le code ne contient pas de mécanisme désactivé à réactiver pour les obtenir.
