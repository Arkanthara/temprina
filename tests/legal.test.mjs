import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { productionSettings, writeYaml } from './helpers/content.mjs';
import { legalSchema, missingLegalFields } from '../src/lib/site-schema.mjs';
import { validateProduction } from '../scripts/validate-production.mjs';
import { completeLegalInformation } from './fixtures/legal.mjs';

// Guard the actual risks of public, editable credits: dangerous URLs and misleading completeness.
test('developer links require HTTP(S), a name and a valid display configuration', () => {
  const data = completeLegalInformation();
  assert.equal(legalSchema.safeParse(data).success, true, 'Developer credit is optional');
  data.developer.showInFooter = true;
  assert.equal(legalSchema.safeParse(data).success, false, 'Do not display an anonymous credit');
  data.developer.name = 'Studio <création> & associés';
  for (const url of ['javascript:alert(1)', 'data:text/html,hello', 'not a URL']) {
    data.developer.url = url;
    assert.equal(legalSchema.safeParse(data).success, false, url);
  }
  data.developer.url = 'https://example.org/studio/';
  assert.equal(legalSchema.safeParse(data).success, true);
  data.updatedOn = '2026-02-30';
  assert.equal(legalSchema.safeParse(data).success, false, 'The published date must exist');
});

test('completeness checks retain the email fallback and reject missing facts and editing markers', () => {
  const data = completeLegalInformation();
  assert.deepEqual(missingLegalFields(data), []);
  data.publisher.email = '';
  assert.deepEqual(missingLegalFields(data), ['publisher.email', 'privacy.contactEmail']);
  assert.deepEqual(missingLegalFields(data, 'contact@example.org'), []);
  data.privacy.hostingRetention = 'À confirmer';
  data.privacy.processingCountries = '';
  data.hosting.service = 'TODO';
  assert.deepEqual(missingLegalFields(data, 'contact@example.org'), ['hosting.service', 'privacy.hostingRetention', 'privacy.processingCountries']);
});

test('approved legal pages do not bypass incomplete, invalid or missing common information', async () => {
  const root = await mkdtemp(join(tmpdir(), 'temprina-legal-'));
  const settingsPath = join(root, 'site.yaml');
  const env = { PUBLIC_SITE_URL: 'https://temprina.ch', PUBLIC_AUTHOR_NAME: 'Éditrice de test', PUBLIC_CONTACT_EMAIL: 'contact@temprina.ch', PUBLIC_DEMO_MODE: 'false', PUBLIC_CONTENT_APPROVED: 'true' };
  try {
    await writeFile(join(root, 'auteur.md'), '---\ntemplate: author\nbiography: [Un parcours.]\n---\nPrésentation.');
    for (const id of ['mentions-legales', 'confidentialite']) await writeFile(join(root, `${id}.md`), '---\ntemplate: legal\napproved: true\n---\nTexte relu.');
    const settings = await productionSettings();
    const data = settings.legal;
    await writeYaml(settingsPath, settings);
    assert.deepEqual(await validateProduction({ env, contentRoot: root, settingsPath }), []);
    data.privacy.hostingCookies = '';
    await writeYaml(settingsPath, settings);
    assert.match((await validateProduction({ env, contentRoot: root, settingsPath })).join('\n'), /privacy.hostingCookies/);
    data.developer.name = 'Studio';
    data.developer.url = 'javascript:alert(1)';
    await writeYaml(settingsPath, settings);
    assert.match((await validateProduction({ env, contentRoot: root, settingsPath })).join('\n'), /developer.url/);
    await rm(settingsPath);
    assert.match((await validateProduction({ env, contentRoot: root, settingsPath })).join('\n'), /manquant ou illisible/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
