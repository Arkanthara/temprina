import { parse } from 'yaml';
import settingsSource from '../content/settings/site.yaml?raw';
import { settingsSchema } from './settings-schema.mjs';

// A direct dependency keeps these shared values fresh during Astro dev updates.
export const settings = settingsSchema.parse(parse(settingsSource));

export const site = {
  author: settings.identity.authorName || import.meta.env.PUBLIC_AUTHOR_NAME || settings.identity.authorFallback,
  email: settings.identity.contactEmail || import.meta.env.PUBLIC_CONTACT_EMAIL || '',
  demo: import.meta.env.PUBLIC_DEMO_MODE !== 'false',
  description: settings.identity.description,
};

// Replace in one pass so braces and dollar signs in supplied values stay literal.
export const fillText = (template: string, values: Record<string, string | number>) => template.replace(/\{(\w+)\}/g, (match, key) => Object.hasOwn(values, key) ? String(values[key]) : match);
export const formatDate = (date: Date) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' }).format(date);
export const isVisible = ({ data }: { data: { draft: boolean; demo: boolean } }) => !data.draft && (site.demo || !data.demo);
