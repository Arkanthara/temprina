export const site = {
  title: 'Les murmures de l’imaginaire',
  author: import.meta.env.PUBLIC_AUTHOR_NAME || 'Nom de l’auteur à venir',
  email: import.meta.env.PUBLIC_CONTACT_EMAIL || '',
  demo: import.meta.env.PUBLIC_DEMO_MODE !== 'false',
  description: 'Des romans pour franchir les frontières du réel. Explorez des mondes de magie, découvrez leurs histoires et entrez dans l’univers de l’auteur.',
};
export const formatDate = (date: Date) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' }).format(date);
export const isVisible = ({ data }: { data: { draft: boolean; demo: boolean } }) => !data.draft && (site.demo || !data.demo);
