import type { APIRoute } from 'astro';
import site from '../data/site.json';

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /
Disallow: /search/

Sitemap: ${site.url}/sitemap.xml
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
