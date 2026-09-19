import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('src/data/movies');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
const required = ['slug','title','type','category','year','language','genre','episodesCount','posterImage','description','videoEmbedUrl'];
const slugs = new Map();
const errors = [];

for (const file of files) {
  const full = path.join(dir,file);
  let d;
  try { d = JSON.parse(fs.readFileSync(full,'utf8')); } catch (e) { errors.push(`${file}: invalid JSON`); continue; }
  for (const key of required) if (d[key] === undefined || d[key] === '') errors.push(`${file}: missing ${key}`);
  if (slugs.has(d.slug)) errors.push(`${file}: duplicate slug "${d.slug}" (also ${slugs.get(d.slug)})`);
  slugs.set(d.slug,file);
  if (d.type !== 'short-drama') errors.push(`${file}: type must be short-drama`);
  if (d.category !== 'short-drama') errors.push(`${file}: category must be short-drama`);
  if (!Array.isArray(d.genre) || !d.genre.length) errors.push(`${file}: genre must be a non-empty array`);
  if (!Number.isInteger(d.episodesCount) || d.episodesCount < 1) errors.push(`${file}: episodesCount must be a positive integer`);
  for (const key of ['posterImage','bannerImage','videoEmbedUrl']) {
    if (d[key] && !/^https?:\/\//.test(d[key]) && !d[key].startsWith('/')) errors.push(`${file}: ${key} must be an absolute URL or root-relative path`);
  }
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Validated ${files.length} short-drama JSON files.`);
