import { getEntry, type CollectionEntry } from 'astro:content';

type PageData = CollectionEntry<'pages'>['data'];

export async function getPage<T extends PageData['template']>(id: string, template: T) {
  const entry = await getEntry('pages', id);
  if (!entry || entry.data.template !== template) {
    throw new Error(`La page « ${id} » doit exister avec le modèle « ${template} » dans src/content/pages/.`);
  }
  return { ...entry, data: entry.data as Extract<PageData, { template: T }> };
}
