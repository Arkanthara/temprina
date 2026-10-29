# Configuration et déploiement

## Si le formulaire affiche Deploy command et Preview command

Ce formulaire correspond à **Workers Builds**. Il peut aussi héberger ce site Astro statique en utilisant le fichier `wrangler.jsonc` fourni à la racine. Il n’est pas nécessaire de revenir à Pages.

| Champ en anglais | Valeur |
| --- | --- |
| **Project name** | `temprina` (doit correspondre à `name` dans `wrangler.jsonc`) |
| **Build command** | `npm run build` |
| **Deploy command** | `npx wrangler deploy` |
| **Preview command** | `npx wrangler preview` |
| **Enable preview builds** | Activer pour créer des aperçus des branches autres que la production |
| **Protect with Cloudflare Access** | Laisser désactivé pour un accès public ; l’activer pour réserver l’accès aux personnes autorisées |

Pour protéger seulement les aperçus, choisir **Previews only** dans les réglages Access ; **All traffic** protège aussi le site public et impose une authentification. Access peut demander une configuration Zero Trust.

Ajouter la variable de build `NODE_VERSION=24`. Pour la maquette actuelle, garder `PUBLIC_DEMO_MODE=true`. Après le premier déploiement, utiliser l’adresse réelle `https://temprina.<sous-domaine-du-compte>.workers.dev` affichée par Cloudflare comme `PUBLIC_SITE_URL`, puis reconstruire le site. Une adresse `pages.dev` appartient à Pages et ne convient pas à ce déploiement Workers.

Pousser `wrangler.jsonc` avec les changements du site sur GitHub avant le déploiement. La branche de production reste `master`, qui doit contenir la version souhaitée. Les aperçus peuvent ensuite suivre `develop`. Aucun déploiement distant n’a été effectué depuis cet environnement.

Références : [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), [Aperçus par branche](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/), [Cloudflare Access](https://developers.cloudflare.com/workers/configuration/cloudflare-access/).

## En local

Prérequis : Node.js 22.22 ou ultérieur dans la branche 22, ou Node.js 24+, npm. La CI utilise Node 22 et le DevContainer utilise Node 24.

```sh
npm ci
cp .env.example .env
npm run dev
```

Ouvrir `http://localhost:4321`. Dans VS Code, « Dev Containers: Reopen in Container » installe les dépendances et Chromium ; le port 4321 est transféré.

```sh
npm run check
npm run build
npm test
npx playwright install --with-deps chromium
npm run test:e2e
```

Sur un environnement où le répertoire de configuration utilisateur est en lecture seule, préfixer les commandes Astro avec `ASTRO_TELEMETRY_DISABLED=1`. Un build local utilise `.env`. Le script `validate:production` lit l’environnement du processus ; pour lui charger `.env` avec Node 22 ou 24, utiliser `node --env-file=.env scripts/validate-production.mjs`.

## Méthode recommandée : connecter GitHub à Cloudflare Pages

Pour ce site Astro statique, la méthode la plus simple est la connexion Git native de Cloudflare Pages. Cloudflare récupère le code sur GitHub, installe les dépendances, construit le site et le publie. Aucun jeton API Cloudflare ni workflow de déploiement GitHub Actions n’est nécessaire.

L’ancienne procédure utilisait **Direct Upload** et un workflow manuel pour imposer une approbation à chaque publication. Ce choix ajoutait des étapes ; il n’est pas nécessaire à l’hébergement du site. Avec la connexion Git, une mise à jour de `master` déclenche une publication automatiquement.

### 1. Préparer le dépôt GitHub

Le dépôt configuré localement est [Arkanthara/temprina](https://github.com/Arkanthara/temprina). Le travail se trouve sur `develop` ; `master` est la branche destinée au site public. Lors de la vérification locale du 28 octobre 2026, `master` contenait seulement le commit initial. Avant le premier déploiement, pousser les changements souhaités sur GitHub puis fusionner `develop` vers `master`, par exemple avec une pull request GitHub (**base: master**, **compare: develop**).

### 2. Connecter Cloudflare au dépôt

Dans [le tableau de bord Cloudflare](https://dash.cloudflare.com/), interface en anglais :

1. Ouvrir **Workers & Pages**.
2. Cliquer sur **Create application**, puis **Pages**.
3. Choisir **Connect to Git** ou **Import an existing Git repository**, selon l’écran affiché.
4. Choisir **GitHub**. Si demandé, autoriser l’application **Cloudflare Workers and Pages**, sélectionner **Only select repositories**, puis `Arkanthara/temprina` et **Install & Authorize**.
5. Sélectionner `temprina`, puis **Begin setup**.
6. Remplir **Set up builds and deployments** :

| Champ en anglais | Valeur pour ce projet |
| --- | --- |
| **Project name** | `temprina`, si disponible ; sinon choisir un autre nom |
| **Production branch** | `master` |
| **Framework preset** | `Astro` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory (advanced)** | Laisser vide : le projet est à la racine du dépôt |

Si l’écran demande une **Deploy command** comme `npx wrangler deploy`, il s’agit du formulaire Workers : utiliser les valeurs du premier tableau de ce guide pour continuer sur cet écran, ou choisir **Pages** pour suivre cette section.

Si un projet **Direct Upload** existe déjà, créer un nouveau projet Pages connecté à GitHub : un projet Direct Upload ne peut pas être converti en projet Git. Conserver l’ancien le temps de vérifier le nouveau.

### 3. Ajouter les variables avant de publier

Dans **Environment variables (advanced)**, ajouter les valeurs suivantes. Elles se configurent dans Cloudflare ; le fichier local `.env` et les variables GitHub Actions ne sont pas transférés automatiquement.

Pour un premier déploiement de la maquette actuelle :

| Variable | Valeur |
| --- | --- |
| `NODE_VERSION` | `24` |
| `PUBLIC_SITE_URL` | `https://temprina.pages.dev`, à adapter au **Project name** choisi |
| `PUBLIC_DEMO_MODE` | `true` |
| `PUBLIC_AUTHOR_NAME` | Nom de l’auteur, s’il est prêt ; sinon omettre pour garder le texte actuel |
| `PUBLIC_CONTACT_EMAIL` | Adresse publique de contact, si elle est prête ; sinon omettre |

`NODE_VERSION=24` respecte la version requise par le projet. `PUBLIC_SITE_URL` sert aux liens canoniques et au sitemap ; cette variable ne réserve pas de domaine. Le mode démo conserve les romans et articles d’exemple et demande aux moteurs de recherche de ne pas indexer le site. L’URL reste publique.

Cliquer sur **Save and Deploy** : cette action publie le site. Quand le déploiement réussit, ouvrir l’adresse `https://<project-name>.pages.dev` indiquée par Cloudflare.

Pour modifier les variables ensuite, ouvrir le projet, puis **Settings > Environment variables** (ou **Variables and Secrets**, selon l’interface) et sélectionner **Production** ou **Preview**. Pour les aperçus de `develop`, conserver `PUBLIC_DEMO_MODE=true` et `NODE_VERSION=24`. Toute modification de variable nécessite un nouveau build, via un nouveau commit ou **Retry deployment** dans les détails du déploiement.

### 4. Publier les prochaines modifications

1. Modifier le site sur `develop` et pousser les changements sur GitHub : Cloudflare peut créer une URL d’aperçu pour cette branche.
2. Vérifier l’aperçu, puis fusionner la pull request vers `master`.
3. Cloudflare reconstruit et publie automatiquement le site public.

La fusion vers `master` devient donc le geste de publication. Le workflow GitHub **Build et tests** reste utile pour les vérifications. Cloudflare lance son propre build sans attendre le résultat de ce workflow ; pour rendre les tests obligatoires avant publication, protéger `master` dans GitHub avec le contrôle **Build et tests / check** et passer par des pull requests.

Ne pas lancer le workflow historique **Déploiement approuvé** en parallèle de cette méthode. Il reste dans le dépôt comme alternative manuelle et ne se déclenche pas automatiquement.

### 5. Ajouter son domaine et quitter le mode démo

Pour un domaine personnel, ouvrir le projet Pages, puis **Custom domains > Set up a domain**, saisir le domaine et suivre les instructions DNS. Un domaine racine, comme `votre-domaine.fr`, doit utiliser les serveurs de noms Cloudflare ; un sous-domaine peut utiliser un CNAME chez un autre fournisseur DNS.

Quand le domaine fonctionne, définir `PUBLIC_SITE_URL` sur son origine HTTPS, sans chemin, puis reconstruire le site.

La version actuelle contient encore une biographie et des pages légales préparatoires. Pour passer à la version définitive, remplacer ces textes et ajouter les vrais contenus avec `demo: false`. Dans les variables Cloudflare **Production**, définir le vrai nom et l’adresse de contact, `PUBLIC_DEMO_MODE=false` et `PUBLIC_CONTENT_APPROVED=true` après relecture. Les contenus marqués `demo: true` disparaissent quand le mode démo est désactivé.

Pour conserver le contrôle de préparation de la production avec la connexion Git, remplacer alors **Build command** par :

```sh
npm run validate:production && npm run build
```

Ce contrôle refuse les coordonnées manquantes et les textes préparatoires encore détectés. La commande simple `npm run build` ne lance pas cette validation. Si les branches d’aperçu restent en mode démo, réserver la validation à `master`, avec cette commande de build :

```sh
if [ "$CF_PAGES_BRANCH" = "master" ]; then npm run validate:production; fi && npm run build
```

## Avant la publication de la version définitive

- Remplacer les coordonnées, la biographie et les pages légales préparatoires.
- Ajouter les vrais romans et articles, avec `demo: false`, puis relire le rendu.
- Confirmer les droits sur les couvertures et les crédits.
- Vérifier le domaine, la messagerie sur un appareil réel et les aperçus sociaux.
- Exécuter la validation et les tests ; examiner la révision avant de la fusionner vers `master`.

Pour vérifier localement le contact configuré : renseigner une adresse dans `.env`, construire avec `PUBLIC_DEMO_MODE=false`, puis lancer `PUBLIC_DEMO_MODE=false PUBLIC_CONTACT_EMAIL=adresse-configuree npx playwright test tests/browser/production.spec.ts`. Les tests complets de démonstration supposent, eux, `PUBLIC_DEMO_MODE=true` et une adresse vide.

## Retour arrière

Conserver les déploiements précédents dans Cloudflare Pages. Réactiver une version précédente dans Cloudflare, ou annuler le commit concerné dans GitHub et pousser la correction sur `master` pour déclencher un nouveau déploiement. Les URL des livres doivent rester stables ; ajouter un fichier `public/_redirects` si des changements d’URL deviennent nécessaires.

## Alternative : ancien déploiement manuel

À utiliser uniquement si une approbation séparée de la fusion Git est souhaitée. Le workflow `.github/workflows/deploy.yml` utilise un projet Pages Direct Upload, les secrets GitHub `CLOUDFLARE_API_TOKEN` (Pages Edit) et `CLOUDFLARE_ACCOUNT_ID`, et les variables `CLOUDFLARE_PROJECT_NAME`, `PUBLIC_SITE_URL`, `PUBLIC_AUTHOR_NAME`, `PUBLIC_CONTACT_EMAIL`, `PUBLIC_CONTENT_APPROVED`, dans l’environnement GitHub `production`. Il fixe lui-même `PUBLIC_DEMO_MODE=false`.

Le lancement se fait dans **Actions > Déploiement approuvé > Run workflow**, sur `master`, avec la confirmation `DEPLOYER`. Une protection **Required reviewers** de l’environnement `production` peut ajouter une approbation si elle est disponible et configurée. Le workflow valide la production, vérifie TypeScript, construit le site, exécute les tests et téléverse `dist/` via Wrangler. Cette alternative demande davantage de configuration que la connexion Git native.

Références officielles : [Connexion Git](https://developers.cloudflare.com/pages/get-started/git-integration/), [Astro sur Pages](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/), [Version de Node](https://developers.cloudflare.com/pages/configuration/build-image/), [Variables de build](https://developers.cloudflare.com/pages/configuration/build-configuration/), [Domaines personnalisés](https://developers.cloudflare.com/pages/configuration/custom-domains/), [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/), [Commande selon la branche](https://developers.cloudflare.com/pages/how-to/build-commands-branches/).
