import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const books = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/books' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    subtitle: z.string().trim().optional(),
    description: z.string().trim().max(300).optional(),
    genre: z.string().trim().optional(),
    series: z.string().trim().optional(),
    volume: z.number().int().positive().optional(),
    publicationDate: z.coerce.date(),
    cover: image(),
    coverAlt: z.string().trim().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    demo: z.boolean().default(true),
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
export const collections = { books, blog };
