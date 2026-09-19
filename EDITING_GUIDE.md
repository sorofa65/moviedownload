# CineReview — Editing Guide (কোথায় গিয়ে কী বদলাবে)

এই guide টা তোমার জন্য একটা "map" — পরে যখনই কিছু change করতে চাইবে
(text, design, নতুন content), এখানে দেখে নিলেই বুঝবে ঠিক কোন file এ
যেতে হবে।

---

## 1. একটা মুভি/সিরিজের টেক্সট বদলাতে চাইলে

**যাও এখানে:** `src/data/movies/<slug>.json`

প্রতিটা মুভির নিজের একটা আলাদা ফাইল আছে এখানে। ফাইলটা খুলে যেই অংশ
বদলাতে চাও সেটা এডিট করো, সেভ করো, তারপর rebuild করো (`npm run build`)।

| তুমি কী বদলাতে চাও | কোন field |
|---|---|
| Review-এর লেখা | `review` |
| Title | `title` |
| Short intro/hook | `shortDescription` |
| Rating সংখ্যা | `rating` |
| Cast list | `cast` |
| Director | `director` |
| Genre tag | `genre` |
| Poster/Banner ছবি | `posterImage` / `bannerImage` (path বসাও) |
| Screenshot গুলো | `screenshots` (array, একাধিক path) |
| Watch করার লিঙ্ক | `watchLinks` |
| SEO title/description (Google-এ যা দেখায়) | `seoTitle` / `seoDescription` |

---

## 2. নতুন মুভি/সিরিজ Add করতে চাইলে

**যাও এখানে:** `src/data/movies/` ফোল্ডার

একটা নতুন `.json` ফাইল বানাও (নাম যা খুশি, শুধু `.json` extension), আগের
কোনো ফাইলের structure copy করে নতুন তথ্য বসাও। Save করলেই সেই মুভির নতুন
পেজ, homepage-এ card, category page-এ entry, sitemap entry — সব auto
তৈরি হয়ে যাবে।

মুছে ফেলতে চাইলে — শুধু সেই ফাইলটা delete করো।

---

## 3. Site-এর নাম, মেনু, ফুটার বদলাতে চাইলে

**যাও এখানে:** `src/data/site.json`

| তুমি কী বদলাতে চাও | কোন অংশ |
|---|---|
| Site-এর নাম/লোগো টেক্সট | `name`, `logoText`, `logoAccent` |
| Tagline | `tagline` |
| Top menu-এর আইটেম (Bollywood/Hollywood ইত্যাদি) | `menu` array |
| Footer-এর about text | `footer.about` |
| Footer-এর কলাম/লিঙ্ক | `footer.columns` |
| Social media লিঙ্ক | `social` |
| ডোমেইন URL | `url` |

---

## 4. নতুন একটা সম্পূর্ণ পেজ Add করতে চাইলে (যেমন FAQ, Terms)

**যাও এখানে:** `src/pages/` ফোল্ডার

`about.astro` অথবা `contact.astro` ফাইলটা কপি করে নতুন নামে রাখো (যেমন
`faq.astro`), ভেতরের `<h1>` আর প্যারাগ্রাফ বদলে দাও। এই ফাইলটাই এখন
`yourdomain.com/faq/` এ চলে যাবে। চাইলে `site.json`-এর `footer.columns`
বা `menu`-তে এর লিঙ্ক যোগ করে দিতে পারো যাতে মানুষ খুঁজে পায়।

---

## 5. Design/রঙ বদলাতে চাইলে

**যাও এখানে:** `src/layouts/Layout.astro` — একদম উপরের দিকে `:root { ... }` অংশ

```css
--bg: #ffffff;       /* মূল background */
--text: #1c1e22;     /* মূল লেখার রঙ */
--brand: #e63946;    /* accent রঙ (বাটন, লিঙ্ক হাইলাইট) */
--border: #e5e7eb;   /* বর্ডার/লাইনের রঙ */
```
এই কয়েকটা মান বদলালেই পুরো সাইটের theme বদলে যাবে — প্রতিটা পেজে আলাদা
করে করতে হবে না।

**নির্দিষ্ট একটা অংশের design** (যেমন শুধু movie card, শুধু header)
বদলাতে চাইলে সেই component ফাইলে যাও:
- Header/navbar → `src/components/Header.astro`
- Footer → `src/components/Footer.astro`
- Movie card (poster grid-এর প্রতিটা বক্স) → `src/components/MovieCard.astro`
- সাইডবার (Latest Updates, Categories) → `src/components/Sidebar.astro`
- মুভির ডিটেইল পেজের লেআউট → `src/pages/movie/[slug].astro`
- হোমপেজের লেআউট (featured strip, grid) → `src/pages/index.astro`

প্রতিটা ফাইলের নিচের দিকে `<style>` ব্লকে CSS আছে — ওখানেই padding,
font size, রঙ, spacing বদলাবে।

---

## 6. Ads/Telegram promo বদলাতে চাইলে

**যাও এখানে:** `src/data/ads.json`

(আগের guide — `GUIDE.md` — এ এটার পুরো breakdown আছে, প্রতিটা ad slot
কোথায় বসে সেটার table সহ।)

---

## 7. Images আপলোড/বদলাতে চাইলে

**যাও এখানে:** `public/images/` ফোল্ডার

- `public/images/logo.png` — সাইট লোগো
- `public/images/og-default.jpg` — সোশ্যাল শেয়ার প্রিভিউ ছবি
- `public/images/movies/` — প্রতিটা মুভির poster/banner/screenshot এখানে
  রাখো, তারপর সেই path টা মুভির JSON ফাইলে বসাও

---

## Quick Reference টেবিল

| কাজ | File |
|---|---|
| মুভির টেক্সট এডিট | `src/data/movies/<slug>.json` |
| নতুন মুভি যোগ | `src/data/movies/` এ নতুন `.json` |
| সাইটের নাম/মেনু/ফুটার | `src/data/site.json` |
| নতুন পেজ | `src/pages/` এ নতুন `.astro` ফাইল |
| রঙ/থিম | `src/layouts/Layout.astro` (`:root` অংশ) |
| Header/Footer/Card ডিজাইন | `src/components/*.astro` |
| Ads/Telegram | `src/data/ads.json` |
| ছবি | `public/images/` |

কোনো change করার পর সবসময় `npm run build` চালিয়ে আবার deploy করতে হবে
(অথবা `npm run dev` দিয়ে লোকাল-এ প্রথমে দেখে নাও)।
