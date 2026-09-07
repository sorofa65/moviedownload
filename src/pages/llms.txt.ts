import type { APIRoute } from 'astro';
import site from '../data/site.json';
import movies from '../data/moviesLoader.js';

export const GET: APIRoute = () => {
  const lines: string[] = [];
  lines.push(`# ${site.name}`);
  lines.push(`> ${site.tagline}`);
  lines.push('');
  lines.push(site.description);
  lines.push('');
  lines.push('## About');
  lines.push(`${site.name} publishes independent movie and web series reviews. All "Watch Now" links point to official, licensed streaming platforms only; this site does not host, embed, or link to pirated or unauthorized downloads.`);
  lines.push('');
  lines.push('## Pages');
  for (const m of movies) {
    lines.push(`- [${m.title} (${m.year}) Review](${site.url}/movie/${m.slug}/): ${m.shortDescription}`);
  }
  lines.push('');
  lines.push('## Categories');
  const cats = [...new Set(movies.map((m) => m.category))];
  for (const c of cats) {
    lines.push(`- [${c}](${site.url}/category/${c}/)`);
  }
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain' } });
};
