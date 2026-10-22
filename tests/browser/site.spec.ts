import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = ['/', '/catalogue/', '/livres/le-chant-des-sylves/', '/auteur/', '/blog/', '/blog/quand-la-foret-devient-personnage/', '/contact/', '/mentions-legales/', '/confidentialite/', '/404/'];

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

test('catalogue combines filters, handles empty results, persists URL and resets', async ({ page }) => {
  await page.goto('/catalogue/');
  await expect(page.locator('[data-book]:visible')).toHaveCount(3);
  await page.getByLabel('Genre',{exact:true}).selectOption('Conte fantastique');
  await expect(page.locator('[data-book]:visible')).toHaveCount(1);
  await expect(page).toHaveURL(/genre=Conte/);
  await page.reload();
  await expect(page.locator('[data-book]:visible')).toHaveCount(1);
  await page.getByLabel('Année',{exact:true}).selectOption('2026');
  await expect(page.locator('[data-book]:visible')).toHaveCount(0);
  await expect(page.locator('[data-empty]')).toBeVisible();
  await page.getByRole('button',{name:'Réinitialiser'}).click();
  await expect(page.locator('[data-book]:visible')).toHaveCount(3);
  await page.getByLabel('Série',{exact:true}).selectOption('Les Chroniques d’Aëlor');
  await expect(page.locator('[data-book]:visible')).toHaveCount(2);
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
  await page.goto('http://127.0.0.1:4321/catalogue/');
  await expect(page.getByRole('navigation').getByRole('link',{name:'Les romans'})).toBeVisible();
  await expect(page.locator('[data-book]')).toHaveCount(3);
  await expect(page.locator('[data-filters]')).toBeHidden();
  await page.getByRole('heading',{name:'Le Chant des Sylves'}).getByRole('link').click();
  await expect(page.locator('h1')).toHaveText('Le Chant des Sylves');
  await context.close();
});
