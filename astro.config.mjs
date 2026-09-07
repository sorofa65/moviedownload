import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Read JSON with fs instead of an import assertion — import assertions
// ("assert { type: 'json' }" / "with { type: 'json' }") behave inconsistently
// across Node versions, and on some hosts (e.g. Netlify's build image) this
// silently resolves to `undefined`, which breaks @astrojs/sitemap with a
// "Cannot read properties of undefined (reading 'reduce')" error because
// `site` never gets set. Reading the file directly avoids that entirely.
const siteConfigPath = fileURLToPath(new URL('./src/data/site.json', import.meta.url));
const site = JSON.parse(readFileSync(siteConfigPath, 'utf-8'));

if (!site?.url || !/^https?:\/\//.test(site.url)) {
  throw new Error(
    `astro.config.mjs: "url" in src/data/site.json must be a full URL starting with http:// or https:// (got: ${JSON.stringify(site?.url)})`
  );
}

// ============================================================
// EVERYTHING here is pulled from src/data/site.json.
// Change the "url" field in site.json and rebuild — no code edits needed.
// ============================================================
export default defineConfig({
  site: site.url, // e.g. "https://yourdomain.com"
  integrations: [sitemap()],
  output: 'static'
});
