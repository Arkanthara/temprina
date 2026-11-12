import { site, settings } from './site';

type Field = { value: string; href?: string };

export function getLegalInformation(siteUrl = '') {
  const data = settings.legal;
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
