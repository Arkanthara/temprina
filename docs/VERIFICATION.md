# Vérifications du site

## Deux univers — 10 novembre 2026

| Contrôle | Résultat |
| --- | --- |
| `npm run check` | 0 erreur, 0 avertissement, 0 suggestion sur 51 fichiers |
| `npm run build` | 36 pages générées en démonstration |
| `npm test` | Contrôles du build, des liens, des images, du contenu et des informations légales réussis |
| `npm run test:editing` | Réussi dans une copie temporaire ; les contenus de l’autrice restent éditables à leur nouvel accueil `/romans/` |
| `npm run test:e2e` | 32 scénarios réussis ; 2 scénarios réservés à la configuration de production ignorés |
| Accessibilité et petits écrans | Aucune violation axe WCAG A/AA sur les routes auditées, ordinateur et mobile ; nouvelles pages également vérifiées à 1440, 390 et 320 px sans débordement |
| Sans JavaScript | Portail, changement d’univers, galeries et fiches accessibles à 320 px ; adresse directe utilisable lorsqu’elle est configurée |
| Contact configuré | Build temporaire avec des adresses d’essai distinctes : destinataire atelier, accents, inspiration et contenu du lien `mailto:` vérifiés dans Chromium ; aucun e-mail envoyé |

Le parcours de contact vérifie la présélection d’un dessin, la copie de la demande, la remise à zéro d’une inspiration incompatible après changement de catégorie et l’ignorance de paramètres d’URL inconnus. Le contrôle des images ne tente pas de faire défiler les décorations masquées sur mobile, mais vérifie leur chargement.

Le champ obligatoire `readingMinutes` manquant et la syntaxe des italiques et intertitres de « Mon autobiographie de lectrice » ont aussi été corrigés pour permettre la compilation et conserver un seul titre principal, sans réécriture du texte.

Aperçus actuels :

- [Portail ordinateur](previews/portail-deux-univers-ordinateur.png) · [mobile](previews/portail-deux-univers-mobile.png)
- [Atelier ordinateur](previews/atelier-deux-univers-ordinateur.png) · [mobile](previews/atelier-deux-univers-mobile.png)
- [Dessins ordinateur](previews/dessins-deux-univers-ordinateur.png) · [mobile](previews/dessins-deux-univers-mobile.png)

Le nom de démonstration « L’Atelier des fées » a été validé. Son logo et les six inspirations sont provisoires. L’adresse réelle reste à renseigner dans `PUBLIC_ATELIER_EMAIL`. La page de mesures est spécifiée dans [le guide](ATELIER.md) et n’est pas implémentée. Les modifications sont locales ; aucun push ni déploiement du site public n’a été effectué.

## Deux histoires dans un livre — 7 novembre 2026

La fiche **Les Prisonniers du Tram** utilise désormais `followedBy` pour présenter **Menace Ombre et Lumière**, avec la mention « suivi de » sur les cartes et la fiche, et un résumé séparé. Vérifications réalisées sur Node.js 22.23.1 :

| Contrôle | Résultat |
| --- | --- |
| `npm run check` | Aucun diagnostic TypeScript/Astro |
| `npm run build` | 22 pages HTML en mode démonstration |
| `npm test` | 20 contrôles réussis, dont la séparation des histoires, les titres de partage, le JSON-LD et la conservation du contact pour un seul livre |
| `npm run test:editing` | Réussi : modification de la seconde histoire dans une copie temporaire, rendu sur l’accueil et le catalogue, coexistence avec un sous-titre, accroche et résumé en plusieurs paragraphes, échappement HTML, champs vides masqués, rejet d’un titre absent/vide et d’une accroche de plus de 300 caractères |
| Playwright ciblé : `both stories` et `pages render without` | 4 scénarios réussis sur les projets ordinateur/mobile ; lecture à 320 px sans JavaScript ; aucune violation axe ni débordement sur les 12 routes auditées, dont la nouvelle fiche |

La suite navigateur complète et le build hors démonstration n’ont pas été relancés pour cette évolution. Les captures ci-dessous restent celles des vérifications précédentes.

## Phrase du pied de page — 7 novembre 2026

La phrase sous le nom de l’auteur est désormais lue depuis `footerTagline` dans `src/content/settings/site.yaml`. Vérifications réalisées sur Node.js 22.23.1 :

| Contrôle | Résultat |
| --- | --- |
| `npm run check` | Aucun diagnostic TypeScript/Astro |
| `npm run build` | 22 pages HTML en mode démonstration |
| `npm test` | Réussi, avec un nouveau contrôle de la phrase configurée sous le nom de l’auteur sur toutes les pages générées |
| `npm run test:editing` | Réussi : modification du YAML dans une copie temporaire, rendu sur toutes les pages, suppression des espaces de bord, caractères HTML affichés comme texte et rejet de `footerTagline` absent ou composé uniquement d’espaces |

Les tests navigateur n’ont pas été relancés pour cette modification de contenu partagé. Les résultats et captures ci-dessous datent de la vérification précédente.

## Vérification précédente — 6 novembre 2026

Vérifications de l’édition des pages et des informations légales réalisées le **6 novembre 2026**, sur **Node.js 22.23.1** et **Chromium via Playwright**. Le build local final est en mode démonstration.

| Contrôle | Résultat |
| --- | --- |
| `npm run check` | Aucun diagnostic TypeScript/Astro |
| `npm run build` | 22 pages HTML en mode démonstration ; 12 hors démonstration avec les contenus actuels |
| `npm test` | 18 contrôles : 12 sur le build, 3 sur la lecture/validation des contenus et 3 sur les informations légales ; tous réussis en démo |
| Tests du build hors démo | Réussis ; les 2 contrôles des livres fictifs minimal/complet sont ignorés lorsque leurs routes sont absentes |
| `npm run test:editing` | Réussi : édition dans une copie temporaire, rendu des nouveaux textes et rejet du champ `hero.primaryLabel` manquant |
| Tests navigateur de démonstration | 22 scénarios réussis sur ordinateur et mobile ; 2 scénarios de production ignorés |
| Tests navigateur hors démo avec contact configuré | 2 scénarios réussis, avec des coordonnées temporaires de test |
| Accessibilité automatisée | Aucune violation axe WCAG A/AA détectée sur les 11 routes représentatives, aux deux formats |
| Écrans étroits | Aucun débordement sur les routes auditées ; lecture auteur et navigation sans JavaScript vérifiées à 320 px |
| Comparaison au document Word fourni | Les 6 paragraphes de présentation et les 2 paragraphes de biographie sont conservés intégralement dans le HTML auteur |
| Validation de production | Refus attendu : identité et contact de l’autrice, environnement, informations de traitement et validation des pages légales restent à renseigner ; la biographie intégrée est reconnue |

## Édition et publication

Les huit fichiers de `src/content/pages/` alimentent les métadonnées et les titres visibles de leurs routes. Les tests contrôlent cette correspondance. Le test d’intégration édite l’accueil, la biographie, la présentation, un message de contact, les deux textes légaux et les crédits du développeur dans une copie temporaire sans `.env`, puis reconstruit le site. Il vérifie notamment les nouveaux titres et métadonnées, le Markdown en gras, l’échappement des chaînes YAML et le diagnostic du champ requis supprimé. La CI **Build et tests** exécute ce scénario en plus des vérifications existantes.

Les contrôles de production lisent les contenus Markdown : ils exigent une présentation et une biographie renseignées, ainsi que des pages légales avec `approved: true`, un corps non vide et aucune notice provisoire. Les informations communes de `src/content/legal/site.yaml` doivent également être complètes et valides. Des tests couvrent les indicateurs non validés, les fichiers absents ou illisibles et les variables manquantes. Ils utilisent des fichiers temporaires afin de permettre de compléter les véritables pages légales sans modifier les tests.

Les scénarios navigateur couvrent le passage de l’accueil à la biographie, la lecture de la présentation jusqu’au dernier paragraphe et la navigation sans JavaScript. Ils s’appuient sur la structure éditoriale plutôt que sur un titre ou un nombre de paragraphes imposés, pour permettre les prochaines modifications de contenu. Les scénarios de contact configuré vérifient aussi qu’un titre de livre contenant `$&` et des caractères HTML reste du texte littéral dans le message prérempli.

## Pages légales et développeur

Le schéma des informations communes est partagé entre le build Astro et le contrôle de publication ; leur lecture utilise le même parseur YAML, notamment pour les dates. Le test d’édition contrôle le changement des textes Markdown des deux pages, les valeurs communes, la reprise de l’identité de l’éditeur comme responsable du traitement, le contact par e-mail, la date et le crédit développeur sur plusieurs routes. Les noms contenant des caractères HTML restent du texte ; les URL non HTTP(S) sont refusées. L’activation d’un crédit sans nom est refusée. Les faits manquants ou marqués « À confirmer » restent bloquants même si les deux pages portent `approved: true`.

Les tests navigateur suivent les liens du pied de page vers les mentions légales et la confidentialité sans JavaScript, à 320 px. Les deux pages font aussi partie de l’audit axe aux formats ordinateur/mobile.

Les valeurs confirmées par le propriétaire sont reprises : **Michel Jean Joseph Donnet** depuis `LICENSE`, l’autrice à son compte, **Cloudflare Pages gratuit** sans service supplémentaire configuré, et l’origine **https://donnet.pages.dev**. Les faits inconnus restent visibles comme informations à compléter.

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

L’ouverture du site public déclaré via l’outil web n’a pas abouti ; une requête HTTP depuis cet environnement a reçu une réponse 403. Les cookies et les réglages effectifs de ce déploiement n’ont donc pas été audités. Cela ne permet pas de conclure à une indisponibilité pour les visiteurs.

Les workflows GitHub Actions et le DevContainer n’ont pas été exécutés sur leurs plateformes distantes. Aucun push GitHub ni déploiement Cloudflare n’a été effectué. Les tests hors démo utilisent des valeurs temporaires et ne constituent pas une validation des informations légales.
