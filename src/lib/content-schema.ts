import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';
import { legalFieldNames } from './site-schema.mjs';

const text = z.string().trim().min(1);
const heading = z.object({ lines: z.array(text).min(1), accent: text.optional() });
const metadata = { title: text, description: text.max(300) };
const page = { ...metadata, eyebrow: text, heading };
const section = z.object({ eyebrow: text, heading, linkLabel: text });
const withToken = (token: string) => text.refine(value => value.includes(token), `Le texte doit contenir ${token}.`);

// Every template validates the fields it actually renders. A missing label fails the build.
export const pageSchema = ({ image }: SchemaContext) => z.discriminatedUnion('template', [
  z.object({
    ...metadata, template: z.literal('home'),
    hero: z.object({ image: image(), eyebrow: text, heading, description: text, primaryLabel: text, secondaryLabel: text, caption: text, scrollLabel: text, scrollAccessibleLabel: text }),
    books: section.extend({ empty: text }),
    author: section,
    journal: section.extend({ description: text, readLabel: text, demoLabel: text, empty: text }),
    contact: z.object({ heading: text, description: text, linkLabel: text }),
  }),
  z.object({
    ...page, template: z.literal('author'), image: image(), imageAlt: text, imageCaption: text,
    portrait: z.object({
      enabled: z.boolean(),
      image: z.preprocess(value => typeof value === 'string' && !value.trim() ? undefined : value, image().optional()),
      alt: text,
      caption: z.string().trim(),
      placeholder: text,
      position: z.enum(['center', 'top', 'bottom']).default('center'),
    }),
    biographyTitle: text, biography: z.array(text).min(1), linkLabel: text,
  }),
  z.object({
    ...page, template: z.literal('catalogue'), lead: text, listLabel: text,
    countSingular: withToken('{count}'), countPlural: withToken('{count}'), emptyTitle: text, empty: text,
  }),
  z.object({
    ...page, template: z.literal('blog'), lead: text, listLabel: text,
    readLabel: withToken('{title}'), demoLabel: text, empty: text,
  }),
  z.object({
    ...page, template: z.literal('contact'), lead: text,
    details: z.object({ label: text, unavailable: text, privacy: text, privacyLabel: text }),
    panel: z.object({ title: text, pendingTitle: text, pendingText: text, pendingLink: text }),
    form: z.object({
      subjectLabel: text, subjectDefault: text.max(180), messageLabel: text, messagePlaceholder: text,
      hint: text, submitLabel: text, noScript: text, status: text,
      selectedBook: withToken('{book}'), bookSubject: withToken('{book}'), bookMessage: withToken('{book}'),
    }),
  }),
  z.object({
    ...page, template: z.literal('legal'), notice: text.optional(), approved: z.boolean().default(false),
    updatedLabel: text, pendingValueLabel: text,
    informationSections: z.array(z.object({
      title: text,
      showWhen: z.enum(legalFieldNames).optional(),
      items: z.array(z.object({ label: text, field: z.enum(legalFieldNames), optional: z.boolean().default(false) })).min(1),
    })).min(1),
  }),
  z.object({ ...page, template: z.literal('error'), lead: text, homeLabel: text, catalogueLabel: text }),
]);

export const bookSchema = ({ image }: SchemaContext) => z.object({
  title: text,
  subtitle: z.string().trim().optional(),
  followedBy: z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().max(300).optional(),
    summary: z.string().trim().optional(),
  }).optional(),
  description: z.string().trim().max(300).optional(),
  genre: z.string().trim().optional(),
  series: z.string().trim().optional(),
  volume: z.number().int().positive().optional(),
  publicationDate: z.coerce.date(),
  cover: image(),
  coverAlt: z.string().trim().optional(),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  demo: z.boolean().default(false),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
  formats: z.array(z.string()).optional(),
  purchaseLinks: z.array(z.object({ label: z.string(), url: z.url() })).optional(),
});

export const blogSchema = z.object({
  title: text,
  description: text.max(300),
  date: z.coerce.date(),
  category: z.string(),
  readingMinutes: z.number().int().positive().optional(),
  draft: z.boolean().default(false),
  demo: z.boolean().default(false),
});
