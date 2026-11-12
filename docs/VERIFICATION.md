# Vérifier le site

## Une commande complète

```sh
npm ci
npx playwright install --with-deps chromium
npm run verify
```

`verify` exécute les contrôles ci-dessous dans l’ordre. Chromium doit être installé une seule fois par environnement. La CI et le DevContainer le préparent automatiquement.

| Commande | Ce qu’elle contrôle |
| --- | --- |
| `npm run check` | Types et diagnostics Astro |
| `npm run build` | Schémas, fichiers image, génération des pages et sitemap |
| `npm test` | Contenus, champs requis, identité, informations légales, rendu HTML, liens, ancres et métadonnées |
| `npm run test:editing` | Modification des huit pages et des réglages, ajout/retrait de contenus, brouillons, portrait, seconde histoire et refus d’un contenu invalide |
| `npm run test:e2e` | Navigation, contact, partage, images, responsive et accessibilité automatisée dans Chromium |

Les tests HTML et navigateur lisent `dist/` : exécuter le build après un changement avant de les lancer seuls. Le serveur d’aperçu des tests utilise le port 4321 ; arrêter un éventuel serveur local sur ce port pour tester le build voulu.

## Ce que les tests garantissent

Les attentes utilisent les contenus réels et les pages générées. Il n’est pas nécessaire de modifier les tests pour changer un titre, le nombre de livres ou la navigation. Les livres de démonstration ne sont plus nécessaires aux scénarios navigateur.

Le test d’édition travaille dans une copie temporaire sans `.env`. Il modifie tous les corps Markdown, vérifie notamment le gras et l’italique, ajoute un livre et un article, supprime des contenus et masque un brouillon. Il vérifie les réglages communs, le portrait, les deux histoires sous une couverture et l’affichage littéral des chaînes YAML contenant des caractères HTML. Il effectue trois builds, dont un volontairement invalide ; les variantes invalides des schémas sont testées directement, sans reconstruire le site à chaque fois. Les fichiers et le build de travail restent intacts.

La même suite navigateur s’adapte à l’e-mail configuré ou absent et à la présence de contenus de démonstration. Elle parcourt toutes les routes générées sur ordinateur et mobile, puis sans JavaScript à 320 pixels. L’audit axe couvre les règles WCAG A/AA sélectionnées. Il ne remplace pas une relecture manuelle ou un essai avec lecteur d’écran.

## Contrôle avant publication

`npm run validate:production` contrôle les variables de publication, l’identité, les informations légales et les marqueurs de relecture. Les pages légales doivent avoir `approved: true`, un texte renseigné et aucune notice provisoire. Ce contrôle utilise le même schéma de configuration que le site.

Pour tester le rendu hors démonstration, définir `PUBLIC_DEMO_MODE=false` et reconstruire, puis relancer les tests. Un e-mail temporaire peut servir à vérifier le formulaire sans envoyer de message. Remettre les variables habituelles et reconstruire après cet essai.

## État de la simplification — 12 novembre 2026

Vérifications exécutées sur Node.js 22.23.1 et Chromium via Playwright :

| Contrôle | Résultat |
| --- | --- |
| `npm run verify` | Réussi dans son intégralité |
| Diagnostics Astro/TypeScript | Aucun diagnostic |
| Build de démonstration | 23 pages HTML |
| Tests de contenus et du HTML | 18 réussis, dont les valeurs par défaut de `demo` pour les livres et articles |
| Test d’édition isolé | Réussi, avec trois builds et sans dépendre d’un livre ou article d’exemple |
| Tests navigateur en démonstration | 14 réussis sur ordinateur et mobile |
| Build hors démonstration | 17 pages HTML ; tests HTML et navigateur réussis avec un e-mail temporaire |
| Conservation des réglages | Comparaison des anciens YAML avec le fichier fusionné : toutes les valeurs conservées |
| Comparaison du rendu initial | 23 pages identiques après normalisation des espaces et exclusion des chemins des scripts/styles ; CSS compilé strictement identique |
| Images et accessibilité | Aucune image manquante ni violation axe sur les routes auditées |
| Écran étroit sans JavaScript | Aucun débordement à 320 pixels sur les routes générées |
| Contrôle de production réel | Refus attendu : identité, coordonnées, informations légales et indicateurs de relecture restent à compléter |

Les coordonnées de test n’ont pas été écrites dans les contenus de travail. Le build final est revenu au mode démonstration. Aucun e-mail réel n’a été envoyé, aucun push ni déploiement n’a été effectué. Les workflows GitHub et le compte Cloudflare n’ont pas été exécutés ni modifiés à distance.

Le contrôle complémentaire des valeurs par défaut vérifie qu’un livre ou article sans champ `demo` reçoit `false`, qu’un choix explicite reste respecté et qu’aucune mention de démonstration n’apparaît sur les nouvelles fiches sans ce champ. Les tests de contenus, de rendu et d’édition ainsi que le contrôle Astro ont été relancés avec succès.

Les captures de `docs/previews/` restent des références historiques, antérieures à cette révision. La comparaison ci-dessus porte sur le HTML et le CSS générés, pas sur de nouvelles captures. Les essais mobiles sont simulés sous Chromium ; aucun appareil physique, Safari ou Firefox n’a été testé.
