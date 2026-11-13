# Modifier le site

## Le parcours habituel

1. Ouvrir le fichier dans GitHub et cliquer sur le crayon, ou l’ouvrir dans son éditeur local.
2. Modifier le texte, puis enregistrer. Sur GitHub, le bouton **Commit changes** enregistre une version.
3. Vérifier l’aperçu et les tests. Si Cloudflare est connecté à la branche modifiée, l’enregistrement déclenche aussi une nouvelle publication.

En local, `npm run dev` affiche les changements à `http://localhost:4321`. `npm run verify` contrôle le site complet. L’historique Git conserve les versions précédentes.

## Trouver le bon fichier

Tous les textes des pages sont dans `src/content/pages/` :

| Page | Fichier | Parties modifiables |
| --- | --- | --- |
| Accueil | `index.md` | Métadonnées, grand visuel, titres, boutons, blocs livres/auteur/blog/contact ; le corps Markdown présente l’auteur |
| Auteur | `auteur.md` | Titres, illustration, légende, portrait, biographie, bouton ; le corps Markdown contient la présentation longue |
| Catalogue | `catalogue.md` | Titres, introduction, compteur, messages si vide ; le corps Markdown ajoute une présentation avant les livres |
| Blog | `blog.md` | Titres, introduction, liens et message si vide ; le corps Markdown ajoute une présentation avant les articles |
| Contact | `contact.md` | Titres, explications, coordonnées, formulaire, messages ; le corps Markdown contient le texte de présentation |
| Mentions légales | `mentions-legales.md` | Titres, rubriques, libellés et texte Markdown |
| Confidentialité | `confidentialite.md` | Titres, rubriques, libellés et texte Markdown |
| Page introuvable | `404.md` | Titres, explications, boutons et texte Markdown complémentaire |

Un fichier `.md` contient deux parties séparées par `---` : les réglages **YAML** en haut, puis le texte **Markdown**. Le [guide Markdown](MARKDOWN.md) explique les deux. Les textes YAML restent du texte brut ; le gras et l’italique Markdown s’utilisent dans le corps du fichier.

Conserver les noms de clés et `template`. `title` et `description` servent à l’onglet, aux moteurs de recherche et au partage ; `heading` désigne le titre visible. Dans `heading.lines`, chaque élément donne une ligne ; `heading.accent` reçoit automatiquement la couleur et l’italique du site. Les champs `lead` et les textes écrits avec `|-` peuvent contenir plusieurs lignes.

Pour modifier un bouton, changer son champ `linkLabel`, `primaryLabel` ou `secondaryLabel`. Les liens de navigation gardent les destinations des pages existantes. Un changement de structure ou de destination se fait dans le gabarit Astro correspondant ; voir [l’architecture](ARCHITECTURE.md).

## Réglages communs : un seul fichier

`src/content/site.yaml` rassemble les informations partagées. Une modification s’applique partout.

| Rubrique | Ce qu’elle contient |
| --- | --- |
| `identity` | `authorName`, `authorFallback`, `contactEmail`, description générale, métier |
| `images` | Logo utilisé aussi comme favicon, dimensions/type du logo et image de partage |
| `headerSubtitle` | Phrase sous le nom dans l’en-tête |
| `footerTagline`, `footerMessage`, `footerCredit` | Les trois textes du pied de page |
| `navigation`, `skipContent` | Menus, liens du pied de page et libellés accessibles |
| `demo` | Texte du bandeau de démonstration |
| `books` | Textes communs des cartes et fiches : couverture, tome, « suivi de », contact et métadonnées de secours |
| `blog` | Retour aux articles, durée de lecture, notice de démonstration |
| `share` | Titre du bloc de partage, libellé du bouton « Partager » et message d’erreur |
| `legal` | Éditeur, développeur, hébergeur et informations de confidentialité |

Sur les fiches livres et les articles, seul le bouton **Partager** ouvre le menu natif du navigateur, avec le titre et l’adresse canonique de la page. Les choix de copie, d’application ou de messagerie sont proposés par ce menu selon l’appareil. Le bouton reste masqué si le navigateur ne prend pas en charge le partage natif ou si JavaScript est désactivé. Une annulation ferme simplement le menu ; une erreur affiche le texte `shareError`.

Exemple :

```yaml
identity:
  authorName: "Mon nom de plume"
  authorFallback: "Nom de l’auteur à venir"
  contactEmail: "bonjour@mon-domaine.ch"
  description: "Des romans à découvrir."
  jobTitle: "Autrice de romans"
```

Modifier le bloc existant ; ne pas remplacer tout le fichier par cet extrait. Si le nom ou l’e-mail sont vides, les anciennes variables `PUBLIC_AUTHOR_NAME` et `PUBLIC_CONTACT_EMAIL` restent utilisées. Sans e-mail, la page Contact affiche son message d’indisponibilité. Avec un e-mail, le formulaire prépare un message dans la messagerie du visiteur ; sans JavaScript, le lien e-mail reste disponible.

Conserver les variables comme `{title}`, `{author}`, `{date}`, `{volume}`, `{minutes}`, `{count}` et `{book}` dans leurs textes : le site les remplace par les valeurs réelles. Les schémas signalent les variables obligatoires supprimées.

## Modifier les photos et illustrations

Déposer les photos et couvertures dans `src/assets/`. Depuis un fichier de `pages`, `books` ou `blog`, le chemin est de la forme `../../assets/ma-photo.jpg`.

Dans `auteur.md`, `image`, `imageAlt` et `imageCaption` pilotent la grande illustration. Le bloc `portrait` pilote la petite photo :

```yaml
portrait:
  enabled: true
  image: ../../assets/mon-portrait.jpg
  alt: "Portrait de l’autrice"
  caption: "Photo : nom du photographe."
  placeholder: "Portrait à venir"
  position: center
```

`image: ""` affiche le médaillon provisoire ; `enabled: false` masque tout l’encadré. `position` accepte `top`, `center` ou `bottom` pour le cadrage. `caption: ""` retire la légende. Le portrait est automatiquement recadré et optimisé.

Le grand visuel de l’accueil se règle dans `index.md`, champ `hero.image`. Pour le logo et l’image de partage, déposer les fichiers dans `public/images/`, puis renseigner leurs chemins `/images/nom.ext` dans `site.yaml`. Adapter les dimensions et le type si le logo change. Conserver les noms de fichiers permet aussi de remplacer une image sans modifier les réglages.

## Ajouter un livre

Copier [le modèle livre](modeles/livre.md) dans `src/content/books/mon-roman.md`, ajouter sa couverture puis compléter :

```markdown
---
title: "Mon roman"
publicationDate: 2026-11-12
cover: ../../assets/mon-roman.jpg
---
Le résumé du livre, avec du **gras** si nécessaire.
```

Ces **trois champs** suffisent. Le résumé est facultatif. Le nom du fichier devient l’adresse `/livres/mon-roman/` : utiliser des minuscules et des tirets, puis conserver ce nom une fois le livre publié.

| Champ facultatif | Effet |
| --- | --- |
| `subtitle` | Sous-titre sous le titre |
| `description` | Présentation courte, 300 caractères maximum, sur les cartes et la fiche |
| `genre` | Genre sur les cartes et la fiche |
| `series`, `volume` | Série et numéro de tome positif |
| `coverAlt` | Description de la couverture ; sinon « Couverture de [titre] » |
| `featured: true` | Priorité sur l’accueil, qui affiche trois livres |
| `draft: true` | Masque le livre partout, y compris sa fiche |
| `demo: true` | Contenu de démonstration visible seulement en mode démo |
| `publisher`, `isbn` | Informations ajoutées aux données structurées pour les moteurs |
| `followedBy` | Seconde histoire dans le même livre, ci-dessous |

Les anciens champs `formats` et `purchaseLinks` restent acceptés pour conserver les contenus existants ; ils ne créent pas d’interface de vente.

Le catalogue affiche tous les livres visibles, du plus récent au plus ancien. L’accueil privilégie les mises en avant, puis les dates. Aucun tri manuel de fichier ni modification de code n’est nécessaire.

### Deux histoires sous la même couverture

Ajouter ce bloc au livre :

```yaml
followedBy:
  title: "Titre de la seconde histoire"
  description: "Une accroche facultative."
  summary: |-
    Premier paragraphe du résumé.

    Deuxième paragraphe.
```

Le corps Markdown reste le résumé de la première histoire. La seconde a sa propre section ; les cartes montrent seulement « suivi de [titre] ». Ces champs YAML sont du texte brut : les lignes vides de `summary` séparent les paragraphes. Seul `title` est obligatoire ; si les deux résumés facultatifs sont vides, aucune section vide n’apparaît. Supprimer le bloc pour revenir à une seule histoire.

### Masquer ou supprimer un livre

`draft: true` permet de le retirer temporairement. Pour un retrait définitif, supprimer son fichier Markdown : catalogue, accueil, fiche et sitemap se mettent à jour au prochain build. La couverture peut être supprimée lorsqu’aucun autre contenu ne l’utilise. Les anciens liens vers la fiche supprimée arrivent sur la page 404 ; une redirection peut être ajoutée si le livre change simplement d’adresse.

## Ajouter ou supprimer un article

Copier [le modèle article](modeles/article.md) dans `src/content/blog/mon-article.md`, puis compléter le titre, la description (300 caractères maximum), la date et la catégorie. Le champ `readingMinutes` est facultatif : s’il est renseigné, il doit être un nombre entier positif. Supprimer la ligne pour masquer la durée de lecture dans la liste du blog et sur la fiche de l’article, sans séparateur superflu. Aucune durée n’est calculée automatiquement. Écrire l’article après le deuxième `---`.

La fiche sera à `/blog/mon-article/`. Les articles sont classés par date décroissante ; l’accueil montre les deux premiers. `draft: true` masque un article. Supprimer son fichier le retire du site au prochain build.

Les livres et les articles prennent **`demo: false` par défaut** : aucun champ `demo` n’est nécessaire pour un contenu réel. Ajouter explicitement `demo: true` uniquement pour un exemple fictif. Les fichiers de démonstration actuels sont explicitement signalés. Une date future ne programme pas une publication : utiliser `draft` jusqu’au jour voulu.

## Vérifier les changements

`npm run verify` contrôle types, génération, liens, métadonnées, édition et navigateur. Les tests utilisent les contenus actuels : ajouter un livre ou changer un titre ne demande pas de réécrire les tests. Le [guide de vérification](VERIFICATION.md) détaille les commandes et les contrôles de publication.
