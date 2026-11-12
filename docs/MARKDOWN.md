# Écrire en Markdown

Markdown met en forme le texte avec quelques signes. Il s’utilise dans les fichiers `.md` de `src/content/pages/`, `books/` et `blog/`, **après le deuxième `---`**.

## Les formes les plus utiles

| Pour écrire… | Saisir… | Résultat |
| --- | --- | --- |
| En gras | `**un mot important**` | **un mot important** |
| En italique | `*un titre de livre*` | *un titre de livre* |
| En gras et italique | `***à retenir***` | ***à retenir*** |
| Du code ou une commande | `` `npm run dev` `` | `npm run dev` |
| Un lien | `[Voir les romans](/catalogue/)` | [Voir les romans](/catalogue/) |

Les signes vont directement contre le texte : `**bonjour**`, sans espace entre les astérisques et le mot. Aucun HTML n’est nécessaire.

## Paragraphes et retours à la ligne

Une ligne vide crée un nouveau paragraphe :

```markdown
Voici mon premier paragraphe.

Voici le suivant.
```

Un simple retour à la ligne dans le fichier reste normalement dans le même paragraphe. Pour imposer un retour sans nouveau paragraphe, terminer la ligne par deux espaces, ou par une barre oblique inverse :

```markdown
Première ligne.\
Deuxième ligne.
```

## Titres

Le site affiche déjà le titre principal. Dans le texte, commencer par `##`, puis utiliser `###` pour une sous-partie :

```markdown
## À propos de ce livre

Un paragraphe de présentation.

### Les personnages

Quelques mots sur les personnages.
```

Un espace est nécessaire après les `#`. Éviter `#` seul pour conserver un seul titre principal par page.

## Listes

Laisser une ligne vide avant et après une liste :

```markdown
- Un premier livre
- Un deuxième livre
- Un troisième livre

1. Choisir une histoire.
2. Ouvrir le livre.
3. Bonne lecture !
```

## Citations

```markdown
> Une histoire peut ouvrir un nouveau chemin.
>
> Voici un second paragraphe de citation.
```

Citer l’auteur et la source lorsque nécessaire, dans le texte qui suit la citation.

## Liens et images

```markdown
[Me contacter](/contact/)

[Visiter un autre site](https://exemple.ch/)

![Un sentier lumineux dans la forêt](../../assets/foret-enchantee.png)
```

Le texte entre crochets décrit la destination du lien ou le contenu de l’image. Pour les images du texte, ajouter le fichier dans `src/assets/` et utiliser un chemin relatif comme dans l’exemple. Les couvertures, le portrait et le grand visuel se configurent dans les champs YAML indiqués dans le [guide d’édition](CONTENUS.md).

## Afficher les caractères spéciaux

Pour afficher un signe Markdown tel quel, le précéder de `\` : `\*mot\*` affiche les astérisques au lieu de mettre le mot en italique. Les apostrophes et accents peuvent être saisis normalement.

## Le YAML en haut des fichiers

Le YAML décrit les titres, boutons, dates et réglages. Il est séparé du Markdown :

```markdown
---
template: catalogue
title: "Les romans — Catalogue"
description: "Une présentation courte."
# Les autres réglages de la page restent ici.
---
## Bienvenue dans ma bibliothèque

Un texte **en gras** et un passage *en italique*.
```

Cet extrait explique la séparation ; conserver les autres champs du fichier existant.

Dans le YAML :

- Conserver l’indentation avec des espaces, sans tabulation.
- Mettre une phrase entre guillemets doubles lorsqu’elle contient `: ` ou `#`.
- Si la phrase contient elle-même des guillemets doubles, écrire `\"`, ou utiliser `|-`.
- Utiliser `true` et `false` sans guillemets pour les options ; écrire les dates sous la forme `2026-11-12`.
- Une chaîne vide s’écrit `""`. Certains champs de texte sont obligatoires et ne peuvent pas être vides.
- `#` commence un commentaire YAML ; un titre Markdown s’écrit après la fin de l’en-tête.

Exemple de texte sur plusieurs lignes :

```yaml
footerMessage: |-
  Pour celles et ceux qui croient
  encore à la magie des histoires.
```

**Le YAML reste du texte brut** : `**bonjour**` dans un champ de bouton afficherait les astérisques. Pour le titre visible, `heading.accent` applique déjà l’italique et la couleur. Les variables comme `{title}` ou `{book}` doivent être conservées dans les libellés qui les utilisent.

## Avant d’enregistrer

Relire le texte dans l’aperçu local (`npm run dev`), vérifier les liens et les images, puis lancer `npm run verify`. Si une erreur mentionne `hero.primaryLabel` ou une autre clé, retrouver ce champ dans le fichier et vérifier sa valeur ainsi que son indentation.
