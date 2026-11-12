import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parse, stringify } from 'yaml';
import { settingsSchema } from '../src/lib/settings-schema.mjs';
import { validateProduction } from '../scripts/validate-production.mjs';
import { readPageContent } from '../scripts/lib/page-content.mjs';
import { completeLegalInformation } from './fixtures/legal.mjs';

const env = {
  PUBLIC_SITE_URL: 'https://temprina.ch', PUBLIC_AUTHOR_NAME: 'Autrice de test',
  PUBLIC_CONTACT_EMAIL: 'contact@temprina.ch', PUBLIC_DEMO_MODE: 'false', PUBLIC_CONTENT_APPROVED: 'true',
};
const writePage = (root, id, data, body = 'Contenu relu.') => writeFile(join(root, `${id}.md`), `---\n${stringify(data)}---\n${body}\n`);

test('production checks actual editorial approval rather than template source code', async () => {
  const root = await mkdtemp(join(tmpdir(), 'temprina-content-'));
  try {
    const legalPath = join(root, 'legal.yaml');
    await writeFile(legalPath, stringify(completeLegalInformation()));
    await writePage(root, 'auteur', { template: 'author', biography: ['Un parcours réel.'] });
    for (const id of ['mentions-legales', 'confidentialite']) await writePage(root, id, { template: 'legal', approved: false, notice: 'À compléter.' });
    const issues = await validateProduction({ env, contentRoot: root, legalPath });
    assert.equal(issues.length, 2);
    for (const id of ['mentions-legales', 'confidentialite']) assert.ok(issues.some(issue => issue.includes(`${id}.md`)));
    assert.ok(issues.every(issue => !issue.includes('auteur.md')));
    const missingEnv = await validateProduction({ env: {}, contentRoot: root, legalPath });
    for (const key of Object.keys(env)) assert.ok(missingEnv.some(issue => issue.includes(key)), key);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('production requires approved legal content, a biography and readable content files', async () => {
  const root = await mkdtemp(join(tmpdir(), 'temprina-content-'));
  try {
    const legalPath = join(root, 'legal.yaml');
    await writeFile(legalPath, stringify(completeLegalInformation()));
    await writePage(root, 'auteur', { template: 'author', biography: ['Une biographie relue.'] });
    for (const id of ['mentions-legales', 'confidentialite']) await writePage(root, id, { template: 'legal', approved: true });
    assert.deepEqual(await validateProduction({ env, contentRoot: root, legalPath }), []);
    // A retained provisional notice still blocks publication, even with approved: true.
    await writePage(root, 'mentions-legales', { template: 'legal', approved: true, notice: 'À compléter.' });
    await writePage(root, 'confidentialite', { template: 'legal', approved: false });
    await writePage(root, 'auteur', { template: 'author', biography: [] });
    const issues = await validateProduction({ env, contentRoot: root, legalPath });
    assert.equal(issues.length, 3);
    await rm(join(root, 'auteur.md'));
    await writeFile(join(root, 'mentions-legales.md'), '---\napproved: [\n---\n');
    const invalid = await validateProduction({ env, contentRoot: root, legalPath });
    assert.equal(invalid.length, 3);
    assert.ok(invalid.some(issue => issue.includes('manquant ou illisible')));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('frontmatter reader preserves multiline text and rejects missing YAML headers', async () => {
  const page = await readPageContent('src/content/pages/contact.md');
  assert.match(page.data.form.bookMessage, /Bonjour,\n\n/);
  assert.match(page.body, /^## Le début d’un échange/);
  await assert.rejects(() => readPageContent('README.md'), /En-tête YAML manquant/);
});

test('global editorial settings reject blank text, missing variables and invalid image paths', async () => {
  const settings = parse(await readFile('src/content/settings/site.yaml', 'utf8'));
  for (const [path, value] of [
    ['footerMessage', '  '], ['footerTagline', undefined], ['books.coverAlt', 'Une couverture'],
    ['blog.readingLabel', 'Durée de lecture'], ['identity.contactEmail', 'pas-un-email'],
    ['images.logo.src', 'https://example.org/logo.png'], ['images.social', '/images/../ailleurs.jpg'],
  ]) {
    const invalid = structuredClone(settings);
    const keys = path.split('.');
    const field = keys.pop();
    const parent = keys.reduce((object, key) => object[key], invalid);
    parent[field] = value;
    const result = settingsSchema.safeParse(invalid);
    assert.equal(result.success, false, path);
    assert.ok(result.error.issues.some(issue => issue.path.join('.') === path), path);
  }
});

test('production validation uses the identity configured in content before environment fallbacks', async () => {
  const root = await mkdtemp(join(tmpdir(), 'temprina-identity-'));
  try {
    const settings = parse(await readFile('src/content/settings/site.yaml', 'utf8'));
    settings.identity.authorName = 'Une autrice';
    settings.identity.contactEmail = 'bonjour@temprina.ch';
    const settingsPath = join(root, 'settings.yaml');
    const legalPath = join(root, 'legal.yaml');
    await writeFile(settingsPath, stringify(settings));
    await writeFile(legalPath, stringify(completeLegalInformation()));
    await writePage(root, 'auteur', { template: 'author', biography: ['Un parcours réel.'] });
    for (const id of ['mentions-legales', 'confidentialite']) await writePage(root, id, { template: 'legal', approved: true });
    const legacyEnv = { ...env, PUBLIC_AUTHOR_NAME: 'Nom à venir', PUBLIC_CONTACT_EMAIL: '' };
    assert.deepEqual(await validateProduction({ env: legacyEnv, contentRoot: root, legalPath, settingsPath }), []);
    settings.identity.authorName = '';
    settings.identity.contactEmail = '';
    await writeFile(settingsPath, stringify(settings));
    assert.deepEqual(await validateProduction({ env, contentRoot: root, legalPath, settingsPath }), []);
    const issues = await validateProduction({ env: legacyEnv, contentRoot: root, legalPath, settingsPath });
    assert.ok(issues.some(issue => issue.includes('authorName')));
    assert.ok(issues.some(issue => issue.includes('contactEmail')));
  } finally { await rm(root, { recursive: true, force: true }); }
});
