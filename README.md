# Temprina · Site d’auteur

Site statique en français construit avec Astro et TypeScript. Il conserve l’accueil, le catalogue, les fiches livres, la présentation de l’auteur, le blog, le contact, les pages légales et la page 404. Les textes, images et fonctions existants sont conservés.

## Modifier le site

L’auteur travaille dans **`src/content/`**. Aucun fichier Astro n’est nécessaire pour modifier les textes.

| Je veux… | Fichier ou dossier |
| --- | --- |
| Changer les textes d’une page | `src/content/pages/nom-de-la-page.md` |
| Ajouter, modifier ou retirer un livre | `src/content/books/` |
| Ajouter, modifier ou retirer un article | `src/content/blog/` |
| Changer le nom, l’e-mail, les menus, le pied de page ou les libellés | `src/content/site.yaml` |
| Compléter les informations légales et les crédits | Rubrique `legal` du même fichier |
| Ajouter une couverture ou une photo | `src/assets/` |
| Remplacer le logo ou l’image de partage | `public/images/` et rubrique `images` de `site.yaml` |

Commencer par le [guide d’édition](docs/CONTENUS.md), puis le [guide Markdown](docs/MARKDOWN.md). Des [modèles prêts à copier](docs/modeles/) permettent d’ajouter un livre ou un article.

## Lancer et vérifier

Prérequis : Node.js compatible avec `package.json` (22.22 ou plus récent dans la branche 22, ou 24 et plus).

```sh
npm ci
cp .env.example .env
npm run dev
```

Ouvrir `http://localhost:4321`. Pour vérifier l’ensemble du site :

```sh
npx playwright install --with-deps chromium
npm run verify
```

`verify` enchaîne les types, le build, les tests de contenus et de liens, les tests d’édition dans une copie temporaire et les tests navigateur sur ordinateur et mobile.

## Publier et maintenir

Le déploiement habituel utilise le dépôt GitHub connecté à Cloudflare Pages, avec `npm run build` et le dossier `dist`. Voir le [guide de déploiement](docs/DEPLOIEMENT.md).

- [Édition des pages, livres, articles et images](docs/CONTENUS.md)
- [Écrire en Markdown et comprendre le YAML](docs/MARKDOWN.md)
- [Informations légales et crédits](docs/INFORMATIONS-LEGALES.md)
- [Architecture simplifiée](docs/ARCHITECTURE.md)
- [Tests et vérifications](docs/VERIFICATION.md)
- [Crédits des illustrations et polices](docs/ILLUSTRATIONS.md)

Le contact prépare un e-mail dans la messagerie du lecteur. Les contenus marqués comme démonstrations sont masqués hors mode démo. Le site actuel ne gère ni commande, ni paiement, ni compte lecteur, ni newsletter.
