# Gestion des contenus

## Configuration globale

Copier `.env.example` en `.env` pour le développement. Définir le nom dans `PUBLIC_AUTHOR_NAME`, l’adresse dans `PUBLIC_CONTACT_EMAIL` et l’origine canonique dans `PUBLIC_SITE_URL`. Les variables `PUBLIC_*` deviennent publiques dans le site statique : elles ne doivent jamais contenir de secrets. Reconstruire après chaque changement.

Remplacer la présentation de `src/pages/auteur.astro`. Les pages de mentions légales et de confidentialité sont des textes préparatoires à compléter selon l’identité et la situation réelles, puis à faire valider. Aucun parcours ni portrait personnel n’a été inventé.

## Ajouter un roman

Créer `src/content/books/un-nouveau-roman.md` et placer sa couverture dans `src/assets/`. Préférer une image d’au moins 600 × 900 pixels, ratio 2:3, aux droits vérifiés.

```yaml
---
title: "Un nouveau roman"
subtitle: "Sous-titre facultatif"
description: "Un résumé court de 300 caractères maximum."
genre: "Fantasy"
series: "Hors série"
publicationDate: 2026-10-22
cover: ../../assets/un-nouveau-roman.jpg
coverAlt: "Couverture de Un nouveau roman : description visuelle concise."
featured: true
draft: false
demo: false
---
Le résumé complet, en **Markdown**, commence ici.
```

La fiche apparaît à `/livres/un-nouveau-roman/`. Le catalogue, ses filtres, les données structurées et le sitemap se mettent à jour au build. Sur l’accueil, les romans `featured: true` passent en premier, puis les plus récents, avec un maximum de trois.

Pour une série, indiquer le même libellé `series` sur ses tomes et ajouter `volume: 1`. L’année du filtre est calculée depuis `publicationDate`. Le nom de fichier sert d’identifiant : le conserver après publication, ou prévoir une redirection Cloudflare en cas de changement.

Champs réservés facultatifs : `publisher`, `isbn`, `formats` (liste) et `purchaseLinks` (liste d’objets `label`, `url`). Ils n’ajoutent pas de bouton d’achat ; `publisher` et `isbn`, lorsqu’ils existent, enrichissent déjà le JSON-LD. Les interfaces correspondantes restent à décider pour la suite.

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

`npm run check && npm run build && npm test` vérifie schémas, types, génération, liens et métadonnées. `npm run dev` permet de relire les contenus. Les tests de démonstration dans `tests/browser/site.spec.ts` attendent les trois romans initiaux ; les adapter si le jeu de démonstration est volontairement modifié.

Les boutons de partage utilisent l’origine `PUBLIC_SITE_URL`. En local, `example.com` est un placeholder : les aperçus sur les réseaux ne pourront être vérifiés qu’après configuration d’une vraie URL accessible.
