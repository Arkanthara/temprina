import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('production pages and configured email contact work', async ({ page }) => {
  test.skip(process.env.PUBLIC_DEMO_MODE !== 'false', 'Production configuration only');
  for (const route of ['/', '/catalogue/', '/auteur/', '/blog/', '/contact/', '/mentions-legales/', '/confidentialite/']) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.demo-bar')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  }
  await page.goto('/contact/?livre=Un%20roman');
  await expect(page.getByLabel('Objet',{exact:true})).toHaveValue('À propos du livre : Un roman');
  await expect(page.getByLabel('Votre message',{exact:true})).toHaveValue(/Un roman/);
  await expect(page.locator('.contact-detail a')).toHaveAttribute('href',`mailto:${process.env.PUBLIC_CONTACT_EMAIL}`);
  await expect(page.getByRole('button',{name:'Préparer mon e-mail'})).toBeVisible();
});
