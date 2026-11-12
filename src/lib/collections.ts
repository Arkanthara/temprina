import { getCollection } from 'astro:content';
import { isVisible } from './site';

// Le catalogue et les fiches utilisent toujours la même sélection de contenus.
export async function getBooks({ featuredFirst = false, limit = Infinity } = {}) {
  const books = await getCollection('books', isVisible);
  return books.sort((a, b) =>
    (featuredFirst ? Number(b.data.featured) - Number(a.data.featured) : 0)
    || b.data.publicationDate.valueOf() - a.data.publicationDate.valueOf()
  ).slice(0, limit);
}

export async function getPosts(limit = Infinity) {
  const posts = await getCollection('blog', isVisible);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf()).slice(0, limit);
}
