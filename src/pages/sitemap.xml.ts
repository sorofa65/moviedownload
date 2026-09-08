import type { APIRoute } from 'astro';
import site from '../data/site.json';
import movies from '../data/moviesLoader.js';

// Own sitemap generator — replaces @astrojs/sitemap, which had a
// version-compatibility bug with this Astro version. No external
// dependency means nothing here can break on an unrelated package update.

const staticPaths = [
  '/',
  '/about/',
  '/contact/',
  '/privacy-policy/',
  '/disclaimer/'
];

export const GET: APIRoute = () => {
  const categories = [...new Set(movies.map((m) => m.category))];

  const urls = [
    ...staticPaths,
    ...categories.map((c) => `/category/${c}/`),
    ...movies.map((m) => `/movie/${m.slug}/`)
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${new URL(u, site.url).toString()}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' }
  });
};
