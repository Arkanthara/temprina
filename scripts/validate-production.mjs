import { readFile } from 'node:fs/promises';

const issues = [];
const env = process.env;
try {
  const url = new URL(env.PUBLIC_SITE_URL || '');
  if (url.protocol !== 'https:' || /(^|\.)(example\.(com|org|net)|localhost)$/.test(url.hostname) || url.pathname !== '/' || url.search || url.hash || url.username || url.password) issues.push('PUBLIC_SITE_URL doit être une origine HTTPS réelle, sans chemin ni identifiants.');
} catch { issues.push('PUBLIC_SITE_URL doit être renseignée.'); }
if (!env.PUBLIC_AUTHOR_NAME || /à venir|démonstration/i.test(env.PUBLIC_AUTHOR_NAME)) issues.push('PUBLIC_AUTHOR_NAME doit être le nom définitif.');
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.PUBLIC_CONTACT_EMAIL || '') || /@example\.(com|org|net)$/.test(env.PUBLIC_CONTACT_EMAIL || '')) issues.push('PUBLIC_CONTACT_EMAIL doit être une adresse réelle.');
if (env.PUBLIC_DEMO_MODE !== 'false') issues.push('PUBLIC_DEMO_MODE doit valoir false.');
if (env.PUBLIC_CONTENT_APPROVED !== 'true') issues.push('PUBLIC_CONTENT_APPROVED doit valoir true après validation des contenus et informations légales.');
for (const path of ['src/pages/auteur.astro','src/pages/mentions-legales.astro','src/pages/confidentialite.astro']) {
  const text = await readFile(path,'utf8');
  if (/Page préparatoire|Une rencontre à venir|Cette page décrit la version de démonstration/.test(text)) issues.push(`Remplacer et valider le contenu provisoire de ${path}.`);
}
if (issues.length) {
  console.error('Production non prête :\n' + issues.map(issue => `- ${issue}`).join('\n'));
  process.exitCode = 1;
} else console.log('Configuration de publication validée.');
