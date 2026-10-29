import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnvFile } from 'node:process';

try { loadEnvFile('.env'); } catch (error) { if (error.code !== 'ENOENT') throw error; }

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://example.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: (page) => !/\/404(?:\.html|\/)$/.test(page) })],
});
