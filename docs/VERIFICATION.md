# Vérifications de la première version

Vérifications réalisées le 22 octobre 2026, sur Node.js 22 et Chromium via Playwright.

| Contrôle | Résultat |
| --- | --- |
| `npm run check` | Aucun diagnostic TypeScript/Astro |
| `npm run build` | 13 pages HTML générées en mode démonstration |
| Tests du build | 4 contrôles réussis : structure/SEO, liens et fragments, sitemap/robots, métadonnées livres |
| Tests navigateur de démonstration | 12 scénarios réussis, profils ordinateur et mobile |
| Tests avec contact configuré et mode démo désactivé | 2 scénarios réussis avec des coordonnées temporaires de test |
| Audit automatisé d’accessibilité | Aucune violation axe WCAG A/AA détectée sur les 10 routes représentatives testées, aux deux formats |
| Écrans étroits | Aucun débordement horizontal constaté à 320 px sur accueil, catalogue, fiche livre et contact |
| Validation de production | Refus attendu tant que les coordonnées, la biographie et les pages légales réelles manquent |

Les scénarios couvrent les filtres combinés et leur réinitialisation, l’état sans résultat, les paramètres dans l’URL, la transmission du titre vers Contact, la navigation au clavier et sans JavaScript, ainsi que les liens de partage. Le test de production est ignoré en mode démonstration et a été exécuté séparément avec sa configuration dédiée.

## Aperçus

- [Accueil ordinateur](previews/accueil-ordinateur.png)
- [Accueil mobile](previews/accueil-mobile.png)
- [Catalogue mobile](previews/catalogue-mobile.png)
- [Fiche livre mobile](previews/fiche-livre-mobile.png)

Ces captures proviennent du build local. Le dossier `dist/` livré localement reste en mode démonstration.

## Limites de la vérification

Les formats mobiles ont été simulés sous Chromium ; aucun test sur appareil physique, Safari ou Firefox n’a été effectué. Un audit automatisé ne remplace pas une revue complète avec lecteur d’écran. Les aperçus sociaux, la messagerie réelle et le déploiement Cloudflare restent à vérifier après fourniture des coordonnées et du domaine. Les workflows GitHub Actions et le DevContainer sont fournis mais n’ont pas été exécutés sur leurs plateformes distantes.

Les captures servent à la revue visuelle, sans publication. Aucun push GitHub ni déploiement Cloudflare n’a été effectué.
