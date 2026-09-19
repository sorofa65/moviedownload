# CineReview — Full Setup, Content & Ads Guide

এই guide-এ ৩টা অংশ আছে:
1. Site setup ও deploy করার ধাপ
2. Content (নতুন movie/series review) তৈরি করার জন্য ready-made prompt
3. Ads (Adsterra/PropellerAds/Telegram) setup গাইড

---

## Part 1 — Setup & Deploy

### Step 1: Local এ চালানো
```bash
unzip movie-site.zip
cd movie-site
npm install
npm run dev
```
Browser এ `http://localhost:4321` খুললে site দেখতে পাবে।

### Step 2: Domain বসানো
`src/data/site.json` খুলে:
```json
"url": "https://yourdomain.com"
```
তোমার real domain দিয়ে replace করো। এটা sitemap, canonical URL, robots.txt, llms.txt, OG image — সবকিছুর ভিত্তি।

### Step 3: Logo ও images বসানো
`public/images/` ফোল্ডারে রাখো:
- `logo.png`
- `og-default.jpg` (social share preview image, 1200×630 ভালো সাইজ)
- `movies/<slug>-poster.jpg`, `<slug>-banner.jpg`, screenshots

### Step 4: Build
```bash
npm run build
```
`dist/` ফোল্ডারে পুরো static site তৈরি হবে — এর ভিতরে `sitemap.xml`, `robots.txt`, `llms.txt` auto generate হয়ে থাকবে।

### Step 5: Deploy (যেকোনো একটা)
- **Netlify**: drag-and-drop `dist/` folder, অথবা GitHub repo connect করে build command `npm run build`, publish dir `dist`
- **Vercel**: GitHub repo import করলেই auto-detect করবে Astro
- **Cloudflare Pages**: build command `npm run build`, output dir `dist`

Deploy হওয়ার পর Google Search Console এ sitemap submit করো:
`https://yourdomain.com/sitemap.xml`

---

## Part 2 — Content তৈরি করার Prompt

প্রতিটা নতুন movie/series-এর জন্য `src/data/movies/` ফোল্ডারে একটা নতুন
JSON file বানাতে হবে (যেমন `src/data/movies/my-movie-2026.json`) — সব
মুভি একসাথে একটা ফাইলে না রেখে আলাদা আলাদা রাখলে গোছানো থাকে। নিচের
prompt টা Claude/ChatGPT-কে দিলে সরাসরি JSON বানিয়ে দিবে — শুধু movie-র
নাম আর তথ্য বদলাতে হবে।

### Copy-paste করার prompt:

```
Tumi ekjon movie review writer. Amake ekta JSON object banaye dao ei
structure follow kore, movie/series: "<MOVIE NAME>" (<YEAR>) er upore.
Shudhu official/legal streaming info likho, kono download/piracy link na.

{
  "slug": "url-friendly-slug",
  "title": "Movie Title",
  "year": 2026,
  "category": "bollywood | hollywood | web-series | regional",
  "genre": ["Genre1", "Genre2"],
  "language": "Hindi/English/etc",
  "rating": 7.5,
  "posterImage": "/images/movies/slug-poster.jpg",
  "bannerImage": "/images/movies/slug-banner.jpg",
  "shortDescription": "One-line hook, under 20 words",
  "screenshots": ["/images/movies/slug-screenshot-1.jpg"],
  "review": "150-250 word spoiler-free review. Tone: honest, balanced,
    mention strengths and weaknesses, no exaggerated claims.",
  "cast": ["Actor 1", "Actor 2", "Actor 3"],
  "director": "Director Name",
  "releaseDate": "YYYY-MM-DD",
  "watchLinks": [
    { "platform": "Netflix/Prime/etc", "url": "REAL official URL", "type": "subscription" }
  ],
  "trailerUrl": "",
  "seoTitle": "Movie Title (Year) Review, Cast & Where to Watch — under 60 chars",
  "seoDescription": "150-160 char meta description mentioning review + where to watch legally"
}

Output shudhu ei ekta JSON object, kono extra text chara. Eta shorasori
ekta notun file hishebe save korbe, jemon
`src/data/movies/<slug>-<year>.json`.
```

এই JSON টাকে `src/data/movies/` ফোল্ডারে একটা নতুন `.json` ফাইলে সেভ করে
দিলেই নতুন page auto তৈরি হয়ে যাবে — SEO meta, sitemap entry, category
page, similar-titles — সব auto।

**মনে রাখবে:** `watchLinks`-এ শুধু real, official platform link দিবে (Netflix/Prime/JioCinema/Hotstar ইত্যাদি) — কখনো download/pirated link না।

---

## Part 3 — Ads Setup Guide

### 3.1 Ad network account বানানো
জনপ্রিয় options (Google AdSense সাধারণত movie/entertainment niche-এ সহজে approve করে না, তাই বেশিরভাগ এই ধরনের site এসব ব্যবহার করে):
- **Adsterra** — adsterra.com এ সাইন আপ, site URL verify করো
- **PropellerAds** — propellerads.com

Approval পাওয়ার পর তারা তোমাকে ad "zone" বানাতে দিবে (Banner, Native, Social Bar, Push) এবং প্রতিটার জন্য একটা HTML/JS code snippet দিবে।

### 3.2 কোন zone কোথায় বসাবে
`src/data/ads.json`-এ প্রতিটা position এর জন্য আলাদা জায়গা আছে:

| ads.json field | কোথায় দেখাবে | Ad network এ যা বানাবে |
|---|---|---|
| `slots.headerBanner.code` | হেডারের নিচে, সব পেজে | 728×90 বা responsive Banner |
| `slots.homeBetweenRows.code` | হোমপেজে প্রতি ৮টা কার্ডের পর | Native Ad |
| `slots.sidebar.code` | মুভি পেজের সাইডবার | 300×250 Banner |
| `slots.inArticleTop` / `inArticleBottom` | রিভিউ টেক্সটের আগে/পরে | Native/Banner |
| `slots.beforeWatchButton.code` | Watch Now বাটনের ঠিক উপরে (best CTR spot) | Banner/Native |
| `redirectInterstitial.code` | Watch Now ক্লিকের পর নতুন ট্যাবের ইন্টারস্টিশিয়াল পেজে | Banner/Social Bar |
| `stickyBottomAd.code` | স্ক্রিনের নিচে সবসময় আটকে থাকা | Sticky Footer Banner |
| `periodicTopAd.code` | কিছু সময় পরপর উপর থেকে নেমে আসে | Banner |
| `networkScripts.global` | সাইট-ওয়াইড script (Social Bar / Push notification) | Social Bar / OneTap |

প্রতিটার সাথে `"enabled": true` করতে ভুলো না — শুধু `code` বসালেই দেখাবে না, `enabled` ও true করতে হবে।

### 3.3 কোনগুলো CTR-এর জন্য ভালো (নিয়ম মেনে)
- `beforeWatchButton` + `redirectInterstitial` — এই দুইটা জায়গায় সবচেয়ে বেশি genuine click আসে, কারণ ইউজার এমনিতেই ওই মুহূর্তে "Watch Now" চাপতে চাইছে
- `stickyBottomAd` — সবসময় visible, ভালো impression পায়
- `periodicTopAd` — খুব ঘন ঘন (কম `intervalSeconds`) দিলে ইউজার বিরক্ত হয়ে সাইট ছেড়ে দিতে পারে; ৪৫–৬০ সেকেন্ড ভালো ব্যালেন্স

**যা করবে না:** ad-কে fake "Play" বা fake "×" বাটন সাজিয়ে accidental click আদায় করা — এটা প্রায় সব network-এর policy ভঙ্গ করে এবং account permanently ban হয়ে যেতে পারে। Clean, visible placement + ভালো ট্রাফিক দিয়েই sustainable income আসে।

### 3.4 Telegram promo সেটাপ
`ads.json` → `telegramPromo`:
```json
"channels": [
  { "name": "Main Updates Channel", "url": "https://t.me/your_channel_here" }
]
```
নিজের channel-এর real link বসাও। `delaySeconds` (popup কতক্ষণ পর দেখাবে) আর `remindAfterHours` (একবার বন্ধ করলে আবার কতক্ষণ পর দেখাবে) চাইলে বদলাতে পারো।

### 3.5 সব ad বন্ধ করতে চাইলে
`ads.json`-এর একদম উপরে:
```json
"adsEnabled": false
```
এটা করলে সব ad slot, sticky/periodic banner, network script, এবং Watch Now interstitial — সব বন্ধ হয়ে যাবে, rebuild করলেই effective হবে।

---

## Checklist (deploy এর আগে)

- [ ] `site.json` এ real domain বসানো
- [ ] Logo, og-image, movie posters/banners আপলোড করা
- [ ] `movies.json`-এ কমপক্ষে কয়েকটা real entry (watchLinks এ শুধু legal platform link)
- [ ] `privacy-policy.astro`, `disclaimer.astro`, `contact.astro` এর placeholder text real তথ্য দিয়ে বদলানো
- [ ] Ad network approval পাওয়ার পর `ads.json`-এ code বসানো, `enabled: true` করা
- [ ] Telegram channel link বসানো
- [ ] Build করে deploy, sitemap Search Console এ submit
