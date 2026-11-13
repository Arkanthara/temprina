import { readFile, writeFile } from 'node:fs/promises';
import { parse, stringify } from 'yaml';
import { siteSchema } from '../../src/lib/site-schema.mjs';
import { completeLegalInformation } from '../fixtures/legal.mjs';

export const readSettings = async () => siteSchema.parse(parse(await readFile('src/content/site.yaml', 'utf8')));
export const writeYaml = (path, data) => writeFile(path, stringify(data));
export const writeMarkdown = (path, { data, body }) => writeFile(path, `---\n${stringify(data)}---\n${body}\n`);
export async function productionSettings() {
  return { ...await readSettings(), legal: completeLegalInformation() };
}
export const productionEnv = {
  PUBLIC_SITE_URL: 'https://temprina.ch', PUBLIC_AUTHOR_NAME: 'Autrice de test',
  PUBLIC_CONTACT_EMAIL: 'contact@temprina.ch', PUBLIC_DEMO_MODE: 'false', PUBLIC_CONTENT_APPROVED: 'true',
};
