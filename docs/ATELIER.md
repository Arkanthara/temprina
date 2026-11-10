# Les deux univers de Temprina

L’accueil `/` est désormais un portail. L’ancien accueil de l’autrice est conservé à `/romans/`, avec ses textes dans `src/content/pages/index.md`. Le catalogue, les fiches livres, la biographie et le blog gardent leurs adresses et leur identité forêt et or. Le sélecteur placé en haut de chaque page permet de passer d’un univers à l’autre, y compris sans JavaScript.

## L’Atelier des fées

Identité de démonstration validée pour cette maquette. L’atelier utilise sa propre palette ivoire et lilas, son logo, ses visuels, ses métadonnées, sa navigation et son contact. Le dessin est une partie de l’atelier de la même créatrice.

| Adresse | Contenu |
| --- | --- |
| `/atelier/` | Présentation de la créatrice, aperçu couture et dessin, déroulement d’un projet |
| `/atelier/couture/` | Galerie couture |
| `/atelier/dessins/` | Galerie de dessins |
| `/atelier/creations/{id}/` | Présentation détaillée d’une création et contact contextualisé |
| `/atelier/contact/` | Préparation d’une demande couture ou dessin |
| `/atelier/mentions-legales/`, `/atelier/confidentialite/` | Informations communes au site, présentées avec l’identité de l’atelier |

### Personnaliser l’identité

- Modifier le nom, la signature et la présentation dans `src/content/settings/atelier.yaml`.
- Remplacer `public/images/atelier-logo.svg` par le logo de la créatrice, ou modifier son chemin dans `Layout.astro`, `index.astro` et les pages de l’atelier si le format change. Le papillon actuel est un emblème vectoriel provisoire, sans lien avec le logo de l’autrice.
- Remplacer les visuels dans `src/assets/atelier/` et les références dans les contenus. `aurore.png` sert aussi d’illustration principale ; `public/images/atelier-social.jpg` en est une déclinaison pour le partage.
- Modifier les textes du portail dans `src/content/pages/portail.md`.
- Renseigner `PUBLIC_ATELIER_EMAIL` dans les variables de build, puis reconstruire. Elle est indépendante de `PUBLIC_CONTACT_EMAIL`, réservé à l’autrice.

### Ajouter une création ou un dessin

Créer un fichier Markdown dans `src/content/creations/`. Son nom devient l’identifiant de la fiche. Les images sont locales et optimisées par Astro.

```yaml
---
title: Le nom de la création
description: Une courte présentation.
category: couture # ou dessin
medium: SOIE & BRODERIES
image: ../../assets/atelier/ma-creation.jpg
imageAlt: Une description précise du visuel.
imagePosition: center # center, left ou right
order: 1
demo: false
draft: false
---
## Une histoire à raconter

Le texte de présentation de la réalisation.
```

`demo: true` signale une inspiration fictive et la masque hors mode démonstration. `draft: true` masque la création dans tous les modes, y compris sa fiche. Les six exemples fournis sont fictifs ; les trois dessins sont des illustrations vectorielles de démonstration, et les trois visuels couture ont été générés pour la maquette. Ils ne sont pas attribués à la créatrice.

Une fois l’identité réelle et les réalisations renseignées, mettre `demoIdentity: false` dans la configuration de l’atelier. Tant que l’identité est provisoire, les pages de l’atelier conservent une bannière explicite et `noindex`.

### Contact actuel

Le formulaire demande le nom, l’adresse de réponse, le type de projet, une inspiration facultative, un message et une date facultative. Le lien d’une fiche présélectionne le type et la création. Les paramètres d’URL sont limités aux catégories et créations connues.

Avec `PUBLIC_ATELIER_EMAIL`, « Préparer mon e-mail » ouvre la messagerie du visiteur avec une demande encodée et prête à relire. L’envoi reste une action du visiteur. « Copier ma demande » fonctionne également sans adresse configurée, avec un champ texte sélectionnable si le presse-papiers est indisponible. Aucun envoi automatique, stockage, compte ou service tiers n’est ajouté. Sans JavaScript, l’adresse directe reste utilisable lorsqu’elle est configurée.

## Étape ultérieure : demande de couture détaillée

Cette étape est préparée dans l’organisation du code et cette spécification ; elle n’est pas implémentée. Aucune route, aucun champ de mesures et aucun lien inactif n’est exposé aujourd’hui.

- Adresse envisagée : `/atelier/sur-mesure/`, dans le layout `universe="atelier"`.
- Garder le contact actuel comme entrée simple, et ajouter une entrée de navigation lorsque la page sera réellement disponible.
- Réutiliser la configuration `getAtelier()`, les routes communes dans `src/lib/atelier.ts` et l’approche de message préparé du contact.
- Définir les mesures avec la couturière : noms, unité en centimètres, aide à la prise de mesure et valeurs acceptables pour chaque type de vêtement.
- Prévoir les choix de tissu principal et secondaire, de boutons ou de fermeture éclair, les couleurs, la doublure et les finitions.
- Structurer une demande typée et un générateur de texte partagé avant de créer la page. Ne pas stocker les mesures dans l’URL.
- Présenter un récapitulatif modifiable puis produire un message complet contenant les mesures et options choisies. Le mécanisme d’envoi sera décidé à cette étape ; la préparation d’un e-mail est compatible avec l’hébergement statique actuel.

Les collections `creations` et les catégories `couture` / `dessin` restent indépendantes de cette évolution. Aucun changement des contenus de livres ne sera nécessaire.
