import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, file } from 'astro/loaders';
import { parse } from 'yaml';
import { pageSchema } from './lib/page-schema';
import { legalSchema } from './lib/legal-schema.mjs';

const books = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/books' }),
  schema: ({ image }) => z.object({
    title: z.string(),
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
  }),
});
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(300),
    date: z.coerce.date(),
    category: z.string(),
    readingMinutes: z.number().int().positive(),
    draft: z.boolean().default(false),
    demo: z.boolean().default(true),
  }),
});
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: pageSchema,
});
const legal = defineCollection({
  // Use the same YAML parser as the publication checker, including for dates.
  loader: file('./src/content/legal/site.yaml', { parser: source => ({ site: parse(source) }) }),
  schema: legalSchema,
});
const settings = defineCollection({
  loader: file('./src/content/settings/site.yaml', { parser: source => ({ site: parse(source) }) }),
  schema: z.object({ footerTagline: z.string().trim().min(1) }),
});
export const collections = { books, blog, pages, legal, settings };
