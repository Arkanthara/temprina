import { z } from 'astro/zod';

const text = z.string().trim().min(1);
const template = (...tokens) => text.refine(value => tokens.every(token => value.includes(`{${token}}`)), `Conserver les variables : ${tokens.map(token => `{${token}}`).join(', ')}.`);
const publicImage = text.regex(/^\/images\/[\w./-]+\.(?:png|jpe?g|webp|avif|svg|ico)$/i, 'Utiliser un fichier dans public/images/, avec un chemin /images/nom-du-fichier.ext.').refine(value => !value.split('/').includes('..'), 'Le chemin doit rester dans /images/.');

export const settingsSchema = z.object({
  identity: z.object({
    authorName: z.string().trim(),
    authorFallback: text,
    contactEmail: z.string().trim().refine(value => !value || z.email().safeParse(value).success, 'Renseigner une adresse e-mail valide ou laisser vide.'),
    description: text.max(300),
    jobTitle: text,
  }),
  images: z.object({
    logo: z.object({ src: publicImage, width: z.number().int().positive(), height: z.number().int().positive(), type: text }),
    social: publicImage,
  }),
  headerSubtitle: text,
  footerTagline: text,
  footerMessage: text,
  footerCredit: text,
  navigation: z.object({ home: text, catalogue: text, author: text, blog: text, contact: text, legal: text, privacy: text, menu: text, label: text, homeAccessibleLabel: template('author') }),
  skipContent: text,
  demo: z.object({ heading: text, description: text }),
  books: z.object({
    backLabel: text, openLabel: text, discoverLabel: template('title'), coverAlt: template('title'),
    volumeLabel: template('volume'), followedBy: text,
    novelByline: template('author'), collectionByline: template('author'),
    novelDescription: template('title', 'author', 'date'), collectionDescription: template('title', 'author', 'date'),
    demoLabel: text, demoCover: text, demoPurchase: text,
    facts: z.object({ publication: text, genre: text, series: text, volume: text }),
    contact: z.object({ heading: text, description: text, linkLabel: text }),
  }),
  blog: z.object({ backLabel: text, readingLabel: template('minutes'), readingShortLabel: template('minutes'), demoNotice: text }),
  share: z.object({
    heading: text, shareLabel: text, copyLabel: text, facebookLabel: text, facebookAccessibleLabel: text, emailLabel: text,
    addressLabel: text, urlLabel: text, copied: text, copyError: text, shareError: text,
  }),
});
