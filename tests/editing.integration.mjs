import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, rm, symlink } from 'node:fs/promises';
import { join, resolve, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { load } from 'cheerio';
import sharp from 'sharp';
import { readPageContent } from '../scripts/lib/page-content.mjs';
import { readSettings, writeYaml, writeMarkdown } from './helpers/content.mjs';

test('l’auteur peut éditer chaque page, ajouter, masquer et supprimer ses contenus', { timeout: 120000 }, async () => {
  const fixture = await mkdtemp(join(tmpdir(), 'temprina-editing-'));
  const file = path => join(fixture, path);
  const html = async path => load(await readFile(file(`dist/${path}`), 'utf8'));
  const build = (success = true) => {
    const result = spawnSync(process.execPath, [resolve('node_modules/astro/bin/astro.mjs'), 'build'], {
      cwd: fixture, encoding: 'utf8', timeout: 45000, maxBuffer: 4 * 1024 * 1024,
      env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', PUBLIC_DEMO_MODE: 'true' },
    });
    assert.equal(result.error, undefined);
    assert.equal(result.signal, null);
    if (success) assert.equal(result.status, 0, result.stdout + result.stderr);
    else assert.notEqual(result.status, 0, 'Un contenu obligatoire invalide doit arrêter le build.');
    return result.stdout + result.stderr;
  };
  try {
    for (const path of ['src', 'public', 'package.json', 'astro.config.mjs', 'tsconfig.json']) await cp(path, file(path), { recursive: true });
    await symlink(resolve('node_modules'), file('node_modules'), 'dir');
    const settings = await readSettings();
    const logoSource = settings.images.logo.src;
    const socialSource = settings.images.social;
    await sharp({ create: { width: 20, height: 30, channels: 3, background: '#123456' } }).png().toFile(file('src/assets/test-image.png'));
    settings.identity.authorName = 'Autrice <Plume> & {date} $&';
    settings.identity.contactEmail = 'plume@example.org';
    settings.footerTagline = 'Des histoires <em>à partager</em>.';
    settings.footerMessage = 'Des mots & des récits.\nUne deuxième ligne.';
    settings.headerSubtitle = 'UN AUTRE UNIVERS';
    settings.navigation.author = 'Mon parcours';
    settings.books.contact.heading = 'Envie de lire ?';
    settings.books.coverAlt = 'Illustration de {title}';
    settings.share.shareLabel = 'Partager cette lecture';
    settings.share.shareError = 'Veuillez réessayer le partage.';
    settings.images.logo.src = `/images/autre-logo${extname(logoSource)}`;
    settings.images.social = `/images/autre-partage${extname(socialSource)}`;
    settings.legal.publisher.name = 'Éditrice <fiction>';
    settings.legal.publisher.email = 'editor@example.org';
    settings.legal.developer = { name: 'Studio <création>', role: 'Développement', url: 'https://example.org/studio/', showInFooter: true };
    await cp(file(`public${logoSource}`), file(`public${settings.images.logo.src}`));
    await cp(file(`public${socialSource}`), file(`public${settings.images.social}`));
    const settingsPath = file('src/content/site.yaml');
    await writeYaml(settingsPath, settings);

    const edited = new Map();
    for (const name of await readdir(file('src/content/pages'))) {
      const path = file(`src/content/pages/${name}`);
      const page = await readPageContent(path);
      const id = name.slice(0, -3);
      page.data.title = `Titre modifié : ${id}`;
      page.body = `## Présentation ${id}\n\nDu **gras**, de l’*italique* et un [lien](/catalogue/).\n\n- Une idée\n- Une autre\n\n> Une citation.`;
      if (id === 'index') {
        page.data.hero.heading = { lines: ['Une histoire & un espoir'], accent: '<lumière>' };
        page.data.hero.primaryLabel = 'Parcourir mes livres';
      }
      if (id === 'auteur') {
        page.data.biography = ['Une biographie personnelle.'];
        page.data.portrait.image = '../../assets/test-image.png';
        page.data.portrait.caption = 'Une légende <em>personnelle</em>.';
      }
      await writeMarkdown(path, page);
      edited.set(id, page);
    }
    const book = {
      data: { title: 'Nouveau roman $& <lumière>', publicationDate: '2099-01-01', cover: '../../assets/test-image.png', featured: true,
        followedBy: { title: 'Une suite <em>lumineuse</em>', summary: 'Un paragraphe.\n\nUn autre <strong>littéral</strong>.' } },
      body: 'Le résumé **personnalisé**.',
    };
    const bookPath = file('src/content/books/nouveau-roman.md');
    const articlePath = file('src/content/blog/nouvel-article.md');
    await writeMarkdown(bookPath, book);
    await writeMarkdown(file('src/content/books/livre-a-retirer.md'), { data: { title: 'Livre à retirer', publicationDate: '2026-01-01', cover: '../../assets/test-image.png' }, body: '' });
    await writeMarkdown(articlePath, { data: { title: 'Un nouvel article $& <texte>', description: 'Une introduction.', date: '2099-01-01', category: 'Lectures', readingMinutes: 2 }, body: 'Un texte **nouveau**.' });
    await writeMarkdown(file('src/content/blog/sans-duree.md'), { data: { title: 'Article sans durée', description: 'Une lecture sans durée affichée.', date: '2098-01-01', category: 'Lectures' }, body: 'Un article sans durée.' });
    build();

    for (const [id, page] of edited) {
      const $ = await html(id === 'index' ? 'index.html' : id === '404' ? '404.html' : `${id}/index.html`);
      assert.ok($('title').text().startsWith(page.data.title + ' — '), id);
      assert.ok($('main strong').toArray().some(el => $(el).text() === 'gras'), `Le corps Markdown doit apparaître sur ${id}`);
      assert.ok($('main em').toArray().some(el => $(el).text() === 'italique'), id);
      assert.equal($('main blockquote').length, 1, id);
      assert.equal($('.site-footer .brand small').text(), settings.footerTagline, id);
      assert.equal($('.site-footer .brand small em').length, 0, id);
      assert.equal($('.footer-message').text(), settings.footerMessage, id);
      assert.equal($('nav a[href="/auteur/"]').text(), settings.navigation.author, id);
      assert.equal($('link[rel="icon"]').attr('href'), settings.images.logo.src, id);
      assert.equal($('.developer-credit a').text(), settings.legal.developer.name, id);
      assert.equal($('.developer-credit a').attr('href'), settings.legal.developer.url, id);
      assert.equal($('meta[property="og:site_name"]').attr('content'), settings.identity.authorName, id);
    }
    const home = await html('index.html');
    assert.equal(home('h1 em').text(), '<lumière>');
    assert.equal(home('h1 lumière').length, 0);
    assert.equal(home('[data-book] h3').first().text(), book.data.title);
    const author = await html('auteur/index.html');
    assert.equal(author('.author-page .prose > p:not(.eyebrow)').text(), 'Une biographie personnelle.');
    assert.equal(author('.author-portrait img').attr('width'), '240');
    assert.match(author('.author-portrait img').attr('src'), /\.webp$/);
    assert.equal(author('.author-portrait figcaption').text(), edited.get('auteur').data.portrait.caption);
    const story = await html('livres/nouveau-roman/index.html');
    assert.equal(story('.demo-label').length, 0, 'Un livre sans champ demo ne doit pas être présenté comme une démonstration.');
    assert.equal(story('.book-info > .prose strong').text(), 'personnalisé');
    assert.equal(story('.book-followed-by span').text(), book.data.followedBy.title);
    assert.equal(story('.book-second-story strong, .book-second-story em').length, 0);
    assert.equal(story('.book-second-story .prose p').length, 2);
    assert.equal(story('.purchase-note h2').text(), settings.books.contact.heading);
    assert.equal(story('[data-share]').text().trim(), settings.share.shareLabel);
    assert.equal(story('.share-status').attr('data-share-error'), settings.share.shareError);
    assert.ok(story('meta[name="description"]').attr('content').includes(settings.identity.authorName));
    assert.equal(JSON.parse(story('script[type="application/ld+json"]').text()).hasPart.abstract, book.data.followedBy.summary);
    assert.equal((await html('contact/index.html'))('[data-contact]').attr('data-email'), settings.identity.contactEmail);
    const article = await html('blog/nouvel-article/index.html');
    assert.equal(article('.prose strong').text(), 'nouveau');
    assert.equal(article('[data-share]').text().trim(), settings.share.shareLabel);
    assert.equal(article('.share-status').attr('data-share-error'), settings.share.shareError);
    assert.equal(article('.notice').length, 0, 'Un article sans champ demo ne doit pas être présenté comme une démonstration.');
    const withReadingTime = (template, minutes) => template.replaceAll('{minutes}', String(minutes));
    assert.equal(article('.byline').text(), `${article('.byline time').text()} · ${withReadingTime(settings.blog.readingLabel, 2)}`);
    const withoutReadingTime = await html('blog/sans-duree/index.html');
    assert.equal(withoutReadingTime('.byline').text(), withoutReadingTime('.byline time').text());
    const blog = await html('blog/index.html');
    for (const [id, minutes] of [['nouvel-article', 2], ['sans-duree', undefined]]) {
      const row = blog(`.journal-row:has(h2 a[href="/blog/${id}/"])`);
      assert.equal(row.length, 1);
      const duration = minutes === undefined ? '' : ` · ${withReadingTime(settings.blog.readingShortLabel, minutes)}`;
      assert.equal(row.find('.book-meta').text(), `Lectures · ${row.find('time').text()}${duration}`);
    }
    const blogLabels = edited.get('blog').data;
    assert.equal((await html('blog/index.html'))('.journal-row').first().find('.round-link').attr('aria-label'), blogLabels.readLabel.replaceAll('{title}', () => 'Un nouvel article $& <texte>'));
    assert.ok((await html('confidentialite/index.html'))('.legal-facts').text().includes(settings.legal.publisher.name));

    // Une seconde compilation couvre le retrait, les brouillons et les options sans cadre vide.
    const authorPage = edited.get('auteur');
    authorPage.data.portrait.enabled = false;
    await writeMarkdown(file('src/content/pages/auteur.md'), authorPage);
    book.data.followedBy = { title: 'Seulement un titre', summary: ' ' };
    await writeMarkdown(bookPath, book);
    const draft = structuredClone(book);
    draft.data.title = 'Brouillon invisible';
    draft.data.draft = true;
    await writeMarkdown(file('src/content/books/brouillon.md'), draft);
    await rm(articlePath);
    await rm(file('src/content/books/livre-a-retirer.md'));
    build();
    assert.equal((await html('auteur/index.html'))('.author-portrait').length, 0);
    assert.equal((await html('livres/nouveau-roman/index.html'))('.book-second-story').length, 0);
    const outputs = await readdir(file('dist'), { recursive: true });
    for (const absent of ['livres/brouillon/index.html', 'blog/nouvel-article/index.html', 'livres/livre-a-retirer/index.html']) assert.ok(!outputs.includes(absent), absent);
    const catalogue = await html('catalogue/index.html');
    assert.ok(!catalogue('main').text().includes('Brouillon invisible'));
    assert.equal(catalogue('[data-book] h3').first().text(), book.data.title);

    delete edited.get('index').data.hero.primaryLabel;
    await writeMarkdown(file('src/content/pages/index.md'), edited.get('index'));
    assert.match(build(false), /primaryLabel/);
  } finally { await rm(fixture, { recursive: true, force: true }); }
});
