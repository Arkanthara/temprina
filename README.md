# Temprina · Site d’auteur

Première version d’un site français de romans, avec un univers féérique et elfique. **Astro + TypeScript**, génération statique pour **Cloudflare Pages**, dépôt GitHub et DevContainer.

Le nom de l’auteur reste à renseigner. Les romans de démonstration, leurs couvertures et deux articles sont des exemples fictifs clairement signalés. Aucune vente directe. La méthode de déploiement recommandée est la connexion GitHub à Cloudflare Pages : chaque mise à jour de `master` publie le site. Aucun déploiement n’a été réalisé depuis cet environnement.

```sh
npm ci
cp .env.example .env
npm run dev
```

Le site est disponible à `http://localhost:4321`.

Pages : accueil, catalogue de romans, fiches livres avec partage, auteur, blog « Au coin du feu », articles, contact, mentions légales, confidentialité et 404.

```sh
npm run check
npm run build
npm test
npx playwright install --with-deps chromium
npm run test:e2e
```

- [Architecture et évolutions prévues](docs/ARCHITECTURE.md)
- [Ajouter et modifier les contenus](docs/CONTENUS.md)
- [Déployer simplement sur Cloudflare avec GitHub (interface en anglais)](docs/DEPLOIEMENT.md)
- [Crédits des illustrations](docs/ILLUSTRATIONS.md)
- [Vérifications et aperçus](docs/VERIFICATION.md)

Pour la connexion Git native, les variables de build se renseignent dans Cloudflare Pages ; aucun jeton API à gérer dans GitHub. Les variables publiques sont documentées dans `.env.example`. Le mode démo désactive l’indexation. Sans adresse configurée, le contact affiche son indisponibilité ; une fois l’adresse renseignée, il prépare un e-mail dans la messagerie du visiteur.

Pour un livre, seuls `title`, `publicationDate` et `cover` sont obligatoires. Le rendu s’adapte aux champs renseignés ; la démo inclut un livre minimal et un livre complet (voir [la gestion des contenus](docs/CONTENUS.md)).

Le catalogue affiche tous les romans publiés, du plus récent au plus ancien, avec ou sans JavaScript. Les filtres et la recherche textuelle sont des évolutions possibles ; les champs genre, série et date de publication sont conservés dans les contenus pour permettre leur ajout ultérieur.

Le logo de l’auteur (`public/images/logo.png`) est utilisé dans l’en-tête, le pied de page, l’accueil et comme favicon.

Les intégrations newsletter, bibliothèque et achat ne sont pas implémentées dans cette version.
