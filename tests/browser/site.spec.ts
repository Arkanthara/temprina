import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync, readFileSync } from 'node:fs';
import { load } from 'cheerio';
import { parse } from 'yaml';
import { siteSchema } from '../../src/lib/site-schema.mjs';

const settings = siteSchema.parse(parse(readFileSync('src/content/site.yaml', 'utf8')));
const htmlFiles = readdirSync('dist', { recursive: true }).map(String).filter(path => path.endsWith('.html'));
const routes = htmlFiles.map(path => path === '404.html' ? '/404/' : '/' + path.replace(/index\.html$/, ''));
const catalogue = load(readFileSync('dist/catalogue/index.html', 'utf8'));
const bookCount = catalogue('[data-book]').length;
const contact = load(readFileSync('dist/contact/index.html', 'utf8'));
const email = contact('[data-contact]').attr('data-email');
const fillBook = (value: string, book: string) => value.replaceAll('{book}', () => book);
const contactSource = readFileSync('src/content/pages/contact.md', 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)![1];
const contactLabels = parse(contactSource).form;

test('toutes les pages sont lisibles, sans images manquantes ni défauts axe', async ({ page }) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
    for (const image of await page.locator('img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate(img => (img as HTMLImageElement).naturalWidth), { message: route }).toBeGreaterThan(0);
    }
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations, route).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test('le catalogue conserve tous ses livres et leur ordre avec des paramètres de lien', async ({ page }) => {
  const path = '/catalogue/?genre=Fantasy&series=inconnue&year=2026#contenu';
  await page.goto(path);
  await expect(page.locator('[data-book]:visible')).toHaveCount(bookCount);
  const dates = await page.locator('[data-book] time').evaluateAll(items => items.map(item => item.getAttribute('datetime')));
  expect(dates).toEqual([...dates].sort().reverse());
  await expect(page.locator('.result-count')).toHaveText(catalogue('.result-count').text());
  await expect(page).toHaveURL(`http://127.0.0.1:4321${path}`);
});

test('la navigation clavier et le menu mobile restent utilisables', async ({ page, isMobile }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: settings.skipContent })).toBeFocused();
  if (isMobile) {
    const menu = page.getByRole('button', { name: settings.navigation.menu, exact: true });
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('navigation').getByRole('link', { name: settings.navigation.catalogue })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
  }
});

test('le contact préremplit un titre littéral et respecte la configuration e-mail', async ({ page }) => {
  const book = 'Une lecture $& <lumineuse>';
  await page.goto(`/contact/?livre=${encodeURIComponent(book)}`);
  await expect(page.locator('[data-selected-book]')).toHaveText(fillBook(contactLabels.selectedBook, book));
  await expect(page.locator('[data-selected-book] lumineuse')).toHaveCount(0);
  if (email) {
    await expect(page.locator('#subject')).toHaveValue(fillBook(contactLabels.bookSubject, book));
    await expect(page.locator('#message')).toHaveValue(fillBook(contactLabels.bookMessage, book));
    await expect(page.locator('.contact-detail a')).toHaveAttribute('href', `mailto:${email}`);
    await expect(page.locator('form[data-contact]')).toBeVisible();
    await page.locator('#subject').fill('Mon objet & mon livre');
    await page.locator('#message').fill('Bonjour,\nUn message à partager.');
    await page.locator('form[data-contact] button').click();
    await expect(page.locator('[data-contact-status]')).toHaveText(contactLabels.status);
  } else {
    await expect(page.locator('.contact-pending')).toBeVisible();
    await expect(page.locator('form[data-contact]')).toHaveCount(0);
  }
});

test('le partage conserve une adresse canonique et un lien e-mail', async ({ page }) => {
  const bookLink = catalogue('[data-book] h3 a').first().attr('href');
  if (!bookLink) return;
  await page.goto(bookLink);
  await page.getByText(settings.share.addressLabel, { exact: true }).click();
  await expect(page.getByRole('textbox', { name: settings.share.urlLabel })).toHaveValue(new RegExp(`${bookLink}$`));
  await expect(page.getByRole('link', { name: settings.share.emailLabel })).toHaveAttribute('href', /^mailto:\?subject=/);
  await expect(page.locator('.share-actions a[target="_blank"]')).toHaveAttribute('rel', 'noopener noreferrer');
  const title = await page.locator('h1').innerText();
  await page.locator('a[href^="/contact/?livre="]').click();
  await expect(page.locator('[data-selected-book]')).toHaveText(fillBook(contactLabels.selectedBook, title));
});

test('la copie et le partage natif utilisent les libellés et l’adresse de la page', async ({ page }) => {
  const bookLink = catalogue('[data-book] h3 a').first().attr('href');
  if (!bookLink) return;
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: {
      writeText: async (value: string) => { document.documentElement.dataset.copiedUrl = value; },
    } });
    Object.defineProperty(navigator, 'share', { value: async (data: ShareData) => {
      document.documentElement.dataset.sharedUrl = data.url;
      document.documentElement.dataset.sharedTitle = data.title;
    } });
  });
  await page.goto(bookLink);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  await page.locator('[data-copy]').click();
  await expect(page.locator('.share-status')).toHaveText(settings.share.copied);
  await expect(page.locator('html')).toHaveAttribute('data-copied-url', canonical!);
  await page.locator('[data-share]').click();
  await expect(page.locator('html')).toHaveAttribute('data-shared-url', canonical!);
  await expect(page.locator('html')).toHaveAttribute('data-shared-title', await page.locator('[data-share]').getAttribute('data-title') || '');
});

test('le site se lit sans JavaScript sur un écran de 320 pixels', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 720 } });
  try {
    const page = await context.newPage();
    for (const route of routes) {
      await page.goto(`http://127.0.0.1:4321${route}`);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
    }
    await page.goto('http://127.0.0.1:4321/catalogue/');
    await expect(page.getByRole('navigation').getByRole('link', { name: settings.navigation.catalogue })).toBeVisible();
    await expect(page.locator('[data-book]:visible')).toHaveCount(bookCount);
    if (bookCount) {
      await page.locator('[data-book] h3 a').first().click();
      await expect(page.locator('.book-info h1')).toBeVisible();
    }
    await page.locator('.site-footer a[href="/mentions-legales/"]').click();
    await expect(page.locator('.legal-facts').first()).toBeVisible();
    await page.locator('.site-footer a[href="/confidentialite/"]').click();
    await expect(page.locator('.legal-facts').first()).toBeVisible();
    await page.goto('http://127.0.0.1:4321/contact/');
    await expect(page.locator('form[data-contact]')).not.toBeVisible();
    if (email) await expect(page.locator('.contact-detail a')).toHaveAttribute('href', `mailto:${email}`);
  } finally { await context.close(); }
});
