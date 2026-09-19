import type { APIRoute } from 'astro';
import site from '../data/site.json';
import movies from '../data/moviesLoader.js';
import dramas from '../data/dramasLoader.js';
export const GET:APIRoute=()=>{
  const lines=[`# ${site.name}`,`> ${site.tagline}`,'',site.description,'','## Short dramas'];
  for(const m of movies) lines.push(`- [${m.title}](${site.url}/drama/${m.slug}/): ${m.description}`);
  lines.push('','## New Drama (multi-episode series)');
  for(const d of dramas) lines.push(`- [${d.title}](${site.url}/series/${d.slug}/): ${d.description}`);
  return new Response(lines.join('\n'),{headers:{'Content-Type':'text/plain; charset=utf-8'}});
};
