# Gestion des contenus

## Configuration globale

Les contenus se modifient dans **`src/content/`**, sans ouvrir les fichiers `.astro`. Ouvrir le fichier voulu sur GitHub, cliquer sur le crayon, modifier puis enregistrer sur la branche de travail. Avec la connexion GitHub → Cloudflare Pages configurée, la fusion dans `master` reconstruit et publie le site. En local, `npm run dev` affiche les changements pendant la rédaction.

| Ce que vous souhaitez changer | Fichier |
| --- | --- |
| Phrase sur la magie des histoires, sous-titres, navigation et pied de page | `src/content/settings/site.yaml` |
| Nom public, adresse de contact, logo et image de partage | `src/content/settings/site.yaml` |
| Libellés des livres, articles, boutons de partage et messages de copie | `src/content/settings/site.yaml` |
| Photo de l’auteur, légende, illustration et biographie | `src/content/pages/auteur.md` |
| Titres, textes, boutons et image de l’accueil | `src/content/pages/index.md` |
| Autres pages | `src/content/pages/`, voir le tableau ci-dessous |
| Romans et couvertures | `src/content/books/` |
| Articles | `src/content/blog/` |
| Informations légales communes et développeur | `src/content/legal/site.yaml` |

Dans `site.yaml`, remplir `identity.authorName` et `identity.contactEmail` pour modifier le nom et l’e-mail depuis les contenus. S’ils restent vides, les anciennes variables `PUBLIC_AUTHOR_NAME` et `PUBLIC_CONTACT_EMAIL` continuent à être utilisées. Les valeurs YAML renseignées sont prioritaires, y compris pour le formulaire de contact, les métadonnées et les vérifications de production. Ces informations sont publiques.

L’origine canonique et les modes de publication restent des réglages techniques : `PUBLIC_SITE_URL`, `PUBLIC_DEMO_MODE` et `PUBLIC_CONTENT_APPROVED`. Copier `.env.example` en `.env` pour le développement. Ne jamais placer de secret dans les contenus ou dans les variables `PUBLIC_*`. Reconstruire après chaque changement pour mettre à jour le site publié.

Le logo se choisit avec `images.logo.src` dans `site.yaml` : déposer le fichier dans `public/images/` et écrire `/images/mon-logo.png`. Renseigner ses dimensions réelles avec `width` et `height`, et son type (`image/png`, par exemple). Préférer un logo carré et transparent. Il sert dans l’en-tête, le pied de page, l’accueil et comme favicon. `images.social` choisit l’image des aperçus de partage (sauf les fiches livres, qui utilisent leur couverture).

## Modifier la phrase sur la magie des histoires

Ouvrir **`src/content/settings/site.yaml`**, chercher **`footerMessage`**, puis modifier les deux lignes indentées :

```yaml
footerMessage: |-
  Pour celles et ceux qui croient
  encore à la magie des histoires.
```

Vous pouvez écrire une autre phrase sur une ou plusieurs lignes. Conserver les deux espaces au début de chaque ligne : les retours à la ligne sont conservés à l’affichage. Le changement s’applique au **pied de page de toutes les pages**, y compris les livres, articles et la page 404.

## Modifier la phrase sous le nom de l’auteur

Dans le même fichier, remplacer le texte entre guillemets :

```yaml
footerTagline: "CHAQUE LIVRE EST UN PASSAGE."
```

`footerTagline` est la petite phrase sous le nom dans le pied de page ; `headerSubtitle` est celle de l’en-tête (« ROMANS & IMAGINAIRES ») ; `footerCredit` est la mention « Imaginé entre les pages ». Le bloc `navigation` contient les libellés des liens et du menu mobile. Les destinations des liens internes restent liées aux pages du site.

Les blocs `books`, `blog`, `share` et `demo` contiennent les autres textes communs, y compris les messages affichés par JavaScript et les textes accessibles. Conserver les variables entre accolades (`{title}`, `{author}`, `{date}`, `{volume}`, `{minutes}`) : elles sont remplacées par les informations du contenu concerné. Les champs obligatoires ne peuvent pas être vides. Le contenu est du texte brut : HTML et Markdown ne sont pas interprétés. Garder les guillemets, notamment pour les caractères `: ` ou `#`.

## Modifier une page sans toucher au code

Les textes des pages sont dans **`src/content/pages/`**. Ils peuvent être modifiés dans un éditeur de texte, ou directement sur GitHub : ouvrir le fichier, cliquer sur le crayon, modifier et enregistrer sur la branche de travail. Les tests de la pull request vérifient le résultat avant fusion. En local, `npm run dev` affiche les changements pendant la rédaction ; après publication, un nouveau build est nécessaire. Avec la connexion GitHub → Cloudflare Pages configurée, fusionner dans `master` déclenche ce build.

| Page | Fichier à modifier | Contenu |
| --- | --- | --- |
| Accueil `/` | `src/content/pages/index.md` | Image et introduction, titres de sections, boutons, états vides et extrait de présentation |
| Auteur `/auteur/` | `src/content/pages/auteur.md` | Portrait, légende, illustration, biographie et présentation intégrale |
| Catalogue | `src/content/pages/catalogue.md` | En-tête, compteur, libellés et état vide |
| Blog | `src/content/pages/blog.md` | En-tête, libellés et état vide du carnet |
| Contact | `src/content/pages/contact.md` | Présentation, coordonnées indisponibles, formulaire, messages et e-mail prérempli |
| Mentions légales | `src/content/pages/mentions-legales.md` | En-tête, notice, texte et validation éditoriale |
| Confidentialité | `src/content/pages/confidentialite.md` | En-tête, notice, texte et validation éditoriale |
| Erreur 404 | `src/content/pages/404.md` | Titre, texte et liens de retour |

Chaque fichier comporte deux parties :

1. Entre les deux lignes `---`, les réglages **YAML** : métadonnées, titres et libellés. Garder les noms des champs et l’indentation avec des espaces.
2. Après la deuxième ligne `---`, le texte **Markdown** : paragraphes, `**gras**`, `*italique*`, liens et intertitres `##`. Le gabarit fournit déjà le titre principal : ne pas ajouter de titre `#`.

Exemple de modification d’un en-tête (extrait, conserver les autres champs du fichier) :

```yaml
title: "Les romans — Catalogue"
description: "Découvrez mes romans et choisissez votre prochaine lecture."
eyebrow: "MES LIVRES"
heading:
  lines:
    - "À chaque livre,"
    - "un autre"
  accent: "monde."
lead: "Votre prochaine aventure commence ici."
```

`title` est utilisé dans l’onglet et le partage ; `description` dans le référencement et le partage (300 caractères maximum). `heading.lines` contient les lignes du titre visible ; `accent`, facultatif, en souligne la fin en italique. Ces champs sont du texte brut, sans HTML ni Markdown. Pour un texte contenant `: ` ou `#`, utiliser des guillemets. Pour un paragraphe YAML long, `>-` joint les lignes ; `|-` conserve les retours à la ligne.

Sur l’accueil, `hero`, `books`, `author`, `journal` et `contact` correspondent aux sections affichées. Le corps Markdown devient l’extrait du bandeau auteur. Les livres et articles restent calculés à partir de leurs propres fichiers ; leur ordre ne se modifie pas ici. Les destinations des boutons restent définies dans les gabarits.

Dans `auteur.md`, `biography` est une liste de paragraphes :

```yaml
biography:
  - >-
    Mon premier paragraphe, qui peut être rédigé
    sur plusieurs lignes dans le fichier.
  - "Mon deuxième paragraphe."
```

La présentation intégrale suit dans le corps Markdown. La présentation et les deux paragraphes de biographie actuels viennent du document **Site Temprina.docx** : le texte a été conservé, avec un extrait repris sur l’accueil autour de « J’ai choisi la lumière ». Le document Word reste une source de référence ; le modifier ne met pas le site à jour automatiquement. Les contenus auteur restent visibles dans les deux modes, démonstration et production.

Les champs de compteur du catalogue conservent **`{count}`**. Le lien de lecture du blog conserve **`{title}`**. Dans Contact, `selectedBook`, `bookSubject` et `bookMessage` conservent **`{book}`**, remplacé par le titre du livre sélectionné. Les labels accessibles et les textes sans JavaScript font partie des réglages. L’adresse e-mail se configure dans `identity.contactEmail` de `src/content/settings/site.yaml`, ou avec `PUBLIC_CONTACT_EMAIL` si ce champ reste vide.

Les contenus sont validés par modèle au build : un champ obligatoire absent, vide ou un jeton manquant fait échouer la compilation avec le nom du champ. Conserver `template` et les noms de fichiers : ils relient chaque contenu à sa route. Les fichiers `.astro` dans `src/pages/` servent à changer la mise en page, les destinations et les interactions ; ils ne sont plus nécessaires pour modifier ces textes. Les textes de l’en-tête, de la navigation, du pied de page, des fiches livres, des articles et du partage viennent de `src/content/settings/site.yaml`. Les gabarits conservent la structure et les interactions ; changer la mise en page ou les couleurs demande toujours de modifier le code ou `src/styles/global.css`. Les images éditoriales sont dans `src/assets/`, celles du logo et du partage dans `public/images/`.

Les informations communes des deux pages légales (éditeur, développeur, hébergeur, conservation et destinataires) se modifient dans **`src/content/legal/site.yaml`**. Renseigner `developer.name`, son éventuel `url`, puis `showInFooter: true` pour afficher aussi les crédits sur toutes les pages. Les textes et libellés restent dans les deux fichiers Markdown ; les champs vides sont signalés au rendu. Voir [le guide des informations légales](INFORMATIONS-LEGALES.md) pour les exemples et les informations Cloudflare à réunir.

Les deux pages légales restent préparatoires. Après relecture de leurs textes définitifs, retirer le champ `notice` et passer `approved: true` dans chacune. `npm run validate:production` vérifie aussi le schéma et les champs de complétude de `src/content/legal/site.yaml`, puis ces fichiers, la présence de la présentation et de la biographie ainsi que les variables de production. `PUBLIC_CONTENT_APPROVED=true` reste nécessaire. Ces indicateurs enregistrent une validation humaine ; ils ne constituent pas une validation juridique automatisée.

## Ajouter la petite photo et sa légende

1. Ajouter la vraie photo dans **`src/assets/`**, par exemple `portrait-auteur.jpg` (sur GitHub : *Add file → Upload files*). Préférer une photo d’au moins 480 × 480 pixels.
2. Ouvrir **`src/content/pages/auteur.md`** et modifier le bloc `portrait` :

```yaml
portrait:
  enabled: true
  image: ../../assets/portrait-auteur.jpg
  alt: "Portrait de Prénom Nom"
  caption: |-
    Prénom Nom
    Autrice de romans · Photo : crédit du photographe
  placeholder: "Portrait à venir"
  position: center
```

Le portrait apparaît en petit dans un cadre sous l’illustration, avec une photo ronde et la légende à côté. Astro optimise la photo et prépare une image WebP de 240 × 240 pixels pour un affichage net sur les écrans haute résolution. `position: top` permet de recentrer le cadrage sur le haut du portrait ; `center` et `bottom` sont aussi possibles. Le cadre s’adapte au mobile et fonctionne sans JavaScript.

Tant que `image: ""` reste vide, une silhouette décorative et le texte `placeholder` s’affichent, sans fausse photo ni image cassée. `enabled: false` masque l’encadré ; `caption: ""` retire seulement la légende. `alt` décrit la photo pour les lecteurs d’écran ; la légende peut inclure un crédit et plusieurs lignes. Le texte reste du texte brut, sans balises HTML.

Le champ `image` à la racine d’`auteur.md` remplace la grande illustration ; `imageAlt` et `imageCaption` règlent sa description et sa légende. Dans `index.md`, `hero.image` choisit l’image de fond de l’accueil, décorative. Ces chemins sont relatifs au fichier Markdown, comme les couvertures des livres. Un fichier image inexistant empêche la compilation et doit être corrigé avant publication.

## Ajouter un roman

Créer `src/content/books/un-nouveau-roman.md` et placer sa couverture dans `src/assets/`. Préférer une image d’au moins 600 × 900 pixels, ratio 2:3, aux droits vérifiés.

Seuls `title`, `publicationDate` et `cover` sont obligatoires. Exemple minimal (le corps Markdown est lui aussi facultatif) :

```yaml
---
title: "Un nouveau roman"
publicationDate: 2026-10-22
cover: ../../assets/un-nouveau-roman.jpg
---
```

Exemple enrichi :

```yaml
---
title: "Un nouveau roman"
subtitle: "Sous-titre facultatif"
description: "Un résumé court de 300 caractères maximum."
genre: "Fantasy"
series: "Les Chroniques de la forêt"
volume: 1
publicationDate: 2026-10-22
cover: ../../assets/un-nouveau-roman.jpg
coverAlt: "Couverture de Un nouveau roman : description visuelle concise."
featured: true
draft: false
publisher: "Nom de l’éditeur"
isbn: "9780000000002"
formats: ["Broché", "Numérique"]
purchaseLinks:
  - label: "Librairie"
    url: https://example.com/un-nouveau-roman/
---
Le résumé complet, en **Markdown**, commence ici.
```

`subtitle`, `description`, `genre`, `series`, `volume` et `coverAlt` sont facultatifs. Les textes sont nettoyés de leurs espaces de début et de fin ; un texte vide est traité comme absent au rendu. `volume`, s’il est fourni, reste un entier strictement positif. Aucune série « Hors série » n’est ajoutée automatiquement : écrire ce libellé explicitement si souhaité.

Les cartes de l’accueil et du catalogue affichent le sous-titre, la série, le tome et la description seulement lorsqu’ils sont renseignés. Le genre précède l’année uniquement lorsqu’il existe. Série et tome peuvent être fournis indépendamment, sans séparateur superflu. La fiche suit la même règle pour son en-tête et ses informations, avec une date de publication toujours visible ; le résumé court et le corps Markdown apparaissent s’ils existent.

Sans `coverAlt` ou avec une valeur vide, le texte alternatif devient « Couverture de [titre] ». Sans description, les métadonnées SEO et de partage utilisent une phrase construite avec le titre, le nom de l’auteur et la date ; le JSON-LD omet la description et le genre absents.

L’exemple minimal hérite de `demo: false`, `draft: false` et `featured: false` : le livre apparaît sans avoir à préciser `demo: false`. Les romans fictifs doivent être marqués explicitement `demo: true`, comme **Le Chant des Sylves** et **La Dernière Braise**. Ce dernier reste un exemple de livre minimal, avec ce seul indicateur ajouté aux trois champs requis.

La fiche apparaît à `/livres/un-nouveau-roman/`. Le catalogue, les données structurées et le sitemap se mettent à jour au build. Sur l’accueil, les romans `featured: true` passent en premier, puis les plus récents, avec un maximum de trois.

Pour une série, indiquer le même libellé `series` sur ses tomes et ajouter `volume: 1`. La date `publicationDate` détermine l’ordre du catalogue, du plus récent au plus ancien. Le nom de fichier sert d’identifiant : le conserver après publication, ou prévoir une redirection Cloudflare en cas de changement.

Champs réservés facultatifs : `publisher`, `isbn`, `formats` (liste) et `purchaseLinks` (liste d’objets `label`, `url`). Ils n’ajoutent pas de bouton d’achat ; `publisher` et `isbn`, lorsqu’ils existent, enrichissent déjà le JSON-LD. Les interfaces correspondantes restent à décider pour la suite.

### Deux histoires dans un même livre (« suivi de »)

Ajouter un bloc facultatif `followedBy` dans le YAML du livre. Il remplace la mention « suivi de » autrefois saisie dans `subtitle` ; un véritable sous-titre peut toujours être conservé en parallèle. Exemple pour `src/content/books/les-prisonniers-du-tram.md` (conserver les autres champs du fichier) :

```yaml
title: "Les Prisonniers du Tram"
description: "Deux histoires à donner le frisson, dans un monde qui paraît familier..."
followedBy:
  title: "Menace Ombre et Lumière"
  summary: "Tout comme les fascinants outils numériques qui accompagnent nos vies..."
```

Le bloc `followedBy` accepte :

| Champ | Usage |
| --- | --- |
| `title` | Titre obligatoire et non vide de la deuxième histoire. |
| `description` | Accroche facultative, limitée à 300 caractères. |
| `summary` | Résumé facultatif, sans limite de 300 caractères ; plusieurs paragraphes sont possibles. |

Pour ajouter une accroche et développer le résumé, utiliser par exemple :

```yaml
followedBy:
  title: "Titre de la deuxième histoire"
  description: "Une courte accroche à rédiger."
  summary: |-
    Premier paragraphe du résumé de cette deuxième histoire.

    Deuxième paragraphe du résumé.
```

Ces textes YAML sont du **texte brut** : ne pas ajouter de balises `<i>` ni de Markdown. Le site met automatiquement « suivi de » en italique ; les lignes vides de `summary` séparent les paragraphes. Les espaces de bord sont retirés ; une accroche ou un résumé vide n’affiche aucun élément.

Les cartes de l’accueil (si le livre y est sélectionné) et du catalogue affichent « suivi de [titre] ». La fiche présente cette mention sous le titre et l’éventuel sous-titre ; le corps Markdown reste le résumé de la **première histoire**, précédé de son titre lorsqu’il existe une seconde histoire. Une section distincte porte le titre de la deuxième histoire et affiche son accroche et/ou son résumé. Si seul `followedBy.title` est renseigné, la mention suffit et aucune section vide n’est créée. La `description` principale reste la présentation globale du livre et alimente ses métadonnées.

Le titre de l’onglet et du partage inclut « suivi de [titre] ». Le JSON-LD conserve un seul `Book` et décrit la deuxième histoire via `hasPart` ; l’accroche devient `description` et le résumé `abstract` lorsqu’ils existent. Les deux histoires partagent la même couverture, date, URL et lien de contact. Ne pas créer de deuxième fichier livre pour cette histoire. Supprimer tout le bloc `followedBy` pour revenir à un livre à une seule histoire.

## Catalogue et filtres éventuels

Le catalogue affiche tous les romans visibles, triés par date de publication décroissante. Il ne propose ni filtres ni recherche textuelle et fonctionne sans JavaScript. Les anciens paramètres d’URL (`genre`, `series`, `year`) sont sans effet sur les livres affichés.

Les champs facultatifs `genre` et `series` et la date obligatoire `publicationDate` restent disponibles dans le schéma des livres. Ils servent aux informations affichées et permettront d’ajouter des filtres ultérieurement sans migrer les contenus. Aucun composant de filtrage ni code de filtrage désactivé n’est conservé.

Si cette évolution est retenue, les options pourront être déduites des romans visibles. Il faudra alors ajouter les contrôles accessibles, la logique de sélection, l’état sans résultat et leurs tests, puis documenter le comportement des URL. Aucun réglage n’est nécessaire aujourd’hui pour l’ajout d’un livre.

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

- Pour les livres, `demo: false` est la valeur par défaut : aucun champ `demo` n’est nécessaire pour un livre réel. Réserver `demo: true` aux romans fictifs.
- Pour les articles, `demo: true` reste la valeur par défaut : écrire explicitement `demo: false` pour un article réel.
- `draft: true` exclut le contenu de toutes les pages et de ses routes.
- `PUBLIC_DEMO_MODE=true` rend les contenus fictifs visibles et désactive l’indexation.
- `PUBLIC_DEMO_MODE=false` exclut tous les contenus fictifs, même si les fichiers restent dans le dépôt.
- Ne pas transformer les exemples en ouvrages réels en changeant simplement leur drapeau. Les remplacer par les vrais textes, dates et couvertures.

## Vérifier

`npm run check && npm run build && npm test` vérifie schémas, types, génération, liens, métadonnées et validation de publication. `npm run test:editing` modifie les contenus dans une copie temporaire isolée, reconstruit le site et contrôle le rendu ainsi que le refus des champs obligatoires manquants. Ce test ne change ni les fichiers ni le build de votre espace de travail ; il est aussi exécuté en CI. `npm run dev` permet de relire les contenus. Les tests du build et du navigateur couvrent les exemples minimal et complet, le texte alternatif de secours et les éléments conditionnels. Le nombre attendu de livres dans le navigateur est déduit du build, pour inclure les ajouts de contenu. Adapter les assertions si les exemples de démonstration sont volontairement modifiés.

Les boutons de partage utilisent l’origine `PUBLIC_SITE_URL`. L’origine par défaut est `https://donnet.pages.dev`, confirmée par le propriétaire. `PUBLIC_SITE_URL` permet de la remplacer. Les aperçus sur les réseaux restent à vérifier sur le déploiement effectivement accessible.
