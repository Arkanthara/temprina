# Vérifications de la première version

Vérifications des champs facultatifs des livres réalisées le 26 octobre 2026, sur Node.js 22 et Chromium via Playwright. Les contrôles de production datent du 22 octobre ; les dates des captures sont précisées ci-dessous.

| Contrôle | Résultat |
| --- | --- |
| `npm run check` | Aucun diagnostic TypeScript/Astro |
| `npm run build` | 14 pages HTML générées en mode démonstration, avec le livre réel présent dans l’espace de travail |
| Tests du build | 9 contrôles réussis : les 6 contrôles existants et 3 régressions sur le livre minimal, le livre complet et les éléments conditionnels |
| Tests navigateur de démonstration | 16 scénarios réussis, profils ordinateur et mobile ; 2 scénarios de production ignorés en mode démonstration |
| Tests avec contact configuré et mode démo désactivé | 2 scénarios réussis avec des coordonnées temporaires de test |
| Audit automatisé d’accessibilité | Aucune violation axe WCAG A/AA détectée sur les 11 routes représentatives testées, dont les fiches minimale et complète, aux deux formats |
| Écrans étroits | Aucun débordement sur les 11 routes aux formats ordinateur et mobile ; contrôle historique à 320 px du 23 octobre conservé |
| Validation de production | Refus attendu tant que les coordonnées, la biographie et les pages légales réelles manquent |

Les nouveaux scénarios vérifient le sous-titre, la description, la série et le tome conditionnels, le genre facultatif, le texte alternatif de secours, les métadonnées SEO de secours et l’absence de blocs vides. Les exemples sont La Dernière Braise (trois champs requis uniquement, sans corps Markdown) et Le Chant des Sylves (tous les champs du schéma renseignés).

Les scénarios vérifient l’affichage de tous les romans par date de publication décroissante, le compteur statique, l’absence de contrôles de filtrage et de recherche et l’absence de script propre au catalogue. Les anciens paramètres de filtre ne masquent aucun livre, avec ou sans JavaScript, et l’URL reste inchangée. Les autres contrôles couvrent la transmission du titre vers Contact, la navigation au clavier et sans JavaScript, les liens de partage et le logo fourni dans l’en-tête, le pied de page, l’accueil et le favicon. Le test de production est ignoré en mode démonstration ; les résultats du contact configuré restent ceux du 22 octobre.

## Aperçus

- [Accueil ordinateur](previews/accueil-ordinateur.png)
- [Accueil mobile](previews/accueil-mobile.png)
- [Catalogue mobile](previews/catalogue-mobile.png)
- [Fiche livre mobile](previews/fiche-livre-mobile.png)

La capture du catalogue mobile est actualisée le 23 octobre, après retrait des filtres. Les autres captures historiques proviennent du build local du 22 octobre, avant le remplacement du logo ; elles ne représentent pas le logo actuel. Le dossier `dist/` livré localement reste en mode démonstration.

## Limites de la vérification

Les formats mobiles ont été simulés sous Chromium ; aucun test sur appareil physique, Safari ou Firefox n’a été effectué. Un audit automatisé ne remplace pas une revue complète avec lecteur d’écran. Les aperçus sociaux, la messagerie réelle et le déploiement Cloudflare restent à vérifier après fourniture des coordonnées et du domaine. Les workflows GitHub Actions et le DevContainer sont fournis mais n’ont pas été exécutés sur leurs plateformes distantes.

Les captures servent à la revue visuelle, sans publication. Aucun push GitHub ni déploiement Cloudflare n’a été effectué.
