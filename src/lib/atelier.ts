import { getCollection, getEntry } from 'astro:content';
import { isVisible } from './site';

export const atelierRoutes = {
  home: '/atelier/', couture: '/atelier/couture/', drawings: '/atelier/dessins/', contact: '/atelier/contact/',
} as const;
export type AtelierProject = 'couture' | 'dessin';

export async function getAtelier() {
  const entry = await getEntry('atelier', 'site');
  if (!entry) throw new Error('Renseigner src/content/settings/atelier.yaml.');
  const email = (import.meta.env.PUBLIC_ATELIER_EMAIL || '').trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('PUBLIC_ATELIER_EMAIL doit être une adresse e-mail valide.');
  return { ...entry.data, email };
}

export async function getCreations(category?: AtelierProject) {
  return (await getCollection('creations', isVisible))
    .filter(entry => !category || entry.data.category === category)
    .sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id, 'fr'));
}

export function creationContact(title: string, category: AtelierProject) {
  return `${atelierRoutes.contact}?projet=${category}&creation=${encodeURIComponent(title)}`;
}
