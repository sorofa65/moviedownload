import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import site from './src/data/site.json' assert { type: 'json' };

// ============================================================
// EVERYTHING here is pulled from src/data/site.json.
// Change the "url" field in site.json and rebuild — no code edits needed.
// ============================================================
export default defineConfig({
  site: site.url, // e.g. "https://yourdomain.com"
  integrations: [sitemap()],
  output: 'static'
});
