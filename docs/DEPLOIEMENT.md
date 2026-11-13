# Publier sur Cloudflare Pages

## Configuration habituelle

Le site utilise un dépôt GitHub connecté à Cloudflare Pages. L’adresse configurée par défaut est `https://donnet.pages.dev`. Cette documentation décrit le dépôt ; elle ne certifie pas l’état du compte Cloudflare.

Configurer le projet Pages avec :

| Réglage | Valeur |
| --- | --- |
| Branche de production | `master`, selon la configuration du dépôt |
| Commande de build | `npm run build` |
| Dossier publié | `dist` |
| Version de Node | Une version compatible avec `package.json`, par exemple la branche 24 |

Chaque modification de la branche connectée déclenche un build et la publication du site. Aucune clé API dans GitHub n’est nécessaire pour ce parcours.

## Variables d’environnement

Le nom, l’e-mail, les images et les textes se règlent dans `src/content/site.yaml`. Les variables techniques se renseignent dans Cloudflare ; en local, copier `.env.example` vers `.env`.

| Variable | Usage |
| --- | --- |
| `PUBLIC_SITE_URL` | Origine HTTPS définitive, sans chemin : liens canoniques, partage, sitemap |
| `PUBLIC_DEMO_MODE` | `true` pour la démo ; `false` pour masquer les exemples et autoriser l’indexation |
| `PUBLIC_CONTENT_APPROVED` | `true` après relecture, utilisé par `validate:production` |
| `PUBLIC_AUTHOR_NAME`, `PUBLIC_CONTACT_EMAIL` | Compatibilité : utilisées si les champs correspondants de `site.yaml` sont vides |

Ces variables sont publiques. Elles ne doivent contenir aucun secret. Les valeurs sont intégrées lors du build ; une modification demande une nouvelle publication.

## Passer de la démonstration au site réel

1. Renseigner l’identité et l’e-mail dans `site.yaml`.
2. Ajouter les vrais livres et articles ; conserver `demo: true` sur les exemples fictifs, qui seront masqués en production.
3. Relire les pages et compléter la rubrique `legal`, puis les deux [pages légales](INFORMATIONS-LEGALES.md).
4. Configurer l’URL réelle, `PUBLIC_DEMO_MODE=false` et `PUBLIC_CONTENT_APPROVED=true` dans l’environnement utilisé pour le contrôle et le build.
5. Exécuter `npm run validate:production` puis `npm run verify`.
6. Publier la révision contrôlée via la branche connectée.

`validate:production` vérifie les informations renseignées et les indicateurs de relecture. Le build standard accepte aussi la démonstration : l’intégration Git native ne lance que la commande configurée. Pour imposer le contrôle sur chaque build de production, utiliser `npm run validate:production && npm run build` comme commande Cloudflare et renseigner ses variables.

Après publication, vérifier quelques pages, les couvertures, le menu mobile, le contact et les adresses de partage. Le formulaire ouvre la messagerie du lecteur : son message n’est pas envoyé par le serveur du site.

## Vérifications automatiques GitHub

`.github/workflows/ci.yml` installe les dépendances et Chromium, puis exécute `npm run verify` en mode démo. Le workflow publie l’archive `dist/` comme artefact de vérification ; il ne déploie pas sur Cloudflare.

Le workflow manuel existant `.github/workflows/deploy.yml` reste disponible pour un déploiement API contrôlé. Il s’exécute sur `master` avec la confirmation `DEPLOYER`, l’environnement GitHub `production`, les variables publiques ci-dessus, `CLOUDFLARE_PROJECT_NAME` et les secrets `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID`. Il valide, teste puis publie `dist`. Choisir un seul mécanisme pour publier une même révision évite de doubler les déploiements.

## En cas d’échec

Lire le premier message d’erreur du build. Un chemin de contenu indique généralement un champ manquant, une indentation YAML incorrecte ou une image absente. Reproduire avec `npm run verify`. Si le build réussit mais les textes restent anciens, vérifier la branche et la révision effectivement publiées, ainsi que les variables Cloudflare.
