import type { APIRoute } from 'astro';
import site from '../data/site.json';
import movies from '../data/moviesLoader.js';
const staticPaths=['/','/about/','/contact/','/privacy-policy/','/disclaimer/','/category/short-drama/'];
export const GET:APIRoute=()=>{
  const now=new Date().toISOString().slice(0,10);
  const urls=[...staticPaths,...movies.map((m)=>`/drama/${m.slug}/`)];
  const body=`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u)=>{const m=movies.find((x)=>`/drama/${x.slug}/`===u);const lastmod=m?.releaseDate||now;return `  <url><loc>${new URL(u,site.url).toString()}</loc><lastmod>${lastmod}</lastmod></url>`;}).join('\n')}
</urlset>`;
  return new Response(body,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
};
