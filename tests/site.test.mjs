import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { load } from 'cheerio';

const root = resolve('dist');
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(join(dir,entry.name)) : join(dir,entry.name)))).flat();
}
const files = await walk(root);
const htmlFiles = files.filter(file => file.endsWith('.html'));
const exists = async path => { try { return (await stat(path)).isFile(); } catch { return false; } };

test('all pages have French language, accessible structure and SEO metadata', async () => {
  assert.ok(htmlFiles.length >= 8);
  const titles = new Set();
  for (const file of htmlFiles) {
    const $ = load(await readFile(file,'utf8'));
    assert.equal($('html').attr('lang'),'fr', file);
    assert.equal($('h1').length,1,file);
    assert.equal($('main#contenu').length,1,file);
    assert.ok($('title').text().length > 12,file);
    assert.ok(!titles.has($('title').text()), `Duplicate title: ${file}`);
    titles.add($('title').text());
    assert.ok($('meta[name="description"]').attr('content'),file);
    assert.ok($('link[rel="canonical"]').attr('href')?.startsWith('https://'),file);
    assert.ok($('meta[property="og:image"]').attr('content'),file);
    for (const img of $('img').toArray()) assert.notEqual($(img).attr('alt'),undefined,file);
    for (const script of $('script[type="application/ld+json"]').toArray()) assert.ok(JSON.parse($(script).text())['@type'],file);
  }
});

test('every internal link, fragment, image and script resolves in the build', async () => {
  for (const file of htmlFiles) {
    const $ = load(await readFile(file,'utf8'));
    const path = file.slice(root.length).replace(/index\.html$/,'');
    const origin = new URL(path,'https://local.test');
    for (const element of $('[href], [src], [srcset]').toArray()) {
      const el = $(element);
      const refs = [el.attr('href'),el.attr('src'),...(el.attr('srcset') || '').split(',').map(src => src.trim().split(/\s+/)[0])].filter(Boolean);
      for (const ref of refs) {
        if (/^(mailto:|tel:|data:|https?:\/\/)/.test(ref)) continue;
        const target = new URL(ref, origin);
        const pathname = decodeURIComponent(target.pathname);
        let dest = join(root,pathname);
        if (pathname.endsWith('/')) dest = join(dest,'index.html');
        assert.ok(await exists(dest), `Broken ${ref} from ${file}`);
        if (target.hash && dest.endsWith('.html')) {
          const targetPage = load(await readFile(dest,'utf8'));
          assert.ok(targetPage('[id]').toArray().some(e => targetPage(e).attr('id') === decodeURIComponent(target.hash.slice(1))), `Broken fragment ${ref} from ${file}`);
        }
      }
    }
  }
});

test('sitemap and crawler policy are generated', async () => {
  assert.ok(await exists(join(root,'sitemap-index.xml')));
  const robots = await readFile(join(root,'robots.txt'),'utf8');
  assert.match(robots,/User-agent: \*/);
  const homepage = await readFile(join(root,'index.html'),'utf8');
  if (homepage.includes('noindex, nofollow')) assert.match(robots,/Disallow: \//);
  else assert.match(robots,/Sitemap: https:\/\//);
});

test('demo book metadata includes a raster image for social sharing', async () => {
  for (const file of htmlFiles.filter(file => file.includes('/livres/'))) {
    const $ = load(await readFile(file,'utf8'));
    const book = JSON.parse($('script[type="application/ld+json"]').text());
    assert.equal(book['@type'],'Book');
    assert.match(book.datePublished,/^\d{4}-\d{2}-\d{2}$/);
    const path = new URL(book.image).pathname;
    assert.match(path,/\.(jpg|jpeg|png|webp)$/);
    assert.ok(await exists(join(root,path)));
    assert.ok($('a[href^="/contact/?livre="]').length);
  }
});

test('author logo is used in the header, footer, homepage and favicon', async () => {
  for (const file of htmlFiles) {
    const $ = load(await readFile(file, 'utf8'));
    for (const container of ['.site-header', '.site-footer']) {
      const logo = $(`${container} .brand img`);
      assert.equal(logo.attr('src'), '/images/logo.png', file);
      assert.equal(logo.attr('alt'), '', file);
      assert.equal(logo.attr('width'), logo.attr('height'), file);
    }
    assert.equal($('link[rel="icon"]').attr('href'), '/images/logo.png', file);
    assert.equal($('link[rel="icon"]').attr('type'), 'image/png', file);
  }
  const $ = load(await readFile(join(root, 'index.html'), 'utf8'));
  assert.equal($('.ornament img').attr('src'), '/images/logo.png');
  assert.deepEqual(await readFile(join(root, 'images/logo.png')), await readFile('public/images/logo.png'));
});

test('catalogue lists every published book without filtering controls or catalogue scripts', async () => {
  const $ = load(await readFile(join(root, 'catalogue/index.html'), 'utf8'));
  assert.equal($('main form, main select, main input, [data-filters], [data-filter-notice]').length, 0);
  assert.equal($('main script').length, 0);
  const bookTitles = $('[data-book] h3').toArray().map(heading => $(heading).text());
  const publishedTitles = await Promise.all(htmlFiles.filter(file => file.includes('/livres/')).map(async file => {
    const page = load(await readFile(file, 'utf8'));
    return page('h1').text();
  }));
  assert.deepEqual(bookTitles.toSorted(), publishedTitles.toSorted());
  assert.equal($('.result-count').text(), `${bookTitles.length} roman${bookTitles.length > 1 ? 's' : ''} à découvrir`);
  assert.equal($('.empty-state').length, bookTitles.length ? 0 : 1);
});


test('minimal book renders only supplied fields and retains accessible covers and SEO', async () => {
  const source = await readFile('src/content/books/la-derniere-braise.md', 'utf8');
  assert.deepEqual(source.split('---')[1].trim().split('\n').map(line => line.split(':')[0]), ['title', 'publicationDate', 'cover']);
  const $ = load(await readFile(join(root, 'livres/la-derniere-braise/index.html'), 'utf8'));
  assert.equal($('h1').text(), 'La Dernière Braise');
  assert.equal($('.book-info > .eyebrow, .book-subtitle, .book-description, .book-info .prose').length, 0);
  assert.deepEqual($('.book-facts dt').toArray().map(el => $(el).text()), ['Publication']);
  assert.equal($('.detail-cover img').attr('alt'), 'Couverture de La Dernière Braise');
  assert.match($('meta[name="description"]').attr('content'), /La Dernière Braise/);
  const schema = JSON.parse($('script[type="application/ld+json"]').text());
  assert.equal('description' in schema, false);
  assert.equal('genre' in schema, false);
  for (const path of ['catalogue/index.html', 'index.html']) {
    const page = load(await readFile(join(root, path), 'utf8'));
    const card = page('[data-book]').filter((_, el) => page(el).find('h3').text() === 'La Dernière Braise');
    // The homepage deliberately shows at most three books.
    if (path.startsWith('catalogue')) assert.equal(card.length, 1);
    if (!card.length) continue;
    assert.equal(card.find('.book-meta').text().trim(), '2024');
    assert.equal(card.find('.book-subtitle, .book-series, .book-description').length, 0);
    assert.equal(card.find('img').attr('alt'), 'Couverture de La Dernière Braise');
  }
});

test('complete book renders optional fields on the homepage, catalogue and detail page', async () => {
  const description = 'Au cœur d’une forêt qui perd sa mémoire, une jeune cartographe entend un chant que personne ne devrait plus connaître.';
  for (const path of ['index.html', 'catalogue/index.html']) {
    const $ = load(await readFile(join(root, path), 'utf8'));
    const card = $('[data-book]').filter((_, el) => $(el).find('h3').text() === 'Le Chant des Sylves');
    assert.equal(card.length, 1);
    assert.equal(card.find('.book-subtitle').text(), 'Lorsque la forêt se souvient.');
    assert.equal(card.find('.book-series').text(), 'Les Chroniques d’Aëlor · Tome 1');
    assert.equal(card.find('.book-description').text(), description);
    assert.match(card.find('img').attr('alt'), /arbre d’or/);
  }
  const $ = load(await readFile(join(root, 'livres/le-chant-des-sylves/index.html'), 'utf8'));
  assert.equal($('.book-info > .eyebrow').text(), 'Fantasy · Les Chroniques d’Aëlor · Tome 1');
  assert.equal($('.book-subtitle').text(), 'Lorsque la forêt se souvient.');
  assert.equal($('.book-description').text(), description);
  assert.ok($('.book-info .prose').text().trim());
  assert.deepEqual($('.book-facts dt').toArray().map(el => $(el).text()), ['Publication', 'Genre', 'Série', 'Tome']);
  const schema = JSON.parse($('script[type="application/ld+json"]').text());
  assert.equal(schema.description, description);
  assert.equal(schema.genre, 'Fantasy');
  assert.equal(schema.publisher.name, 'Éditions des Sylves (fictives)');
  assert.equal(schema.isbn, '9780000000002');
});

test('optional metadata never leaves empty elements, separators or cover alternatives', async () => {
  for (const file of htmlFiles) {
    const $ = load(await readFile(file, 'utf8'));
    for (const element of $('.book-series, .book-subtitle, .book-description, .book-info > .eyebrow, .book-facts dd, .book-meta').toArray()) {
      const value = $(element).text().trim();
      assert.ok(value, file);
      assert.doesNotMatch(value, /^(?:·|undefined|null)|(?:·|undefined|null)$|·\s*·/, file);
    }
    for (const cover of $('.book-art img, .detail-cover img').toArray()) assert.ok($(cover).attr('alt')?.trim(), file);
  }
});
