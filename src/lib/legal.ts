import { getEntry } from 'astro:content';
import { site } from './site';

type Field = { value: string; href?: string };

export async function getLegalInformation(siteUrl = '') {
  const entry = await getEntry('legal', 'site');
  if (!entry) throw new Error('Renseigner src/content/legal/site.yaml.');
  const { data } = entry;
  const publisherEmail = data.publisher.email || site.email;
  const privacyEmail = data.privacy.contactEmail || publisherEmail;
  const groups = {
    publisher: { ...data.publisher, email: publisherEmail },
    developer: data.developer,
    hosting: data.hosting,
    privacy: { ...data.privacy, controllerName: data.privacy.controllerName || data.publisher.name, contactEmail: privacyEmail },
  };
  const fields: Record<string, Field> = { 'site.url': { value: siteUrl, ...(siteUrl ? { href: siteUrl } : {}) } };
  for (const [group, values] of Object.entries(groups)) {
    for (const [name, value] of Object.entries(values)) {
      if (typeof value !== 'string') continue;
      const isEmail = name === 'email' || name === 'contactEmail';
      const isUrl = name.toLowerCase().endsWith('url');
      fields[`${group}.${name}`] = { value, ...(value && (isEmail || isUrl) ? { href: isEmail ? `mailto:${value}` : value } : {}) };
    }
  }
  return { ...data, fields };
}
