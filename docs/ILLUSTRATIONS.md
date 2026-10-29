# Illustrations et typographies

## Logo de l’auteur

`public/images/logo.png` est le logo fourni par l’auteur. Il remplace l’emblème vectoriel de démonstration dans l’en-tête, le pied de page et le bandeau auteur de l’accueil, ainsi que l’ancien favicon. Le composant `src/components/Logo.astro` conserve son fond transparent et ses proportions carrées. Son alternative est vide lorsqu’il accompagne le nom de l’auteur ou sert de décoration.

## Forêt enchantée

Source : `src/assets/foret-enchantee.png`. Créée pour ce projet avec l’outil intégré **Imagegen** ; aucun CLI/API externe utilisé. L’original a été copié dans le dépôt. Astro génère les variantes WebP nécessaires. L’image sociale `public/images/social.jpg` est un export optimisé 1200 × 630 de cette source.

Prompt final utilisé :

> Use case: stylized-concept. Asset type: wide website hero illustration for a French fantasy novelist. Create an exquisite cinematic painterly enchanted forest at blue hour, ancient huge trees with moss, delicate arching branches, a narrow winding path leading toward a small luminous elven stone arch on the right third, tiny warm golden fireflies, soft volumetric mist and celestial glow. Dark deep forest teal and pine green with muted antique gold. Sophisticated book illustration with rich organic textures, immersive and atmospheric, not a video game screenshot. Wide panoramic composition, left third dark and quiet for separately rendered website text; interest and luminous portal concentrated on right. No people, no text, no letters, no logo, no watermark. Landscape 1536x1024.

## Couvertures fictives

Dessins vectoriels originaux de démonstration, créés dans `scripts/create-demo-covers.mjs`, avec sources SVG et exports PNG dans `src/assets/`. Ils ne représentent aucun ouvrage publié. Les sources permettent de les modifier sans régénération par IA. Leur export utilise Sharp ; les polices serif de substitution peuvent varier selon le poste.

## Polices

Cormorant Garamond et Manrope sont servies localement depuis les paquets Fontsource. Leurs licences sont conservées dans `public/licenses/` et distribuées avec le site. Aucun appel réseau à Google Fonts.
