# Illustrations et polices

| Élément | Source | Usage |
| --- | --- | --- |
| Logo fourni par l’auteur | `public/images/logo.png` | En-tête, pied de page, accueil et favicon |
| Forêt créée pour le projet avec Imagegen | `src/assets/foret-enchantee.png` | Accueil et illustration de la page auteur |
| Image de partage issue de la forêt | `public/images/social.jpg` | Aperçu social par défaut, 1200 × 630 |
| Couvertures de démonstration | SVG et PNG dans `src/assets/` | Livres fictifs explicitement signalés |
| Couvertures des livres de l’auteur | Autres images de `src/assets/` | Fiches et cartes des livres correspondants |
| Cormorant Garamond et Manrope | Paquets Fontsource | Polices servies localement |

Pour remplacer une image, suivre le [guide d’édition](CONTENUS.md#modifier-les-photos-et-illustrations). Vérifier les droits et les crédits des fichiers ajoutés. Les licences des polices sont distribuées dans `public/licenses/`. La licence MIT du code ne donne pas de droits supplémentaires sur les textes et les illustrations.

## Sources de démonstration

Les trois couvertures fictives ont des sources SVG et des exports PNG. Le script de fabrication d’origine `scripts/create-demo-covers.mjs` est conservé pour leur reproduction ; il utilise Sharp et ne participe pas au fonctionnement ni au build habituel du site.

L’illustration de forêt a été générée à partir de cette description, conservée pour sa provenance :

> Use case: stylized-concept. Asset type: wide website hero illustration for a French fantasy novelist. Create an exquisite cinematic painterly enchanted forest at blue hour, ancient huge trees with moss, delicate arching branches, a narrow winding path leading toward a small luminous elven stone arch on the right third, tiny warm golden fireflies, soft volumetric mist and celestial glow. Dark deep forest teal and pine green with muted antique gold. Sophisticated book illustration with rich organic textures, immersive and atmospheric, not a video game screenshot. Wide panoramic composition, left third dark and quiet for separately rendered website text; interest and luminous portal concentrated on right. No people, no text, no letters, no logo, no watermark. Landscape 1536x1024.

Astro produit automatiquement les variantes optimisées des images de `src/assets/`. Aucun service externe de polices ou d’images n’est nécessaire à leur affichage.
