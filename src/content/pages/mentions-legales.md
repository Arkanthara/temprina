---
template: legal
title: Mentions légales
description: Informations relatives à l’éditeur et à l’hébergement du site.
eyebrow: INFORMATIONS DU SITE
heading:
  lines:
    - Mentions
  accent: légales.
notice: "Informations à compléter et à vérifier : identité de l’éditeur, hébergement et traitements
  de données. Cette version reste préparatoire."
approved: false
updatedLabel: Dernière mise à jour
pendingValueLabel: À renseigner avant publication
informationSections:
  - title: Éditeur et publication
    items:
      - label: Adresse du site
        field: site.url
      - label: Éditeur du site
        field: publisher.name
      - label: Statut
        field: publisher.status
        optional: true
      - label: Adresse de correspondance
        field: publisher.address
      - label: Pays d’établissement
        field: publisher.country
      - label: Contact
        field: publisher.email
      - label: Responsable de la publication
        field: publisher.publicationDirector
        optional: true
      - label: Immatriculation
        field: publisher.registration
        optional: true
  - title: Conception et développement
    showWhen: developer.name
    items:
      - label: Développeur
        field: developer.name
      - label: Contribution
        field: developer.role
      - label: Site du développeur
        field: developer.url
        optional: true
  - title: Hébergement
    items:
      - label: Prestataire
        field: hosting.name
      - label: Adresse
        field: hosting.address
      - label: Service utilisé
        field: hosting.service
      - label: Site de l’hébergeur
        field: hosting.url
      - label: Confidentialité chez l’hébergeur
        field: hosting.privacyUrl
      - label: Accord de traitement des données
        field: hosting.dpaUrl
---
## Présentation du site

L’autrice exerce à son compte et ne dispose pas d’une maison d’édition à ce jour. Ce site présente ses romans, son parcours et son carnet de lecture. Il permet de prendre contact par e-mail. Aucune commande, aucun paiement et aucun compte lecteur ne sont gérés sur ce site.

## Développement et licence du logiciel

Le nom du développeur est indiqué dans les crédits ci-dessus ; la licence du dépôt en identifie le titulaire du copyright. Le code du site est distribué sous licence MIT, avec conservation de la notice de copyright et des conditions de cette licence. Cette licence logicielle ne vaut pas autorisation générale de reproduire les livres, textes éditoriaux, illustrations ou couvertures dont les droits doivent être vérifiés séparément.

## Textes, livres et illustrations

Les droits sur les textes, les couvertures, les illustrations et le logo appartiennent à leurs titulaires respectifs. Toute réutilisation doit respecter les autorisations et les exceptions prévues par les règles applicables. Pour une demande de reproduction ou de crédit, écrivez à l’éditeur via les coordonnées ci-dessus.

La présentation et la biographie de l’autrice ont été fournies dans le document « Site Temprina ». Les livres, couvertures et articles signalés comme démonstrations servent à présenter le site. L’illustration de forêt a été générée pour cette maquette. Les crédits propres aux œuvres réelles doivent être précisés avec leurs titulaires avant la publication définitive.

## Liens vers d’autres sites

Le site propose des liens vers les services de l’hébergeur, des fonctions de partage et, lorsqu’il est renseigné, le site du développeur. Leurs contenus et leurs pratiques sont régis par leurs propres conditions.

## Données personnelles

La [politique de confidentialité](/confidentialite/) décrit la navigation, l’hébergement, la préparation des e-mails et les moyens de contacter le responsable du traitement.

## Nous contacter

Pour une question sur le contenu du site, les crédits ou une correction, utilisez les coordonnées de l’éditeur ci-dessus ou la [page Contact](/contact/).
