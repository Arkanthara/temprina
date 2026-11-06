import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readPageContent } from './lib/page-content.mjs';

export async function validateProduction({ env = process.env, contentRoot = 'src/content/pages' } = {}) {
  const issues = [];
  try {
    const url = new URL(env.PUBLIC_SITE_URL || '');
    if (url.protocol !== 'https:' || /(^|\.)(example\.(com|org|net)|localhost)$/.test(url.hostname) || url.pathname !== '/' || url.search || url.hash || url.username || url.password) issues.push('PUBLIC_SITE_URL doit être une origine HTTPS réelle, sans chemin ni identifiants.');
  } catch { issues.push('PUBLIC_SITE_URL doit être renseignée.'); }
  if (!env.PUBLIC_AUTHOR_NAME || /à venir|démonstration/i.test(env.PUBLIC_AUTHOR_NAME)) issues.push('PUBLIC_AUTHOR_NAME doit être le nom définitif.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.PUBLIC_CONTACT_EMAIL || '') || /@example\.(com|org|net)$/.test(env.PUBLIC_CONTACT_EMAIL || '')) issues.push('PUBLIC_CONTACT_EMAIL doit être une adresse réelle.');
  if (env.PUBLIC_DEMO_MODE !== 'false') issues.push('PUBLIC_DEMO_MODE doit valoir false.');
  if (env.PUBLIC_CONTENT_APPROVED !== 'true') issues.push('PUBLIC_CONTENT_APPROVED doit valoir true après validation des contenus et informations légales.');
  try {
    const { data, body } = await readPageContent(join(contentRoot, 'auteur.md'));
    if (data.template !== 'author' || !body || !Array.isArray(data.biography) || !data.biography.length || data.biography.some(text => typeof text !== 'string' || !text.trim())) {
      issues.push('Renseigner la présentation et la biographie dans src/content/pages/auteur.md.');
    }
  } catch {
    issues.push('Le contenu src/content/pages/auteur.md est manquant ou illisible.');
  }
  for (const id of ['mentions-legales', 'confidentialite']) {
    try {
      const { data, body } = await readPageContent(join(contentRoot, `${id}.md`));
      if (data.template !== 'legal' || data.approved !== true || data.notice?.trim() || !body) {
        issues.push(`Compléter et valider src/content/pages/${id}.md (approved: true, sans notice provisoire).`);
      }
    } catch {
      issues.push(`Le contenu src/content/pages/${id}.md est manquant ou illisible.`);
    }
  }
  return issues;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const issues = await validateProduction();
  if (issues.length) {
    console.error('Production non prête :\n' + issues.map(issue => `- ${issue}`).join('\n'));
    process.exitCode = 1;
  } else console.log('Configuration de publication validée.');
}
