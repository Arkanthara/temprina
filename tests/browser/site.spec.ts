import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';

const bookCount = readdirSync('dist/livres', { withFileTypes: true }).filter(entry => entry.isDirectory()).length;
const routes = ['/', '/catalogue/', '/livres/le-chant-des-sylves/', '/livres/la-derniere-braise/', '/auteur/', '/blog/', '/blog/quand-la-foret-devient-personnage/', '/contact/', '/mentions-legales/', '/confidentialite/', '/404/'];

test('pages render without horizontal overflow, missing images or accessibility violations', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),route).toBe(true);
    expect(await page.locator('img').evaluateAll(images => images.every(img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)),route).toBe(true);
    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(accessibility.violations,route).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('catalogue displays all books in publication order without filter controls', async ({ page }) => {
  await page.goto('/catalogue/');
  const books = page.locator('[data-book]:visible');
  await expect(books).toHaveCount(bookCount);
  const dates = await books.locator('.book-meta time').evaluateAll(elements => elements.map(element => element.getAttribute('datetime')));
  expect(dates).toEqual([...dates].sort().reverse());
  for (const title of ['Les Veilleurs de Lune', 'Le Chant des Sylves', 'La Dernière Braise']) {
    await expect(books.getByRole('heading', { name: title, exact: true })).toBeVisible();
  }
  await expect(page.locator('.result-count')).toHaveText(`${bookCount} romans à découvrir`);
  await expect(page.getByRole('combobox')).toHaveCount(0);
  await expect(page.getByRole('searchbox')).toHaveCount(0);
  await expect(page.locator('form, [data-filter-notice]')).toHaveCount(0);
});

test('legacy filter parameters do not hide books or change the URL', async ({ page }) => {
  const path = '/catalogue/?genre=Fantasy&series=inconnue&year=2026&source=partage#contenu';
  await page.goto(path);
  await expect(page.locator('[data-book]:visible')).toHaveCount(bookCount);
  await expect(page.locator('.result-count')).toHaveText(`${bookCount} romans à découvrir`);
  await expect(page).toHaveURL(`http://127.0.0.1:4321${path}`);
  await page.reload();
  await expect(page.locator('[data-book]:visible')).toHaveCount(bookCount);
});

test('book contact preserves title and explicitly states contact is not configured', async ({ page }) => {
  await page.goto('/livres/le-chant-des-sylves/');
  await page.getByRole('link',{name:'Contacter l’auteur pour ce livre'}).click();
  await expect(page.locator('[data-selected-book]')).toContainText('Le Chant des Sylves');
  await expect(page.locator('.contact-pending')).toContainText('Aucun message ne peut être envoyé');
  await expect(page.locator('form[data-contact]')).toHaveCount(0);
});

test('navigation remains keyboard accessible and mobile menu closes with Escape', async ({ page, isMobile }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'Aller au contenu'})).toBeFocused();
  if (isMobile) {
    const menu = page.getByRole('button',{name:'Menu'});
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded','true');
    await expect(page.getByRole('navigation').getByRole('link',{name:'Les romans'})).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded','false');
    await expect(menu).toBeFocused();
  }
});

test('share fallback gives the canonical URL and email share link', async ({ page }) => {
  await page.goto('/livres/le-chant-des-sylves/');
  await page.getByText('Adresse de cette page',{exact:true}).click();
  await expect(page.getByRole('textbox',{name:'Lien de partage'})).toHaveValue(/\/livres\/le-chant-des-sylves\/$/);
  await expect(page.getByRole('link',{name:'Par e-mail'})).toHaveAttribute('href',/^mailto:\?subject=Le%20Chant/);
});

test('reading and navigation work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled:false, viewport:{width:390,height:844} });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/catalogue/?genre=Fantasy&year=2026');
  await expect(page.getByRole('navigation').getByRole('link',{name:'Les romans'})).toBeVisible();
  await expect(page.locator('[data-book]:visible')).toHaveCount(bookCount);
  await expect(page.locator('form, [data-filter-notice]')).toHaveCount(0);
  await expect(page.locator('.result-count')).toHaveText(`${bookCount} romans à découvrir`);
  await page.getByRole('heading',{name:'Le Chant des Sylves'}).getByRole('link').click();
  await expect(page.locator('h1')).toHaveText('Le Chant des Sylves');
  await context.close();
});


test('minimal and complete books adapt their cards and detail pages to available fields', async ({ page }) => {
  await page.goto('/catalogue/');
  const minimal = page.locator('[data-book]').filter({ has: page.getByRole('heading', { name: 'La Dernière Braise', exact: true }) });
  await expect(minimal.locator('.book-meta')).toHaveText('2024');
  await expect(minimal.locator('.book-subtitle, .book-series, .book-description')).toHaveCount(0);
  await expect(minimal.locator('img')).toHaveAttribute('alt', 'Couverture de La Dernière Braise');
  const complete = page.locator('[data-book]').filter({ has: page.getByRole('heading', { name: 'Le Chant des Sylves', exact: true }) });
  await expect(complete.locator('.book-subtitle')).toHaveText('Lorsque la forêt se souvient.');
  await expect(complete.locator('.book-series')).toHaveText('Les Chroniques d’Aëlor · Tome 1');
  await expect(complete.locator('.book-description')).toBeVisible();
  await minimal.getByRole('heading').getByRole('link').click();
  await expect(page.locator('h1')).toHaveText('La Dernière Braise');
  await expect(page.locator('.book-info > .eyebrow, .book-subtitle, .book-description, .book-info .prose')).toHaveCount(0);
  await expect(page.locator('.book-facts dt')).toHaveText(['Publication']);
  await expect(page.locator('.detail-cover img')).toHaveAttribute('alt', 'Couverture de La Dernière Braise');
  await page.goto('/livres/le-chant-des-sylves/');
  await expect(page.locator('.book-info > .eyebrow')).toHaveText('Fantasy · Les Chroniques d’Aëlor · Tome 1');
  await expect(page.locator('.book-subtitle')).toHaveText('Lorsque la forêt se souvient.');
  await expect(page.locator('.book-description')).toBeVisible();
  await expect(page.locator('.book-info .prose')).toBeVisible();
  await expect(page.locator('.book-facts dt')).toHaveText(['Publication', 'Genre', 'Série', 'Tome']);
});
