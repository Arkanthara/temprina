import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { bookSchema, blogSchema, pageSchema } from './lib/content-schema';

export const collections = {
  books: defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: './src/content/books' }),
    schema: bookSchema,
  }),
  blog: defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
    schema: blogSchema,
  }),
  pages: defineCollection({
    loader: glob({ pattern: '*.md', base: './src/content/pages' }),
    schema: pageSchema,
  }),
};
