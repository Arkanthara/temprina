# Vérifications du site

Vérifications de l’édition des pages réalisées le **6 novembre 2026**, sur **Node.js 22.23.1** et **Chromium via Playwright**. Le build local final est en mode démonstration.

| Contrôle | Résultat |
| --- | --- |
| `npm run check` | Aucun diagnostic TypeScript/Astro |
| `npm run build` | 22 pages HTML en mode démonstration ; 12 hors démonstration avec les contenus actuels |
| `npm test` | 14 contrôles : 11 sur le build et 3 sur la lecture/validation des contenus ; tous réussis en démo |
| Tests du build hors démo | Réussis ; les 2 contrôles des livres fictifs minimal/complet sont ignorés lorsque leurs routes sont absentes |
| `npm run test:editing` | Réussi : édition dans une copie temporaire, rendu des nouveaux textes et rejet du champ `hero.primaryLabel` manquant |
| Tests navigateur de démonstration | 20 scénarios réussis sur ordinateur et mobile ; 2 scénarios de production ignorés |
| Tests navigateur hors démo avec contact configuré | 2 scénarios réussis, avec des coordonnées temporaires de test |
| Accessibilité automatisée | Aucune violation axe WCAG A/AA détectée sur les 11 routes représentatives, aux deux formats |
| Écrans étroits | Aucun débordement sur les routes auditées ; lecture auteur et navigation sans JavaScript vérifiées à 320 px |
| Comparaison au document Word fourni | Les 6 paragraphes de présentation et les 2 paragraphes de biographie sont conservés intégralement dans le HTML auteur |
| Validation de production | Refus attendu : identité, domaine, adresse et validation des pages légales restent à renseigner ; la biographie intégrée est reconnue |

## Édition et publication

Les huit fichiers de `src/content/pages/` alimentent les métadonnées et les titres visibles de leurs routes. Les tests contrôlent cette correspondance. Le test d’intégration édite l’accueil, la biographie, la présentation et un message de contact dans une copie temporaire sans `.env`, puis reconstruit le site. Il vérifie notamment les nouveaux titres et métadonnées, le Markdown en gras, l’échappement des chaînes YAML et le diagnostic du champ requis supprimé. La CI **Build et tests** exécute ce scénario en plus des vérifications existantes.

Les contrôles de production lisent les contenus Markdown : ils exigent une présentation et une biographie renseignées, ainsi que des pages légales avec `approved: true`, un corps non vide et aucune notice provisoire. Des tests couvrent les indicateurs non validés, les fichiers absents ou illisibles et les variables manquantes. Ils utilisent des fichiers temporaires afin de permettre de compléter les véritables pages légales sans modifier les tests.

Les scénarios navigateur couvrent le passage de l’accueil à la biographie, la lecture de la présentation jusqu’au dernier paragraphe et la navigation sans JavaScript. Ils s’appuient sur la structure éditoriale plutôt que sur un titre ou un nombre de paragraphes imposés, pour permettre les prochaines modifications de contenu. Les scénarios de contact configuré vérifient aussi qu’un titre de livre contenant `$&` et des caractères HTML reste du texte littéral dans le message prérempli.

## Régressions conservées

Les scénarios existants couvrent le catalogue complet trié par date, son compteur statique, l’absence de filtres, les paramètres d’URL historiques, le partage, la navigation clavier et le logo. Les exemples de livre minimal et complet restent contrôlés, avec métadonnées facultatives et texte alternatif de secours. Les titres SEO des tomes du **Signe du Sang** sont désormais distincts grâce à leurs sous-titres.

Le contrôle des images dans le navigateur fait défiler les couvertures avant de vérifier leur chargement : les images hors écran sont chargées à la demande. Cela permet de vérifier le catalogue actuel sans confondre une couverture différée avec une image manquante.

## Aperçus

Captures actualisées le 6 novembre 2026 :

- [Accueil ordinateur](previews/accueil-ordinateur.png)
- [Accueil mobile](previews/accueil-mobile.png)
- [Auteur ordinateur](previews/auteur-ordinateur.png)
- [Auteur mobile](previews/auteur-mobile.png)

Captures historiques conservées :

- [Catalogue mobile](previews/catalogue-mobile.png) : 23 octobre, après retrait des filtres ; le catalogue a été enrichi depuis.
- [Fiche livre mobile](previews/fiche-livre-mobile.png) : 22 octobre, avant le remplacement du logo.

## Limites

Les formats mobiles sont simulés sous Chromium ; aucun appareil physique, Safari ou Firefox n’a été utilisé. L’audit automatisé ne remplace pas une revue avec lecteur d’écran. Le contact ouvre la messagerie du visiteur : aucun e-mail réel n’a été envoyé. Le domaine, les aperçus sociaux et la messagerie réelle restent à vérifier avec les coordonnées définitives.

Les workflows GitHub Actions et le DevContainer n’ont pas été exécutés sur leurs plateformes distantes. Aucun push GitHub ni déploiement Cloudflare n’a été effectué. Les tests hors démo utilisent des valeurs temporaires et ne constituent pas une validation des informations légales.
