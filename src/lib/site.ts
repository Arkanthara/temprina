export const site = {
  title: 'Les murmures de l’imaginaire',
  author: import.meta.env.PUBLIC_AUTHOR_NAME || 'Nom de l’auteur à venir',
  email: import.meta.env.PUBLIC_CONTACT_EMAIL || '',
  demo: import.meta.env.PUBLIC_DEMO_MODE !== 'false',
  description: 'Des romans lumineux, des amitiés généreuses et des histoires pour retrouver espoir et courage. Découvrez l’univers de l’autrice.',
};
export const formatDate = (date: Date) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' }).format(date);
export const isVisible = ({ data }: { data: { draft: boolean; demo: boolean } }) => !data.draft && (site.demo || !data.demo);
