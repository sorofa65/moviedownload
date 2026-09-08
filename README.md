# CineReview — Astro Movie Review Site (JSON-driven)

Ekta original, light/white-theme movie & series review site. Sob content, SEO,
ads, sitemap, robots.txt, llms.txt — 4 ta JSON file update korle full site
auto update hoye jay. Kono code touch korte hobe na.

## Setup

```bash
npm install
npm run dev       # local preview
npm run build     # production build -> dist/
```

`npm run build`-er por auto generate hoy:
- `dist/sitemap.xml` (custom endpoint, kono external package lagbe na)
- `dist/robots.txt`
- `dist/llms.txt`
- প্রতিটা movie/category page-e full meta tags, Open Graph, Twitter card,
  JSON-LD schema (Movie/TVSeries + Organization) — SEO + AEO/GEO (AI answer
  engines) er jonno.

## Tumi ja edit korbe

### 1. `src/data/site.json`
Site name, domain URL, menu, footer, social links, default SEO description.
**`url` field ta tomar real domain diye replace koro build korar age** —
sitemap/canonical/OG sob eta theke generate hoy.

### 2. `src/data/movies/*.json` — one file per movie
প্রতিটা movie/series-এর জন্য আলাদা ছোট JSON file — এক জায়গায় সব গাদাগাদি
নেই। নতুন movie add করতে চাইলে:

```
src/data/movies/my-new-movie-2026.json
```

এই নামে একটা নতুন ফাইল বানাও (নাম যা খুশি রাখতে পারো, শুধু `.json` হতে
হবে)। ভেতরে নিচের structure দাও — build হওয়ার সাথে সাথেই এটা homepage,
তার category page, sitemap, llms.txt, এবং নিজের `/movie/<slug>/` page-এ
auto যুক্ত হয়ে যাবে। কোনো অন্য file touch করার দরকার নেই।

Fields:
- `slug` — URL part (unique)
- `posterImage` / `bannerImage` — path, e.g. `/images/movies/xyz.jpg`
  (image file `public/images/movies/` folder-e rakho)
- `watchLinks` — **শুধু official/legal platform link** (Netflix, Prime,
  JioCinema, Hotstar etc.) — এখানে কোনো download/pirated link দিও না।
  প্রতিটা link object-এ `"adEnabled": true/false` দিয়ে সেই নির্দিষ্ট
  Watch Now বাটনের ঠিক উপরে ad দেখাবে কিনা আলাদাভাবে control করতে পারবে —
  একটা প্ল্যাটফর্মে ad দেখাবে, আরেকটাতে দেখাবে না, এভাবে সাজানো যায়
- `videoEmbedUrl` — অফিসিয়াল ট্রেলার/প্রোমো ভিডিওর embed link (যেমন
  YouTube embed URL: `https://www.youtube.com/embed/VIDEO_ID`)। দিলে
  পেজে একটা styled, responsive video player দেখাবে "Synopsis"-এর জায়গায়।
  খালি রাখলে (`""`) সেই section-টা স্কিপ হয়ে যাবে। এটা শুধু official
  trailer/promo-র জন্য — পুরো মুভি এখানে embed করার অধিকার তোমার নেই
- `seoTitle` / `seoDescription` — per-page override, না দিলে default হয়

একটা movie মুছে ফেলতে চাইলে শুধু ওই ফাইলটা delete করলেই হবে — অন্য কিছু
বদলাতে হবে না।

### 3. `src/data/ads.json`
Third-party ad network (Adsterra, PropellerAds, ইত্যাদি) er code এখানে।
- `slots.*.code` — সেই position-এর raw ad HTML/JS snippet
- `slots.*.enabled` — true/false দিয়ে on/off
- `networkScripts.global` — site-wide script (e.g. Adsterra Social Bar/push
  notification script) যেটা প্রতি পেজে body-র শেষে load হবে
- `telegramPromo` — visitor-দের Telegram channel join করতে বলা popup।
  `channels` array-এ তোমার channel(s)-এর নাম + link দাও। একবার close/join
  করলে `remindAfterHours` সময় পার না হওয়া পর্যন্ত আর দেখাবে না
  (browser-এর localStorage ব্যবহার করে, per-visitor)
- `stickyBottomAd` — screen-এর নিচে সবসময় আটকে থাকা পাতলা banner ad (close
  বাটন সহ)
- `periodicTopAd` — উপর থেকে `intervalSeconds` পরপর slide করে নেমে আসে,
  `visibleSeconds` দেখা যায়, তারপর আবার উপরে চলে যায় — repeat হতে থাকে

Ad placements ইচ্ছাকৃতভাবে standard, clearly-labeled positions-এ রাখা
(header banner, in-article, sidebar, sticky bottom, periodic top) — fake
close button/fake play button style dark pattern নেই, কারণ oi type
placement বেশিরভাগ ad network-এর policy violation এবং account ban হওয়ার
ঝুঁকি বাড়ায়। Clean visible placement + ভালো traffic-ই sustainable
CTR/income দেয়।

### 4. Images
`public/images/` folder-e রাখো:
- `public/images/logo.png`
- `public/images/og-default.jpg`
- `public/images/movies/<slug>-poster.jpg`, `<slug>-banner.jpg`

Tumi bolechile "json e image link/download link update korbo" — thik ache,
JSON-e শুধু path/URL বসালেই চলবে (local file path অথবা কোনো external image
CDN link, দুটোই কাজ করবে)।

## Deploy
Static build (`dist/`) — Netlify, Vercel, Cloudflare Pages, GitHub Pages,
ya যেকোনো static host-e deploy kora jabe.
