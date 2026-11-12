import { z } from 'astro/zod';

const value = z.string().trim().default('');
const webUrl = value.refine(text => {
  if (!text) return true;
  try { return ['http:', 'https:'].includes(new URL(text).protocol); } catch { return false; }
}, 'Utiliser une URL HTTP(S) complète, ou laisser vide.');
const email = value.refine(text => !text || z.email().safeParse(text).success, 'Renseigner une adresse e-mail valide, ou laisser vide.');

// Shared by Astro and the publication checker: no separate interpretation of these facts.
export const legalSchema = z.object({
  updatedOn: z.iso.date(),
  publisher: z.object({ name: value, status: value, address: value, country: value, email, publicationDirector: value, registration: value }),
  developer: z.object({ name: value, role: z.string().trim().min(1), url: webUrl, showInFooter: z.boolean().default(false) }),
  hosting: z.object({ name: value, address: value, service: value, url: webUrl, privacyUrl: webUrl, dpaUrl: webUrl }),
  privacy: z.object({
    controllerName: value, contactEmail: email, applicableLaw: value, processingBasis: value,
    emailProvider: value, contactRetention: value, hostingRetention: value,
    processingCountries: value, transferSafeguards: value, hostingCookies: value, audienceMeasurement: value,
    authorityName: value, authorityUrl: webUrl,
  }),
}).superRefine((data, context) => {
  if ((data.developer.url || data.developer.showInFooter) && !data.developer.name) {
    context.addIssue({ code: 'custom', path: ['developer', 'name'], message: 'Renseigner le nom du développeur avant son URL ou son affichage en pied de page.' });
  }
});

export const legalFieldNames = [
  'site.url',
  'publisher.name', 'publisher.status', 'publisher.address', 'publisher.country', 'publisher.email', 'publisher.publicationDirector', 'publisher.registration',
  'developer.name', 'developer.role', 'developer.url',
  'hosting.name', 'hosting.address', 'hosting.service', 'hosting.url', 'hosting.privacyUrl', 'hosting.dpaUrl',
  'privacy.controllerName', 'privacy.contactEmail', 'privacy.applicableLaw', 'privacy.processingBasis', 'privacy.emailProvider',
  'privacy.contactRetention', 'privacy.hostingRetention', 'privacy.processingCountries', 'privacy.transferSafeguards',
  'privacy.hostingCookies', 'privacy.audienceMeasurement', 'privacy.authorityName', 'privacy.authorityUrl',
];

// These are completeness checks, not a legal opinion or proof of the hosting configuration.
export function missingLegalFields(data, contactEmail = '') {
  const fields = {
    'publisher.name': data.publisher.name, 'publisher.address': data.publisher.address, 'publisher.country': data.publisher.country,
    'publisher.email': data.publisher.email || contactEmail,
    'hosting.name': data.hosting.name, 'hosting.address': data.hosting.address, 'hosting.service': data.hosting.service,
    'hosting.url': data.hosting.url, 'hosting.privacyUrl': data.hosting.privacyUrl, 'hosting.dpaUrl': data.hosting.dpaUrl,
    'privacy.contactEmail': data.privacy.contactEmail || data.publisher.email || contactEmail,
    ...Object.fromEntries(['applicableLaw', 'processingBasis', 'emailProvider', 'contactRetention', 'hostingRetention', 'processingCountries', 'transferSafeguards', 'hostingCookies', 'audienceMeasurement', 'authorityName', 'authorityUrl'].map(key => [`privacy.${key}`, data.privacy[key]])),
  };
  return Object.entries(fields).filter(([, text]) => !text || /à (?:renseigner|compléter|confirmer)|a (?:renseigner|completer|confirmer)|\bTODO\b|\[(?:nom|adresse|pays|durée)[^\]]*\]/i.test(text)).map(([key]) => key);
}

const text = z.string().trim().min(1);
const template = (...tokens) => text.refine(value => tokens.every(token => value.includes(`{${token}}`)), `Conserver les variables : ${tokens.map(token => `{${token}}`).join(', ')}.`);
const publicImage = text.regex(/^\/images\/[\w./-]+\.(?:png|jpe?g|webp|avif|svg|ico)$/i, 'Utiliser un fichier dans public/images/, avec un chemin /images/nom-du-fichier.ext.').refine(value => !value.split('/').includes('..'), 'Le chemin doit rester dans /images/.');

export const siteSchema = z.object({
  legal: legalSchema,
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

// Une seule règle de priorité, utilisée par le site et le contrôle de publication.
export function resolveIdentity(settings, env = {}) {
  return {
    author: settings.identity.authorName || env.PUBLIC_AUTHOR_NAME || settings.identity.authorFallback,
    email: settings.identity.contactEmail || env.PUBLIC_CONTACT_EMAIL || '',
  };
}
