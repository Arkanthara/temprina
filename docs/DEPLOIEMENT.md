# Configuration et déploiement

## En local

Prérequis : Node.js 22.12 ou ultérieur dans la branche 22, npm. La CI et le DevContainer utilisent Node 22.

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

Sur un environnement où le répertoire de configuration utilisateur est en lecture seule, préfixer les commandes Astro avec `ASTRO_TELEMETRY_DISABLED=1`. Un build local utilise `.env`. Le script `validate:production` lit l’environnement du processus ; pour lui charger `.env` avec Node 22, utiliser `node --env-file=.env scripts/validate-production.mjs`.

## GitHub et Cloudflare

Le checkout est associé à `git@github.com:Arkanthara/temprina.git`, sur la branche locale `develop`. Les fichiers de cette livraison sont locaux : aucun push ni réglage distant n’a été effectué. Commiter et pousser les fichiers dans ce dépôt pour activer les workflows. La CI contrôle `develop`, `master` et les pull requests. La production cible `master` : fusionner la version validée vers cette branche. Protéger `master` avec le contrôle `Build et tests / check` si souhaité.

1. Créer dans Cloudflare un projet **Pages Direct Upload**, avec `master` comme branche de production. Ne pas activer un déploiement Git automatique, afin de respecter la validation manuelle.
2. Dans GitHub, créer l’environnement `production`. Configurer les personnes autorisées à approuver les déploiements avec **Required reviewers** lorsque cette protection est disponible sur le dépôt. Limiter cet environnement à `master`.
3. Ajouter à cet environnement les secrets `CLOUDFLARE_API_TOKEN` (autorisation minimale Cloudflare Pages Edit pour le compte concerné) et `CLOUDFLARE_ACCOUNT_ID`. Ne jamais les commiter ni les transmettre dans une conversation.
4. Définir les variables d’environnement GitHub :

| Variable | Valeur |
| --- | --- |
| `CLOUDFLARE_PROJECT_NAME` | Nom exact du projet Pages |
| `PUBLIC_SITE_URL` | Origine HTTPS canonique, sans chemin, ex. `https://votre-domaine.fr` |
| `PUBLIC_AUTHOR_NAME` | Nom définitif de l’auteur |
| `PUBLIC_CONTACT_EMAIL` | Adresse publique de contact |
| `PUBLIC_CONTENT_APPROVED` | `true` uniquement après revue des contenus et pages légales |

Le workflow de production fixe lui-même `PUBLIC_DEMO_MODE=false`. Renseigner le domaine dans Cloudflare, vérifier son certificat HTTPS et l’utiliser comme URL canonique.

## Validation manuelle obligatoire

Une fusion sur `master` lance uniquement **Build et tests**. Elle ne déclenche aucun déploiement. Le workflow **Déploiement approuvé** est disponible uniquement via `workflow_dispatch` : depuis l’onglet Actions, sélectionner `master`, revoir la révision à publier, saisir `DEPLOYER`, puis approuver l’environnement `production` si sa protection a été configurée.

Le workflow vérifie les variables, bloque les textes préparatoires de l’auteur et des pages légales, vérifie TypeScript, construit les pages, teste les liens et l’affichage de production, puis téléverse exactement `dist/` vers Cloudflare Pages. Le verrou de concurrence évite deux publications simultanées.

L’approbation d’environnement est un réglage GitHub distant : sa présence n’est pas garantie par les fichiers YAML. La saisie manuelle reste obligatoire dans tous les cas ; les responsables du dépôt doivent restreindre les personnes disposant du droit de lancer un workflow.

## Avant la première publication

- Remplacer les coordonnées, la biographie et les pages légales préparatoires.
- Ajouter les vrais romans et articles, avec `demo: false`, puis relire le rendu.
- Confirmer les droits sur les couvertures et les crédits.
- Vérifier le domaine, la messagerie sur un appareil réel et les aperçus sociaux.
- Exécuter la validation et les tests ; examiner la révision et autoriser son déploiement.

Pour vérifier localement le contact configuré : renseigner une adresse dans `.env`, construire avec `PUBLIC_DEMO_MODE=false`, puis lancer `PUBLIC_DEMO_MODE=false PUBLIC_CONTACT_EMAIL=adresse-configuree npx playwright test tests/browser/production.spec.ts`. Les tests complets de démonstration supposent, eux, `PUBLIC_DEMO_MODE=true` et une adresse vide.

## Retour arrière

Conserver les déploiements précédents dans Cloudflare Pages. Après validation, réactiver une version précédente dans Cloudflare, ou rétablir un commit dans GitHub puis relancer manuellement le workflow approuvé. Les URL des livres doivent rester stables ; ajouter un fichier `public/_redirects` si des changements d’URL deviennent nécessaires.

Référence : [Cloudflare — Direct Upload avec intégration continue](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/).
