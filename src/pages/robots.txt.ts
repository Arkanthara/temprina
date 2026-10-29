import type { APIRoute } from 'astro';
import { site } from '../lib/site';
export const GET: APIRoute = ({ site: origin }) => new Response(site.demo ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${new URL('sitemap-index.xml', origin)}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
