# Temprina · Site d’auteur

Première version d’un site français de romans, avec un univers féérique et elfique. **Astro + TypeScript**, génération statique pour **Cloudflare Pages**, dépôt GitHub et DevContainer.

Le nom de l’auteur reste à renseigner. Trois romans, leurs couvertures et deux articles sont des exemples fictifs clairement signalés. Aucune vente directe. La mise en production attend une validation manuelle ; aucun déploiement n’a été réalisé.

```sh
npm ci
cp .env.example .env
npm run dev
```

Le site est disponible à `http://localhost:4321`.

Pages : accueil, catalogue filtrable, fiches livres avec partage, auteur, blog « Au coin du feu », articles, contact, mentions légales, confidentialité et 404.

```sh
npm run check
npm run build
npm test
npx playwright install --with-deps chromium
npm run test:e2e
```

- [Architecture et évolutions prévues](docs/ARCHITECTURE.md)
- [Ajouter et modifier les contenus](docs/CONTENUS.md)
- [Configuration, GitHub Actions et déploiement Cloudflare](docs/DEPLOIEMENT.md)
- [Crédits des illustrations](docs/ILLUSTRATIONS.md)
- [Vérifications et aperçus](docs/VERIFICATION.md)

Les configurations sensibles passent par les secrets de l’environnement GitHub `production`. Les variables publiques sont documentées dans `.env.example`. Le mode démo désactive l’indexation. Sans adresse configurée, le contact affiche son indisponibilité ; une fois l’adresse renseignée, il prépare un e-mail dans la messagerie du visiteur.

Les intégrations newsletter, bibliothèque et achat ne sont pas implémentées dans cette version.
