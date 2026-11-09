import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { parse, stringify } from 'yaml';
import { load } from 'cheerio';
import { readPageContent } from '../scripts/lib/page-content.mjs';

// Work in a disposable copy: no source edit, secret or build artifact in the checkout is touched.
test('editing Markdown/YAML changes rendered pages and invalid content fails the build', { timeout: 180000 }, async () => {
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
    const settingsPath = join(fixture, 'src/content/settings/site.yaml');
    const settings = parse(await readFile(settingsPath, 'utf8'));
    settings.footerTagline = '  Des histoires & des <em>passages</em> : à partager.  ';
    await writeFile(settingsPath, stringify(settings));
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
    const bookPath = join(fixture, 'src/content/books/les-prisonniers-du-tram.md');
    const book = await readPageContent(bookPath);
    const saveBook = () => writeFile(bookPath, `---\n${stringify(book.data)}---\n${book.body}\n`);
    book.data.featured = true;
    book.data.publicationDate = '2099-01-01';
    book.data.subtitle = 'Un sous-titre conservé';
    book.data.followedBy = {
      title: '  Une menace <em>nouvelle</em> & lumière  ',
      description: '  Une accroche <script>littérale</script>.  ',
      summary: '  Premier paragraphe <strong>littéral</strong>.\n\nDeuxième paragraphe & conclusion.  ',
    };
    await saveBook();
    const result = build();
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const outputs = await readdir(join(fixture, 'dist'), { recursive: true });
    for (const output of outputs.filter(path => path.endsWith('.html'))) {
      const page = await html(output);
      assert.equal(page('.site-footer .brand small').text(), settings.footerTagline.trim(), output);
      assert.equal(page('.site-footer .brand small em').length, 0, 'Tagline must remain literal text');
    }
    const $ = await html('index.html');
    for (const output of ['index.html', 'catalogue/index.html']) {
      const page = await html(output);
      const card = page('[data-book]').filter((_, el) => page(el).find('h3').text() === book.data.title);
      assert.equal(card.length, 1, output);
      assert.equal(card.find('.book-followed-by span').text(), book.data.followedBy.title.trim());
      assert.equal(card.find('.book-subtitle').text(), book.data.subtitle);
      assert.equal(card.find('.book-followed-by span em').length, 0);
      assert.ok(!card.text().includes('Deuxième paragraphe'));
    }
    const story = await html('livres/les-prisonniers-du-tram/index.html');
    assert.equal(story('.book-second-story h2').text(), book.data.followedBy.title.trim());
    assert.equal(story('.book-second-story .book-description').text(), book.data.followedBy.description.trim());
    assert.deepEqual(story('.book-second-story .prose p').toArray().map(el => story(el).text()), book.data.followedBy.summary.trim().split('\n\n'));
    assert.equal(story('.book-second-story em, .book-second-story script, .book-second-story strong').length, 0);
    assert.ok(story('meta[property="og:title"]').attr('content').includes(`suivi de ${book.data.followedBy.title.trim()}`));
    const bookSchema = JSON.parse(story('script[type="application/ld+json"]').text());
    assert.equal(bookSchema.hasPart.name, book.data.followedBy.title.trim());
    assert.equal(bookSchema.hasPart.description, book.data.followedBy.description.trim());
    assert.equal(bookSchema.hasPart.abstract, book.data.followedBy.summary.trim());
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
    home.data.hero.primaryLabel = 'Parcourir mes livres';
    await save('index', home);
    for (const invalidSettings of [{}, { footerTagline: '   ' }]) {
      await writeFile(settingsPath, stringify(invalidSettings));
      const invalidTagline = build();
      assert.notEqual(invalidTagline.status, 0, 'Missing or blank tagline must fail the build');
      assert.equal(invalidTagline.signal, null);
      assert.equal(invalidTagline.error, undefined);
      assert.match(invalidTagline.stdout + invalidTagline.stderr, /footerTagline/);
    }
    await writeFile(settingsPath, stringify(settings));
    book.data.followedBy = { title: '  Un second récit  ', description: '   ', summary: '   ' };
    await saveBook();
    const titleOnly = build();
    assert.equal(titleOnly.status, 0, titleOnly.stdout + titleOnly.stderr);
    const minimalStory = await html('livres/les-prisonniers-du-tram/index.html');
    assert.equal(minimalStory('.book-followed-by span').text(), 'Un second récit');
    assert.equal(minimalStory('.book-second-story').length, 0);
    assert.deepEqual(JSON.parse(minimalStory('script[type="application/ld+json"]').text()).hasPart, { '@type': 'CreativeWork', name: 'Un second récit' });
    for (const followedBy of [{}, { title: '   ' }, { title: 'Un récit', description: 'a'.repeat(301) }]) {
      book.data.followedBy = followedBy;
      await saveBook();
      const invalidBook = build();
      assert.notEqual(invalidBook.status, 0, 'A missing/blank title or overlong description must fail the build');
      assert.equal(invalidBook.signal, null);
      assert.equal(invalidBook.error, undefined);
      assert.match(invalidBook.stdout + invalidBook.stderr, /followedBy/);
    }
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});
