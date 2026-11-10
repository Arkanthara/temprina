import { test, expect } from '@playwright/test';

test('the entrance and universe switch connect two independent identities', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-universe', 'portal');
  await page.locator('.door-author .door-image').click();
  await expect(page).toHaveURL(/\/romans\/$/);
  await expect(page.locator('.hero h1')).toBeVisible();
  await page.locator('.universe-tabs a[href="/atelier/"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-universe', 'atelier');
  await expect(page.locator('.site-header .brand')).toContainText('L’Atelier des fées');
  await expect(page.locator('.site-header .brand img')).toHaveAttribute('src', '/images/atelier-logo.svg');
  await page.locator('.universe-tabs a[href="/romans/"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-universe', 'author');
  await expect(page.locator('.site-header .brand img')).toHaveAttribute('src', '/images/logo.png');
});

test('a drawing inspiration reaches contact and produces an honest reusable request', async ({ page }) => {
  await page.goto('/atelier/dessins/');
  await page.getByRole('link', { name: 'Découvrir L’herbier des songes', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('L’herbier des songes');
  await page.getByRole('link', { name: 'Imaginons votre dessin', exact: true }).click();
  await expect(page.getByLabel('Vous imaginez…')).toHaveValue('dessin');
  await expect(page.getByLabel('Une inspiration de la galerie')).toHaveValue('L’herbier des songes');
  await page.getByLabel('Votre nom').fill('Camille');
  await page.getByLabel('Votre e-mail').fill('camille@example.org');
  await page.getByLabel('Votre projet', { exact: false }).fill('Un bouquet de fleurs de montagne, dans des tons lilas.');
  await page.getByRole('button', { name: 'Copier ma demande' }).click();
  await expect(page.locator('#project-preview')).toHaveValue(/Nom : Camille\nE-mail : camille@example.org\nType de projet : Dessin \/ illustration\nInspiration : L’herbier des songes/);
  await expect(page.getByRole('status')).toContainText('Aucun message n’a été envoyé.');
  await page.getByLabel('Vous imaginez…').selectOption('couture');
  await expect(page.getByLabel('Une inspiration de la galerie')).toHaveValue('');
});

test('untrusted contact parameters stay outside the available inspirations', async ({ page }) => {
  await page.goto('/atelier/contact/?projet=inconnu&creation=%3Cscript%3Ealert(1)%3C%2Fscript%3E');
  await expect(page.getByLabel('Vous imaginez…')).toHaveValue('couture');
  await expect(page.getByLabel('Une inspiration de la galerie')).toHaveValue('');
  await expect(page.locator('form')).not.toContainText('<script>alert(1)</script>');
});

test('both universes and the drawing gallery work without JavaScript at 320 pixels', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 720 } });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4321/');
    await page.locator('.door-atelier .door-image').click();
    await page.getByRole('navigation').getByRole('link', { name: 'Dessins', exact: true }).click();
    await expect(page.locator('.creation-card')).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('link', { name: 'Découvrir Le jardin lunaire', exact: true }).click();
    await page.getByRole('link', { name: 'Imaginons votre dessin', exact: true }).click();
    await expect(page.locator('noscript p')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.universe-tabs a[href="/romans/"]').click();
    await expect(page.locator('.hero h1')).toBeVisible();
  } finally { await context.close(); }
});
