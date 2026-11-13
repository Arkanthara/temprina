import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { load } from 'cheerio';
import { z } from 'astro/zod';
import { bookSchema, blogSchema, pageSchema } from '../src/lib/content-schema.ts';
import { readSettings } from './helpers/content.mjs';
import { readPageContent } from '../scripts/lib/page-content.mjs';

const context = { image: () => z.string() };
const bookFields = bookSchema(context);
const pageFields = pageSchema(context);
const root = resolve('dist');
const files = (await readdir(root, { recursive: true })).filter(path => path.endsWith('.html'));
const pages = new Map(await Promise.all(files.map(async path => [path, load(await readFile(join(root, path), 'utf8'))])));
const settings = await readSettings();
const home = pages.get('index.html');
const demo = home('.demo-bar').length > 0;
const bookPages = [...pages].filter(([path]) => path.startsWith('livres/'));
const exists = async path => { try { return (await stat(path)).isFile(); } catch { return false; } };
const text = ($, selector) => $(selector).toArray().map(el => $(el).text());

// Les attentes proviennent des contenus : changer un titre ou ajouter un livre ne casse pas les tests.
test('chaque page conserve sa structure, ses métadonnées et les réglages communs', () => {
  assert.ok(pages.size >= 8);
  const titles = new Set();
  for (const [path, $] of pages) {
    assert.equal($('html').attr('lang'), 'fr', path);
    assert.equal($('main#contenu').length, 1, path);
    assert.equal($('h1').length, 1, path);
    assert.ok($('title').text().trim(), path);
    assert.ok(!titles.has($('title').text()), `Titre dupliqué : ${path}`);
    titles.add($('title').text());
    for (const selector of ['meta[name="description"]', 'meta[property="og:image"]']) assert.ok($(selector).attr('content'), path);
    assert.match($('link[rel="canonical"]').attr('href'), /^https:\/\//);
    for (const img of $('img').toArray()) assert.notEqual($(img).attr('alt'), undefined, path);
    for (const script of $('script[type="application/ld+json"]').toArray()) assert.ok(JSON.parse($(script).text())['@type'], path);
    assert.equal($('.site-footer .brand small').text(), settings.footerTagline.trim(), path);
    assert.equal($('.footer-message').text(), settings.footerMessage.trim(), path);
    assert.equal($('.site-header .brand small').text(), settings.headerSubtitle, path);
    assert.equal($('nav a[href="/auteur/"]').text(), settings.navigation.author, path);
    for (const selector of ['.site-header .brand img', '.site-footer .brand img']) assert.equal($(selector).attr('src'), settings.images.logo.src, path);
    assert.equal($('link[rel="icon"]').attr('href'), settings.images.logo.src, path);
    assert.equal($('.developer-credit').length, Number(settings.legal.developer.showInFooter && Boolean(settings.legal.developer.name)), path);
  }
  assert.equal(home('.ornament img').attr('src'), settings.images.logo.src);
});

test('tous les liens internes, ancres, images et scripts existent', async () => {
  for (const [path, $] of pages) {
    const origin = new URL('/' + path.replace(/index\.html$/, ''), 'https://local.test');
    for (const element of $('[href], [src], [srcset]').toArray()) {
      const el = $(element);
      const refs = [el.attr('href'), el.attr('src'), ...(el.attr('srcset') || '').split(',').map(value => value.trim().split(/\s+/)[0])].filter(Boolean);
      for (const ref of refs) {
        if (/^(mailto:|tel:|data:|https?:\/\/)/.test(ref)) continue;
        const target = new URL(ref, origin);
        const pathname = decodeURIComponent(target.pathname);
        const dest = join(root, pathname, pathname.endsWith('/') ? 'index.html' : '');
        assert.ok(await exists(dest), `Lien cassé : ${ref} dans ${path}`);
        if (target.hash && dest.endsWith('.html')) {
          const targetPage = pages.get(dest.slice(root.length + 1));
          assert.ok(targetPage('[id]').toArray().some(el => targetPage(el).attr('id') === decodeURIComponent(target.hash.slice(1))), `Ancre cassée : ${ref}`);
        }
      }
    }
  }
});

test('les huit pages affichent leurs textes éditables et leurs titres de partage', async () => {
  for (const name of await readdir('src/content/pages')) {
    const id = name.slice(0, -3);
    const { data: source } = await readPageContent(`src/content/pages/${name}`);
    const data = pageFields.parse(source);
    const path = id === 'index' ? 'index.html' : id === '404' ? '404.html' : `${id}/index.html`;
    const $ = pages.get(path);
    assert.ok($('title').text().startsWith(data.title + ' — '), id);
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]']) assert.equal($(selector).attr('content'), data.description, id);
    const heading = data.template === 'home' ? data.hero.heading : data.heading;
    const rendered = $('h1').clone();
    rendered.find('br').replaceWith(' ');
    assert.equal(rendered.text().replace(/\s+/g, ' ').trim(), [...heading.lines, heading.accent].filter(Boolean).join(' '), id);
  }
});

test('le catalogue contient les livres visibles, triés par date, et l’accueil respecte les mises en avant', async () => {
  const books = [];
  for (const name of await readdir('src/content/books')) {
    if (!name.endsWith('.md') || name.startsWith('_')) continue;
    const { data: source } = await readPageContent(`src/content/books/${name}`);
    const data = bookFields.parse(source);
    if (!data.draft && (demo || !data.demo)) books.push(data);
  }
  const byDate = (a, b) => new Date(b.publicationDate) - new Date(a.publicationDate);
  books.sort(byDate);
  const $ = pages.get('catalogue/index.html');
  assert.deepEqual(text($, '[data-book] h3'), books.map(book => book.title));
  assert.equal(bookPages.length, books.length);
  assert.equal($('main form, main select, main input').length, 0);
  const { data } = await readPageContent('src/content/pages/catalogue.md');
  assert.equal($('.result-count').text(), (books.length > 1 ? data.countPlural : data.countSingular).replaceAll('{count}', String(books.length)));
  assert.equal($('.empty-state').length, books.length ? 0 : 1);
  books.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || byDate(a, b));
  assert.deepEqual(text(home, '[data-book] h3'), books.slice(0, 3).map(book => book.title));
});

test('les listes et fiches du blog suivent les articles visibles et leur date', async () => {
  const posts = [];
  for (const name of await readdir('src/content/blog')) {
    if (!name.endsWith('.md') || name.startsWith('_')) continue;
    const { data } = await readPageContent(`src/content/blog/${name}`);
    const post = blogSchema.parse(data);
    if (!post.draft && (demo || !post.demo)) posts.push(post);
  }
  posts.sort((a, b) => b.date - a.date);
  assert.deepEqual(text(pages.get('blog/index.html'), '.journal-row h2'), posts.map(post => post.title));
  assert.deepEqual(text(home, '.journal-card h3'), posts.slice(0, 2).map(post => post.title));
  const articles = [...pages.keys()].filter(path => path.startsWith('blog/') && path !== 'blog/index.html');
  assert.equal(articles.length, posts.length);
});

test('les fiches adaptent les champs facultatifs, la seconde histoire, le contact et le partage', async () => {
  for (const [path, $] of bookPages) {
    const schema = JSON.parse($('script[type="application/ld+json"]').text());
    assert.equal(schema['@type'], 'Book', path);
    assert.match(schema.datePublished, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(new URL(schema.image).pathname, /\.(jpg|jpeg|png|webp)$/);
    assert.ok(await exists(join(root, new URL(schema.image).pathname)));
    assert.ok($('.detail-cover img').attr('alt').trim(), path);
    const title = $('h1').text();
    const sources = await readdir('src/content/books');
    const name = sources.find(name => name.slice(0, -3).toLowerCase() === path.split('/')[1]);
    const { data: source, body } = await readPageContent(`src/content/books/${name}`);
    const data = bookFields.parse(source);
    assert.equal(title, data.title);
    assert.equal($('.book-subtitle').text(), data.subtitle || '');
    assert.equal($('.book-info > .book-description').text(), data.description || '');
    assert.equal($('.book-info > .prose').length, body.trim() ? 1 : 0);
    assert.equal($('.book-facts > div').length, 1 + Number(Boolean(data.genre)) + Number(Boolean(data.series)) + Number(Boolean(data.volume)));
    assert.equal(schema.genre, data.genre || undefined);
    assert.equal($('.detail-cover img').attr('alt'), data.coverAlt || settings.books.coverAlt.replaceAll('{title}', () => title));
    assert.equal(schema.isbn, data.isbn);
    assert.equal(schema.publisher?.name, data.publisher);
    assert.equal($('a[href^="/contact/?livre="]').attr('href'), `/contact/?livre=${encodeURIComponent(title)}`);
    assert.equal($('.book-followed-by').length, schema.hasPart ? 1 : 0, path);
    if (schema.hasPart) {
      assert.equal($('.book-followed-by span').text(), schema.hasPart.name);
      assert.equal($('.book-second-story').length, schema.hasPart.description || schema.hasPart.abstract ? 1 : 0);
      if (schema.hasPart.abstract) assert.equal($('.book-second-story .prose p').toArray().map(el => $(el).text()).join('\n\n'), schema.hasPart.abstract);
    }
  }
  for (const [path, $] of pages) {
    for (const el of $('.book-series, .book-subtitle, .book-description, .book-info > .eyebrow, .book-facts dd, .book-meta').toArray()) {
      assert.ok($(el).text().trim(), path);
      assert.doesNotMatch($(el).text().trim(), /^(?:·|undefined|null)|(?:·|undefined|null)$|·\s*·/, path);
    }
  }
});

test('les livres et articles proposent uniquement le bouton de partage natif', () => {
  const sharePages = [...pages].filter(([path]) => path.startsWith('livres/') || (path.startsWith('blog/') && path !== 'blog/index.html'));
  for (const [path, $] of sharePages) {
    assert.equal($('.share-block button').length, 1, path);
    assert.equal($('.share-block a, .share-block input, .share-block details, [data-copy]').length, 0, path);
    assert.equal($('[data-share]').text().trim(), settings.share.shareLabel, path);
    assert.equal($('[data-share]').attr('data-url'), $('link[rel="canonical"]').attr('href'), path);
    assert.equal($('.share-status').attr('data-share-error'), settings.share.shareError, path);
  }
});

test('la biographie, le portrait et les données légales restent éditables', async () => {
  const { data: source } = await readPageContent('src/content/pages/auteur.md');
  const data = pageFields.parse(source);
  const $ = pages.get('auteur/index.html');
  assert.deepEqual(text($, '.author-page .prose > p:not(.eyebrow)'), data.biography);
  assert.ok($('.author-presentation').text().trim());
  assert.equal($('.author-portrait').length, Number(data.portrait.enabled));
  if (data.portrait.enabled) {
    assert.equal($('.author-portrait figcaption').text(), data.portrait.caption);
    if (!data.portrait.image) assert.equal($('.author-portrait-placeholder span').text(), data.portrait.placeholder);
  }
  for (const id of ['mentions-legales', 'confidentialite']) {
    const page = pages.get(`${id}/index.html`);
    assert.equal(page('.legal-updated time').attr('datetime'), settings.legal.updatedOn);
    assert.ok(page('.legal-facts dd').toArray().every(el => page(el).text().trim()));
  }
});

test('le sitemap et les robots suivent le mode de publication', async () => {
  assert.ok(await exists(join(root, 'sitemap-index.xml')));
  const robots = await readFile(join(root, 'robots.txt'), 'utf8');
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, demo ? /Disallow: \// : /Sitemap: https:\/\//);
});
