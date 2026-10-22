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
