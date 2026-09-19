import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('src/data/movies');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
const required = ['slug','title','type','category','year','language','genre','episodesCount','posterImage','description','videoEmbedUrl'];
const slugs = new Map();
const errors = [];
const warnings = [];
const groups = new Map(); // "file|kind" -> episode numbers
const group = (file, kind, num) => { const k = `${file}|${kind}`; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(num); };
const isPlaceholderUrl = (u) => { try { return /(^|\.)example\.(com|org|net)$/.test(new URL(u).hostname.toLowerCase()); } catch { return false; } };

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
// ---- Episode-drama system (src/data/dramas) ----
const dramaDir = path.resolve('src/data/dramas');
if (fs.existsSync(dramaDir)) {
  const dramaFiles = fs.readdirSync(dramaDir).filter((f) => f.endsWith('.json'));
  const dramaRequired = ['slug', 'title', 'totalEpisodes', 'posterImage', 'description', 'episodes'];
  const dramaSlugs = new Map();
  for (const file of dramaFiles) {
    const full = path.join(dramaDir, file);
    let d;
    try { d = JSON.parse(fs.readFileSync(full, 'utf8')); } catch (e) { errors.push(`dramas/${file}: invalid JSON`); continue; }
    for (const key of dramaRequired) if (d[key] === undefined || d[key] === '') errors.push(`dramas/${file}: missing ${key}`);
    if (slugs.has(d.slug) || dramaSlugs.has(d.slug)) errors.push(`dramas/${file}: duplicate slug "${d.slug}"`);
    dramaSlugs.set(d.slug, file);
    if (!Number.isInteger(d.totalEpisodes) || d.totalEpisodes < 1) errors.push(`dramas/${file}: totalEpisodes must be a positive integer`);
    if (!Array.isArray(d.episodes) || !d.episodes.length) errors.push(`dramas/${file}: episodes must be a non-empty array`);
    else {
      const epNums = new Set();
      for (const ep of d.episodes) {
        if (!Number.isInteger(ep.number) || ep.number < 1) errors.push(`dramas/${file}: each episode needs a positive integer "number"`);
        if (epNums.has(ep.number)) errors.push(`dramas/${file}: duplicate episode number ${ep.number}`);
        epNums.add(ep.number);
        if (!ep.locked && !ep.videoUrl) errors.push(`dramas/${file}: episode ${ep.number} needs a videoUrl or must be marked "locked": true`);
        if (ep.videoUrl && !/^https?:\/\//.test(ep.videoUrl)) errors.push(`dramas/${file}: episode ${ep.number} videoUrl must be an absolute URL`);
        if (ep.videoUrl && isPlaceholderUrl(ep.videoUrl)) group(file, 'videoUrl', ep.number);
        if (ep.smartLink && isPlaceholderUrl(ep.smartLink)) group(file, 'smartLink', ep.number);
      }
    }
    if (d.fullVideoUrl && isPlaceholderUrl(d.fullVideoUrl)) warnings.push(`dramas/${file}: fullVideoUrl is still a placeholder (example.com) — the "Get Full Video" banner is hidden until you set a real link.`);
    for (const key of ['posterImage', 'bannerImage', 'fullVideoUrl']) {
      if (d[key] && !/^https?:\/\//.test(d[key]) && !d[key].startsWith('/')) errors.push(`dramas/${file}: ${key} must be an absolute URL or root-relative path`);
    }
  }
  if (dramaFiles.length) console.log(`Validated ${dramaFiles.length} episode-drama JSON files.`);
}

for (const [k, nums] of groups) {
  const [file, kind] = k.split('|');
  warnings.push(kind === 'videoUrl'
    ? `dramas/${file}: ${nums.length} episode(s) [${nums.join(', ')}] still have a placeholder videoUrl (example.com) — they will NOT play. Put the real video/embed link there.`
    : `dramas/${file}: ${nums.length} episode(s) [${nums.join(', ')}] still have a placeholder smartLink (example.com) — ignored until you set a real link.`);
}
if (warnings.length) {
  console.warn(`\n⚠ ${warnings.length} warning(s) (build will still continue):`);
  console.warn(warnings.map((w) => '  - ' + w).join('\n') + '\n');
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Validated ${files.length} short-drama JSON files.`);
