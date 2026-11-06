import { z } from 'astro/zod';

const text = z.string().trim().min(1);
const heading = z.object({ lines: z.array(text).min(1), accent: text.optional() });
const metadata = { title: text, description: text.max(300) };
const page = { ...metadata, eyebrow: text, heading };
const section = z.object({ eyebrow: text, heading, linkLabel: text });
const withToken = (token: string) => text.refine(value => value.includes(token), `Le texte doit contenir ${token}.`);

// Every template validates the fields it actually renders. A missing label fails the build.
export const pageSchema = z.discriminatedUnion('template', [
  z.object({
    ...metadata, template: z.literal('home'),
    hero: z.object({ eyebrow: text, heading, description: text, primaryLabel: text, secondaryLabel: text, caption: text, scrollLabel: text, scrollAccessibleLabel: text }),
    books: section.extend({ empty: text }),
    author: section,
    journal: section.extend({ description: text, readLabel: text, demoLabel: text, empty: text }),
    contact: z.object({ heading: text, description: text, linkLabel: text }),
  }),
  z.object({
    ...page, template: z.literal('author'), imageAlt: text, imageCaption: text,
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
  z.object({ ...page, template: z.literal('legal'), notice: text.optional(), approved: z.boolean().default(false) }),
  z.object({ ...page, template: z.literal('error'), lead: text, homeLabel: text, catalogueLabel: text }),
]);
