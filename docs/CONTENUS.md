# Gestion des contenus

## Configuration globale

Copier `.env.example` en `.env` pour le développement. Définir le nom dans `PUBLIC_AUTHOR_NAME`, l’adresse dans `PUBLIC_CONTACT_EMAIL` et l’origine canonique dans `PUBLIC_SITE_URL`. Les variables `PUBLIC_*` deviennent publiques dans le site statique : elles ne doivent jamais contenir de secrets. Reconstruire après chaque changement.

Le logo de l’auteur est fourni dans `public/images/logo.png`. Pour le changer, remplacer ce fichier en conservant une image carrée et transparente ; adapter les dimensions intrinsèques de `src/components/Logo.astro` si nécessaire. Ce composant est utilisé dans l’en-tête, le pied de page et l’accueil ; le même fichier sert de favicon.

Remplacer la présentation de `src/pages/auteur.astro`. Les pages de mentions légales et de confidentialité sont des textes préparatoires à compléter selon l’identité et la situation réelles, puis à faire valider. Aucun parcours ni portrait personnel n’a été inventé.

## Ajouter un roman

Créer `src/content/books/un-nouveau-roman.md` et placer sa couverture dans `src/assets/`. Préférer une image d’au moins 600 × 900 pixels, ratio 2:3, aux droits vérifiés.

Seuls `title`, `publicationDate` et `cover` sont obligatoires. Exemple minimal (le corps Markdown est lui aussi facultatif) :

```yaml
---
title: "Un nouveau roman"
publicationDate: 2026-10-22
cover: ../../assets/un-nouveau-roman.jpg
---
```

Exemple enrichi :

```yaml
---
title: "Un nouveau roman"
subtitle: "Sous-titre facultatif"
description: "Un résumé court de 300 caractères maximum."
genre: "Fantasy"
series: "Les Chroniques de la forêt"
volume: 1
publicationDate: 2026-10-22
cover: ../../assets/un-nouveau-roman.jpg
coverAlt: "Couverture de Un nouveau roman : description visuelle concise."
featured: true
draft: false
demo: false
publisher: "Nom de l’éditeur"
isbn: "9780000000002"
formats: ["Broché", "Numérique"]
purchaseLinks:
  - label: "Librairie"
    url: https://example.com/un-nouveau-roman/
---
Le résumé complet, en **Markdown**, commence ici.
```

`subtitle`, `description`, `genre`, `series`, `volume` et `coverAlt` sont facultatifs. Les textes sont nettoyés de leurs espaces de début et de fin ; un texte vide est traité comme absent au rendu. `volume`, s’il est fourni, reste un entier strictement positif. Aucune série « Hors série » n’est ajoutée automatiquement : écrire ce libellé explicitement si souhaité.

Les cartes de l’accueil et du catalogue affichent le sous-titre, la série, le tome et la description seulement lorsqu’ils sont renseignés. Le genre précède l’année uniquement lorsqu’il existe. Série et tome peuvent être fournis indépendamment, sans séparateur superflu. La fiche suit la même règle pour son en-tête et ses informations, avec une date de publication toujours visible ; le résumé court et le corps Markdown apparaissent s’ils existent.

Sans `coverAlt` ou avec une valeur vide, le texte alternatif devient « Couverture de [titre] ». Sans description, les métadonnées SEO et de partage utilisent une phrase construite avec le titre, le nom de l’auteur et la date ; le JSON-LD omet la description et le genre absents.

La démonstration comprend **La Dernière Braise**, avec exactement les trois champs requis et sans corps Markdown, et **Le Chant des Sylves**, avec tous les champs du schéma renseignés. Le premier hérite notamment de `demo: true`, `draft: false` et `featured: false`.

La fiche apparaît à `/livres/un-nouveau-roman/`. Le catalogue, les données structurées et le sitemap se mettent à jour au build. Sur l’accueil, les romans `featured: true` passent en premier, puis les plus récents, avec un maximum de trois.

Pour une série, indiquer le même libellé `series` sur ses tomes et ajouter `volume: 1`. La date `publicationDate` détermine l’ordre du catalogue, du plus récent au plus ancien. Le nom de fichier sert d’identifiant : le conserver après publication, ou prévoir une redirection Cloudflare en cas de changement.

Champs réservés facultatifs : `publisher`, `isbn`, `formats` (liste) et `purchaseLinks` (liste d’objets `label`, `url`). Ils n’ajoutent pas de bouton d’achat ; `publisher` et `isbn`, lorsqu’ils existent, enrichissent déjà le JSON-LD. Les interfaces correspondantes restent à décider pour la suite.

## Catalogue et filtres éventuels

Le catalogue affiche tous les romans visibles, triés par date de publication décroissante. Il ne propose ni filtres ni recherche textuelle et fonctionne sans JavaScript. Les anciens paramètres d’URL (`genre`, `series`, `year`) sont sans effet sur les livres affichés.

Les champs facultatifs `genre` et `series` et la date obligatoire `publicationDate` restent disponibles dans le schéma des livres. Ils servent aux informations affichées et permettront d’ajouter des filtres ultérieurement sans migrer les contenus. Aucun composant de filtrage ni code de filtrage désactivé n’est conservé.

Si cette évolution est retenue, les options pourront être déduites des romans visibles. Il faudra alors ajouter les contrôles accessibles, la logique de sélection, l’état sans résultat et leurs tests, puis documenter le comportement des URL. Aucun réglage n’est nécessaire aujourd’hui pour l’ajout d’un livre.

## Ajouter un article

Créer `src/content/blog/mon-article.md` :

```yaml
---
title: "Le titre de l’article"
description: "Présentation courte, 300 caractères maximum."
date: 2026-10-22
category: "Notes de lecture"
readingMinutes: 4
draft: false
demo: false
---
L’introduction.

## Un premier intertitre

Votre commentaire ou analyse. Identifier précisément l’ouvrage commenté,
signaler les révélations éventuelles et respecter les droits de citation.
```

Les articles sont triés du plus récent au plus ancien. La date sert au classement, pas à une publication programmée : utiliser `draft: true` jusqu’au moment voulu. Relever les temps de lecture après rédaction.

## Démonstration et brouillons

- `demo: true` est la valeur par défaut : écrire explicitement `demo: false` pour un contenu réel.
- `draft: true` exclut le contenu de toutes les pages et de ses routes.
- `PUBLIC_DEMO_MODE=true` rend les contenus fictifs visibles et désactive l’indexation.
- `PUBLIC_DEMO_MODE=false` exclut tous les contenus fictifs, même si les fichiers restent dans le dépôt.
- Ne pas transformer les exemples en ouvrages réels en changeant simplement leur drapeau. Les remplacer par les vrais textes, dates et couvertures.

## Vérifier

`npm run check && npm run build && npm test` vérifie schémas, types, génération, liens et métadonnées. `npm run dev` permet de relire les contenus. Les tests du build et du navigateur couvrent les exemples minimal et complet, le texte alternatif de secours et les éléments conditionnels. Le nombre attendu de livres dans le navigateur est déduit du build, pour inclure les ajouts de contenu. Adapter les assertions si les exemples de démonstration sont volontairement modifiés.

Les boutons de partage utilisent l’origine `PUBLIC_SITE_URL`. En local, `example.com` est un placeholder : les aperçus sur les réseaux ne pourront être vérifiés qu’après configuration d’une vraie URL accessible.
