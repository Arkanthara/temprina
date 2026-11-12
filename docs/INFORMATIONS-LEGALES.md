# Informations légales et crédits

## Deux textes, une seule source de données

Les textes se modifient dans `src/content/pages/mentions-legales.md` et `src/content/pages/confidentialite.md`. Les coordonnées partagées sont dans **`src/content/site.yaml`, rubrique `legal`**. Une correction à cet endroit se répercute sur les deux pages.

| Rubrique | Informations à renseigner ou confirmer |
| --- | --- |
| `legal.updatedOn` | Date de la dernière mise à jour, sous la forme `2026-11-12` |
| `legal.publisher` | Identité de l’éditeur, statut, adresse, pays, e-mail ; responsable de publication et immatriculation si renseignés |
| `legal.developer` | Nom, contribution, site et affichage facultatif dans le pied de page |
| `legal.hosting` | Hébergeur, adresse, service utilisé et liens de référence |
| `legal.privacy` | Responsable, contact, cadre applicable, traitements, messagerie, conservation, pays, transferts, cookies, mesure d’audience et autorité |

Les informations saisies ici sont publiques. Le dépôt conserve les indications déjà fournies sur le développeur et l’hébergement ; les champs vides restent à compléter par le propriétaire avec les faits correspondant au site et aux services utilisés.

## Reprises automatiques

- `legal.publisher.email` vide reprend l’e-mail du site.
- `legal.privacy.contactEmail` vide reprend l’e-mail de l’éditeur, puis celui du site.
- `legal.privacy.controllerName` vide reprend le nom de l’éditeur.

L’e-mail du site vient de `identity.contactEmail`, puis de `PUBLIC_CONTACT_EMAIL` si le champ est vide.

## Crédit du développeur

Modifier le bloc existant :

```yaml
legal:
  # Conserver les autres rubriques de legal.
  developer:
    name: "Nom du développeur"
    role: "Conception et développement"
    url: "https://mon-site.ch/"
    showInFooter: true
```

Le crédit apparaît dans les mentions légales dès que le nom est renseigné. `showInFooter: true` l’ajoute au bas de toutes les pages. Le lien est facultatif ; s’il est présent, il doit commencer par `http://` ou `https://`. Un crédit affiché ou lié exige un nom.

## Modifier les rubriques visibles

Dans chaque page légale, `informationSections` contient les titres des rubriques et leurs libellés. Chaque ligne `field` fait référence à une valeur commune, par exemple `publisher.name`. Garder cette référence lors d’une simple correction de libellé. `optional: true` masque une ligne si sa valeur est vide ; `showWhen` masque une rubrique lorsque le champ indiqué est vide. Une valeur obligatoire absente affiche `pendingValueLabel`.

Le texte après le deuxième `---` s’écrit en [Markdown](MARKDOWN.md). On peut y ajouter, supprimer ou reformuler des paragraphes sans toucher au gabarit.

## Terminer la préparation

Compléter les données réelles, relire les deux pages affichées, mettre à jour `legal.updatedOn`, puis retirer la `notice` provisoire et passer `approved: true` dans chaque page. Configurer `PUBLIC_CONTENT_APPROVED=true` après cette relecture.

`npm run validate:production` refuse les champs requis manquants, certaines mentions provisoires (« À confirmer », « TODO »…), les URL invalides et les textes non approuvés. Ce contrôle vérifie la complétude des données et la cohérence technique ; il ne détermine pas le cadre juridique applicable et ne remplace pas la validation des informations par le propriétaire.
