import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { parse, stringify } from 'yaml';
import { load } from 'cheerio';
import { readPageContent } from '../scripts/lib/page-content.mjs';

// Work in a disposable copy: no source edit, secret or build artifact in the checkout is touched.
test('editing Markdown/YAML changes rendered pages and invalid content fails the build', { timeout: 120000 }, async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'temprina-editing-'));
  const build = () => spawnSync(process.execPath, [resolve('node_modules/astro/bin/astro.mjs'), 'build'], {
    cwd: fixture, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024,
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', PUBLIC_DEMO_MODE: 'true' },
  });
  const save = (id, page) => writeFile(join(fixture, 'src/content/pages', `${id}.md`), `---\n${stringify(page.data)}---\n${page.body}\n`);
  const html = async path => load(await readFile(join(fixture, 'dist', path), 'utf8'));
  try {
    for (const name of ['src', 'public', 'package.json', 'astro.config.mjs', 'tsconfig.json']) await cp(name, join(fixture, name), { recursive: true });
    await symlink(resolve('node_modules'), join(fixture, 'node_modules'), 'dir');
    const home = await readPageContent(join(fixture, 'src/content/pages/index.md'));
    home.data.title = 'Un accueil modifié';
    home.data.description = 'Une nouvelle description à partager.';
    home.data.hero.heading = { lines: ['Une histoire & un espoir'], accent: '<lumière>' };
    home.data.hero.primaryLabel = 'Parcourir mes livres';
    home.body = 'Un extrait **personnalisé** depuis Markdown.';
    await save('index', home);
    const author = await readPageContent(join(fixture, 'src/content/pages/auteur.md'));
    author.data.biography = ['Une biographie modifiée.'];
    author.body = '## Un autre regard\n\nUne présentation **modifiée**.';
    await save('auteur', author);
    const contact = await readPageContent(join(fixture, 'src/content/pages/contact.md'));
    contact.data.form.selectedBook = 'Votre lecture : {book}';
    await save('contact', contact);
    const legalPath = join(fixture, 'src/content/legal/site.yaml');
    const legal = parse(await readFile(legalPath, 'utf8'));
    legal.publisher.name = 'Éditrice <fiction> & plume';
    legal.publisher.email = 'editor@example.org';
    legal.developer = { name: 'Studio <création> & associés', role: 'Développement du site', url: 'https://example.org/studio/', showInFooter: true };
    await writeFile(legalPath, stringify(legal));
    const mentions = await readPageContent(join(fixture, 'src/content/pages/mentions-legales.md'));
    mentions.body = '## Crédits personnalisés\n\nUn texte **légal modifié**.';
    await save('mentions-legales', mentions);
    const privacy = await readPageContent(join(fixture, 'src/content/pages/confidentialite.md'));
    privacy.body = '## Une politique personnalisée\n\nUn texte **confidentiel modifié**.';
    await save('confidentialite', privacy);
    const result = build();
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const $ = await html('index.html');
    assert.ok($('title').text().startsWith('Un accueil modifié — '));
    assert.equal($('meta[property="og:description"]').attr('content'), home.data.description);
    assert.equal($('h1 em').text(), '<lumière>');
    assert.equal($('h1 lumière').length, 0, 'YAML strings must be escaped, not injected as HTML');
    assert.equal($('.hero .button').text().trim(), 'Parcourir mes livres');
    assert.equal($('.author-band strong').text(), 'personnalisé');
    const bio = await html('auteur/index.html');
    assert.equal(bio('.author-page .prose > p:not(.eyebrow)').text(), 'Une biographie modifiée.');
    assert.equal(bio('.author-presentation h2').text(), 'Un autre regard');
    assert.equal(bio('.author-presentation strong').text(), 'modifiée');
    const email = await html('contact/index.html');
    assert.equal(email('[data-selected-book]').attr('data-template'), 'Votre lecture : {book}');
    const legalPage = await html('mentions-legales/index.html');
    assert.ok(legalPage('.legal-facts').text().includes(legal.developer.name));
    assert.equal(legalPage('.legal-facts création, .legal-facts fiction').length, 0);
    assert.equal(legalPage('.prose strong').text(), 'légal modifié');
    assert.equal(legalPage('.legal-updated time').attr('datetime'), legal.updatedOn);
    const privacyPage = await html('confidentialite/index.html');
    assert.ok(privacyPage('.legal-facts').text().includes(legal.publisher.name), 'Controller defaults to publisher');
    assert.equal(privacyPage('.legal-facts a[href="mailto:editor@example.org"]').length, 1);
    assert.equal(privacyPage('.prose strong').text(), 'confidentiel modifié');
    for (const page of [$, legalPage, privacyPage, email, bio]) {
      assert.equal(page('.developer-credit a').text(), legal.developer.name);
      assert.equal(page('.developer-credit a').attr('href'), legal.developer.url);
      assert.equal(page('.developer-credit création').length, 0);
    }
    delete home.data.hero.primaryLabel;
    await save('index', home);
    const invalid = build();
    assert.notEqual(invalid.status, 0, 'Missing required editorial content must stop publication');
    assert.equal(invalid.signal, null, 'The invalid build must exit normally with a validation failure');
    assert.equal(invalid.error, undefined);
    assert.match(invalid.stdout + invalid.stderr, /primaryLabel/);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
