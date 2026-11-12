import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { z } from 'astro/zod';
import { siteSchema, resolveIdentity } from '../src/lib/site-schema.mjs';
import { bookSchema, blogSchema, pageSchema } from '../src/lib/content-schema.ts';
import { validateProduction } from '../scripts/validate-production.mjs';
import { readPageContent } from '../scripts/lib/page-content.mjs';
import { readSettings, productionSettings, productionEnv, writeYaml, writeMarkdown } from './helpers/content.mjs';

// Astro vérifie les vrais fichiers image pendant le build ; ici on teste les règles éditoriales.
const context = { image: () => z.string().min(1) };

test('tous les contenus utilisent les schémas du site', async () => {
  siteSchema.parse(await readSettings());
  for (const [collection, schema] of [['pages', pageSchema(context)], ['books', bookSchema(context)], ['blog', blogSchema]]) {
    for (const name of await readdir(`src/content/${collection}`)) {
      if (!name.endsWith('.md') || name.startsWith('_')) continue;
      const { data } = await readPageContent(`src/content/${collection}/${name}`);
      assert.ok(schema.safeParse(data).success, `${collection}/${name}`);
    }
  }
});

test('un livre minimal suffit, les champs facultatifs et la seconde histoire sont validés', () => {
  const minimal = { title: 'Un roman', publicationDate: '2026-01-01', cover: '../../assets/couverture.jpg' };
  const schema = bookSchema(context);
  const book = schema.parse(minimal);
  assert.equal(book.draft, false);
  assert.equal(book.demo, false);
  assert.equal(book.featured, false);
  for (const changes of [
    { title: ' ' }, { publicationDate: 'invalide' }, { cover: '' }, { volume: 0 },
    { description: 'a'.repeat(301) }, { followedBy: {} }, { followedBy: { title: ' ' } },
    { followedBy: { title: 'Un récit', description: 'a'.repeat(301) } },
  ]) assert.equal(schema.safeParse({ ...minimal, ...changes }).success, false, JSON.stringify(changes));
  assert.deepEqual(schema.parse({ ...minimal, followedBy: { title: ' Suite ', summary: ' ' } }).followedBy, { title: 'Suite', summary: '' });
});

test('livres et articles ne sont pas des démonstrations par défaut', () => {
  for (const [schema, content] of [
    [bookSchema(context), { title: 'Un roman', publicationDate: '2026-01-01', cover: '../../assets/couverture.jpg' }],
    [blogSchema, { title: 'Un article', description: 'Un résumé.', date: '2026-01-01', category: 'Lectures', readingMinutes: 2 }],
  ]) {
    assert.equal(schema.parse(content).demo, false);
    assert.equal(schema.parse({ ...content, demo: false }).demo, false);
    assert.equal(schema.parse({ ...content, demo: true }).demo, true);
  }
});

test('les textes requis, variables, liens et chemins incorrects sont signalés précisément', async () => {
  const settings = await readSettings();
  for (const [path, value] of [
    ['footerMessage', ' '], ['footerTagline', undefined], ['books.coverAlt', 'Couverture'],
    ['blog.readingLabel', 'Durée'], ['identity.contactEmail', 'invalide'],
    ['images.logo.src', 'https://example.org/logo.png'], ['images.social', '/images/../ailleurs.jpg'],
  ]) {
    const invalid = structuredClone(settings);
    const keys = path.split('.');
    const field = keys.pop();
    keys.reduce((object, key) => object[key], invalid)[field] = value;
    const result = siteSchema.safeParse(invalid);
    assert.equal(result.success, false, path);
    assert.ok(result.error.issues.some(issue => issue.path.join('.') === path), path);
  }
  const home = await readPageContent('src/content/pages/index.md');
  delete home.data.hero.primaryLabel;
  assert.equal(pageSchema(context).safeParse(home.data).success, false);
  const article = { title: 'Un article', description: 'Un résumé.', date: '2026-01-01', category: 'Lectures', readingMinutes: 0 };
  assert.equal(blogSchema.safeParse(article).success, false);
});

test('l’identité du fichier commun a priorité sur les variables d’environnement', async () => {
  const settings = await readSettings();
  assert.deepEqual(resolveIdentity(settings, {}), { author: settings.identity.authorFallback, email: '' });
  assert.deepEqual(resolveIdentity(settings, productionEnv), { author: productionEnv.PUBLIC_AUTHOR_NAME, email: productionEnv.PUBLIC_CONTACT_EMAIL });
  settings.identity.authorName = 'Ma plume';
  settings.identity.contactEmail = 'bonjour@temprina.ch';
  assert.deepEqual(resolveIdentity(settings, productionEnv), { author: 'Ma plume', email: 'bonjour@temprina.ch' });
});

test('le lecteur Markdown préserve les paragraphes YAML et refuse un en-tête absent', async () => {
  const page = await readPageContent('src/content/pages/contact.md');
  assert.match(page.data.form.bookMessage, /Bonjour,\n\n/);
  assert.ok(page.body.trim());
  await assert.rejects(() => readPageContent('README.md'), /En-tête YAML manquant/);
});

test('la publication contrôle les faits communs et les textes effectivement approuvés', async () => {
  const root = await mkdtemp(join(tmpdir(), 'temprina-production-'));
  const settingsPath = join(root, 'site.yaml');
  const options = { env: productionEnv, contentRoot: root, settingsPath };
  const page = (id, data, body = 'Texte relu.') => writeMarkdown(join(root, `${id}.md`), { data, body });
  try {
    const settings = await productionSettings();
    await writeYaml(settingsPath, settings);
    await page('auteur', { template: 'author', biography: ['Un parcours.'] });
    for (const id of ['mentions-legales', 'confidentialite']) await page(id, { template: 'legal', approved: true });
    assert.deepEqual(await validateProduction(options), []);
    const missingEnv = await validateProduction({ ...options, env: {} });
    for (const key of Object.keys(productionEnv)) assert.ok(missingEnv.some(issue => issue.includes(key)), key);
    settings.identity.authorName = 'Une autrice';
    settings.identity.contactEmail = 'bonjour@temprina.ch';
    await writeYaml(settingsPath, settings);
    assert.deepEqual(await validateProduction({ ...options, env: { ...productionEnv, PUBLIC_AUTHOR_NAME: '', PUBLIC_CONTACT_EMAIL: '' } }), []);
    await page('mentions-legales', { template: 'legal', approved: true, notice: 'À compléter.' });
    await page('confidentialite', { template: 'legal', approved: false });
    await page('auteur', { template: 'author', biography: [] });
    assert.equal((await validateProduction(options)).length, 3);
    await page('auteur', { template: 'author', biography: ['Un parcours.'] }, '');
    assert.ok((await validateProduction(options)).some(issue => issue.includes('biographie')));
    await rm(join(root, 'auteur.md'));
    await writeFile(join(root, 'mentions-legales.md'), '---\napproved: [\n---\n');
    assert.equal((await validateProduction(options)).length, 3);
    await rm(settingsPath);
    assert.ok((await validateProduction(options)).some(issue => issue.includes('manquant ou illisible')));
  } finally { await rm(root, { recursive: true, force: true }); }
});
