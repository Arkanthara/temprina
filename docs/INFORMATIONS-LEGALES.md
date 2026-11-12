# Compléter les mentions légales et la confidentialité

Les deux pages se modifient sans toucher aux fichiers Astro. Leur texte est déjà adapté au fonctionnement du site : présentation de livres, articles, liens de partage et contact préparant un e-mail. Il reste à renseigner les informations réelles de l’éditeur et de ses prestataires. Aucun nom, durée de conservation, pays de traitement ou service Cloudflare activé n’a été inventé.

## Informations confirmées le 6 novembre 2026

- L’autrice exerce à son compte et n’a pas de maison d’édition. Cela ne supprime pas le rôle d’éditeur du site : il faut identifier la personne qui publie et assume la responsabilité du site. Son identité légale, son adresse, son pays et son contact restent à renseigner.
- Le développeur est **Michel Jean Joseph Donnet**, nom indiqué dans `LICENSE` et désigné par le propriétaire. Il est renseigné dans les crédits des mentions légales ; aucun site personnel n’a été supposé. Le pied de page reste un choix via `showInFooter`.
- L’URL déclarée est **https://donnet.pages.dev**. Elle sert désormais d’origine par défaut dans la configuration Astro et `.env.example`. `PUBLIC_SITE_URL` permet de la remplacer, notamment pour un domaine personnel.
- Le propriétaire confirme **Cloudflare Pages, offre gratuite, déploiement par défaut**, sans service supplémentaire mis en place. Ces éléments sont renseignés ; ils ne suffisent pas à établir les durées des journaux, les pays de traitement ou les cookies réellement déposés par l’infrastructure.

Aucun document Cloudflare privé n’est nécessaire pour préparer ces pages. Pour les finaliser, il reste à confirmer les paramètres et éléments pertinents décrits ci-dessous, ainsi que la messagerie et le cadre applicable.

## Où modifier quoi ?

| Besoin | Fichier |
| --- | --- |
| Nom et coordonnées de l’éditeur, hébergeur, développeur, traitements de données | `src/content/legal/site.yaml` |
| Texte, titres, libellés, notice et validation des mentions légales | `src/content/pages/mentions-legales.md` |
| Texte, titres, libellés, notice et validation de la confidentialité | `src/content/pages/confidentialite.md` |

Le fichier `site.yaml` est la source commune : une modification de l’adresse ou de l’hébergeur est répercutée sur les deux pages au prochain build. Les champs vides affichent « À renseigner avant publication » ; les informations explicitement facultatives restent masquées. Toutes les valeurs de ce fichier deviennent publiques. Les noms de champs servent au programme et doivent être conservés.

Les textes après la deuxième ligne `---` des fichiers `.md` s’éditent comme des paragraphes ordinaires. `##` crée un intertitre, `**texte**` du gras et `[libellé](https://exemple.ch/)` un lien. Le titre principal est déjà fourni par le gabarit. Dans les en-têtes YAML, `informationSections` organise les informations communes : les titres et libellés sont modifiables ; `field` doit conserver une référence reconnue, par exemple `publisher.name`.

## Ajouter le nom du développeur

Dans `src/content/legal/site.yaml`, modifier uniquement le bloc concerné, par exemple :

```yaml
developer:
  name: "Votre nom ou votre studio"
  role: "Conception et développement"
  url: "https://votre-site.ch/"
  showInFooter: true
```

Le nom apparaît dans les mentions légales. `url` est facultatif : laisser `""` pour afficher le nom sans lien. `showInFooter: true` ajoute aussi le crédit sur toutes les pages, y compris sur mobile ; `false` le réserve aux mentions légales. Aucun crédit n’apparaît tant que le nom est vide. Une URL ou un crédit de pied de page exige un nom. Les liens acceptent uniquement HTTP ou HTTPS ; les valeurs sont affichées comme texte et échappées dans le HTML.

Le développeur n’est pas automatiquement l’éditeur, le responsable de la publication ni le responsable du traitement. Remplir ces rôles selon leur attribution réelle. Si le développeur gère la messagerie, accède aux journaux ou assure une maintenance avec accès aux données personnelles, décrire cette intervention dans les destinataires et dans le texte de confidentialité.

## Informations à fournir

| Groupe | Informations à préciser | Où les renseigner |
| --- | --- | --- |
| Éditeur | Identité publique exacte, adresse de correspondance appropriée et pays d’établissement | `publisher.name`, `address`, `country` |
| Contact | Adresse publique de contact ; adresse dédiée aux données si différente | `publisher.email`, `privacy.contactEmail` |
| Publication | Statut, responsable de publication et immatriculation si pertinents | `publisher.status`, `publicationDirector`, `registration` |
| Développeur | Nom à créditer, éventuel site et affichage en pied de page | `developer` |
| Hébergement | Entité contractuelle, coordonnées et service réellement utilisé | `hosting` |
| Messagerie | Fournisseur, personnes/prestataires ayant accès aux messages, durée ou critères de conservation | `privacy.emailProvider`, `contactRetention` |
| Données techniques | Journaux collectés, destinataires, durées ou critères selon les services | `privacy.hostingRetention` et texte Markdown |
| Cookies et audience | Protections et analytics réellement activés, cookies observés, finalités et durées, ou absence vérifiée | `privacy.hostingCookies`, `audienceMeasurement` |
| Pays et transferts | Pays de traitement et garanties des transferts effectifs | `privacy.processingCountries`, `transferSafeguards` |
| Cadre applicable | Règles applicables, justification des traitements et autorité compétente | `privacy.applicableLaw`, `processingBasis`, `authorityName`, `authorityUrl` |

`privacy.controllerName` reprend `publisher.name` s’il est vide. `publisher.email` reprend l’adresse publique (`identity.contactEmail` dans `src/content/settings/site.yaml`, ou `PUBLIC_CONTACT_EMAIL` en secours) s’il est vide. `privacy.contactEmail` reprend ensuite ce contact éditeur si aucune adresse dédiée n’est renseignée. Il n’y a pas de reprise automatique du pseudonyme d’auteur comme identité légale.

Le pays de l’éditeur et le public visé doivent être confirmés avant de choisir le cadre applicable. Les références suisses ci-dessous sont utiles si la LPD suisse s’applique ; elles ne constituent pas une confirmation de la juridiction de ce site.

## Quelles informations Cloudflare sont utiles ?

Une confirmation textuelle des réglages suffit pour commencer. Au besoin, fournir des captures ciblées et masquées ou les extraits pertinents des documents du compte. Ne jamais communiquer de jeton API, mot de passe, facture complète ou journal nominatif de visiteurs.

1. **Service et domaine** : confirmer si le site utilise Pages, Workers Static Assets ou un autre service, et donner son URL publique. Le propriétaire a confirmé Pages gratuit pour `donnet.pages.dev`. `wrangler.jsonc` prépare une autre voie de publication sur Workers et ne décrit pas ce déploiement Pages.
2. **Entité contractuelle et conditions** : relever le nom de l’entité dans le contrat/abonnement ; les coordonnées publiques de Cloudflare, Inc. sont préremplies, mais une autre entité doit être substituée si le compte l’impose.
3. **Services activés** : relever les paramètres effectifs de Web Analytics ou autres mesures d’audience, Cloudflare Access/Zero Trust, Bot Fight Mode, protection antibots, challenges et Turnstile, si utilisés. L’absence de script dans le dépôt ne suffit pas à confirmer l’absence d’un service injecté par l’hébergeur.
4. **Cookies constatés** : observer les cookies et en-têtes de réponse sur le vrai domaine, si nécessaire en navigation privée et sur les parcours protégés ; rapprocher leur nom, finalité et durée de la documentation officielle. Une seule visite sans cookie ne prouve pas leur absence pour tous les parcours.
5. **Journaux** : identifier les produits de journalisation ou d’export activés, les durées propres au compte et les éventuels destinataires de ces exports. Ne pas réutiliser une durée d’un autre produit Cloudflare.
6. **DPA, sous-traitants et localisation** : consulter la version applicable de l’accord de traitement, les sous-traitants pertinents et les éventuels réglages de localisation. Renseigner les pays et les garanties effectivement applicables à ces services, sans déduire le lieu de traitement de l’adresse du siège.

Les documents génériques Cloudflare sont déjà liés dans les pages. Ils n’expliquent pas à eux seuls les réglages de ce compte. La [politique Cloudflare](https://www.cloudflare.com/privacypolicy/) distingue les visiteurs des sites de ses clients des visiteurs de son propre site : les déclarations sur les cookies publicitaires de cloudflare.com ne doivent pas être copiées telles quelles dans la politique de Temprina.

## Relire puis publier

1. Remplir les informations communes, notamment les durées/critères et les services réels. Utiliser `>-` pour un paragraphe YAML long, `|-` pour conserver des retours à la ligne, et des guillemets pour les valeurs contenant `: `.
2. Relire les deux pages. Adapter les paragraphes préparatoires sur l’hébergement aux faits vérifiés et compléter les crédits des œuvres. Ne pas simplement supprimer la notice en laissant des faits inconnus.
3. Actualiser `updatedOn` dans `site.yaml`, au format `"AAAA-MM-JJ"`. La date est commune aux deux pages, validée comme date réelle et affichée en français.
4. Après validation éditoriale/juridique adaptée à la situation, supprimer `notice` et passer `approved: true` dans chacune des deux pages. Définir également `PUBLIC_CONTENT_APPROVED=true` dans l’environnement de publication.
5. Exécuter les vérifications puis suivre [la procédure de déploiement](DEPLOIEMENT.md).

```sh
npm run check
npm run build
npm test
npm run test:editing
npm run test:e2e
npm run validate:production
```

`validate:production` lit l’environnement du processus ; pour une configuration locale `.env`, utiliser `node --env-file=.env scripts/validate-production.mjs`. Le contrôle vérifie les indicateurs des pages, le schéma du fichier commun et ses champs de complétude ; il signale les valeurs manquantes ainsi que les marqueurs « À confirmer » ou « TODO ». Les coordonnées, le service d’hébergement, les traitements, leurs durées/pays et l’autorité sont requis par ce contrôle de préparation du projet. Les crédits du développeur, le statut, l’immatriculation et le directeur de publication restent facultatifs dans le schéma, à compléter selon les obligations réelles.

Ces contrôles évitent une publication par inadvertance avec des champs manquants ; ils ne vérifient ni la véracité des déclarations ni leur conformité juridique. `npm run build` seul peut générer une version préparatoire pour relecture.

## Sources vérifiées le 6 novembre 2026

- [Cloudflare : politique de confidentialité](https://www.cloudflare.com/privacypolicy/) — traitements des utilisateurs des sites clients et coordonnées publiques.
- [Cloudflare : accord de traitement des données](https://www.cloudflare.com/cloudflare-customer-dpa/) — responsabilités, catégories de données et transferts ; vérifier la version applicable au compte.
- [Cloudflare : cookies des services](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/) — cookies selon les produits et protections activés.
- [PFPDT : déclaration de protection des données sur Internet](https://www.edoeb.admin.ch/fr/declaration-de-protection-des-donnees-sur-internet) — contenu d’une déclaration lorsque le droit suisse s’applique.
- [PFPDT : devoir d’informer](https://www.edoeb.admin.ch/fr/devoir-dinformer) — responsable, finalités, destinataires et informations sur les traitements à l’étranger.
