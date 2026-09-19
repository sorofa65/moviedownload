# "New Drama" (Episode System) — Setup Guide

এই ফাইলটা নতুন যোগ করা **episode-based drama system** এর জন্য। পুরনো
সিস্টেম (`src/data/movies/`, single full-video short-drama, route
`/drama/:slug`) আগের মতোই অক্ষত আছে — কিছু বদলানো হয়নি। এখন থেকে দুটো
সিস্টেমই একসাথে চলবে এবং হোমপেজে দুটোই দেখাবে।

| | পুরনো সিস্টেম | নতুন সিস্টেম |
|---|---|---|
| ফোল্ডার | `src/data/movies/*.json` | `src/data/dramas/*.json` |
| Route | `/drama/<slug>/` | `/series/<slug>/` |
| ভিডিও | একটাই full video iframe | প্রতিটা episode-এর আলাদা iframe link |
| Ads | সাধারণ banner/native slot | + episode click করলে smart link |
| Home section | "🎬 Latest Drama" | "🔥 New Drama" + "✅ Watch Now Free" |

---

## ১. নতুন Drama (episode series) যোগ করা

`src/data/dramas/` ফোল্ডারে একটা নতুন `.json` ফাইল বানাও, যেমন
`src/data/dramas/my-new-drama.json`:

```json
{
  "slug": "my-new-drama",
  "title": "My New Drama",
  "status": "ongoing",
  "isNew": true,
  "isFree": true,
  "language": "English",
  "genre": ["Romance", "Revenge"],
  "tags": ["Hot Picks", "Billionaires"],
  "releaseDate": "2026-09-19",
  "updatedAt": "2026-09-19",
  "totalEpisodes": 20,
  "freeEpisodes": 10,
  "posterImage": "/images/dramas/my-new-drama/poster.jpg",
  "bannerImage": "/images/dramas/my-new-drama/banner.jpg",
  "description": "Short blurb shown on the detail page...",
  "fullVideoUrl": "https://your-affiliate-or-download-link.example.com/my-new-drama",
  "episodes": [
    { "number": 1, "title": "Episode 1", "videoUrl": "https://your-iframe-host.example.com/embed/ep-1", "locked": false },
    { "number": 2, "title": "Episode 2", "videoUrl": "https://your-iframe-host.example.com/embed/ep-2", "locked": false },
    { "number": 11, "title": "Episode 11", "videoUrl": "", "locked": true, "smartLink": "https://your-smartlink.example.com/ep11" }
  ],
  "seoTitle": "My New Drama — Watch Full Episodes Online",
  "seoDescription": "150-160 char meta description."
}
```

**খেয়াল রাখার জিনিস:**
- `totalEpisodes` = সিরিজে মোট কতগুলো এপিসোড থাকবে (এখনো সবগুলো আপলোড না
  করলেও চলবে)। `episodes` array-তে শুধু যেগুলো এখন আপলোড করা আছে সেগুলোই
  রাখো — বাকিগুলো গ্রিডে ধূসর, dashed-বর্ডার নাম্বার হিসেবে দেখাবে। এগুলো
  ক্লিক-যোগ্য — ক্লিক করলে নিচের highlighted "Get Full Video" banner-এ
  নিয়ে যাবে (দেখো সেকশন ৪)।
- প্রতিটা episode-এ `videoUrl` (তোমার iframe embed link — Dailymotion,
  নিজের player, বা যেকোনো `<iframe>`-সাপোর্টেড host) অথবা `"locked": true`
  থাকতে হবে।
- `locked: true` মানে ওই episode-এ সরাসরি ভিডিও নেই — ইউজার ক্লিক করলে
  "Unlock Now" স্ক্রিন দেখাবে, যেটা `smartLink` (বা না থাকলে
  `fullVideoUrl`) এ নিয়ে যাবে। এটাই paid/premium episode লক করার সিস্টেম।
- `freeEpisodes` সংখ্যার বেশি এপিসোড নাম্বারে যদি `locked` লেখা না-ও থাকে
  কিন্তু `videoUrl` খালি থাকে, সিস্টেম নিজে থেকেই সেটাকে locked ধরে নেয়।

ফাইল সেভ করলেই নতুন page (`/series/my-new-drama/`) auto তৈরি হয়ে যাবে,
homepage-এর "New Drama" রো-তেও দেখাবে (`isNew: true` থাকলে উপরে থাকবে),
"Watch Now Free" রো-তে দেখাবে যদি `isFree: true` হয়।

---

## ২. ছবি (images) বসানো

`public/images/dramas/<slug>/` ফোল্ডারে রাখো:
- `poster.jpg` — 2:3 পোর্ট্রেট (কার্ড + detail page-এ দেখাবে)
- `banner.jpg` — 16:9 (social share preview)

JSON-এর `posterImage` / `bannerImage` ফিল্ড সেই path-টাই পয়েন্ট করবে,
যেমন `"/images/dramas/my-new-drama/poster.jpg"`। বাইরের কোনো hosted
image URL (`https://...`) দিলেও চলবে — দুটোই সাপোর্টেড।

---

## ৩. Episode ক্লিকে Smart Link (Ads) কাজ করে কীভাবে

`src/data/ads.json` এ নতুন সেকশন `episodeSmartLink`:

```json
"episodeSmartLink": {
  "enabled": true,
  "mode": "lockedOnly",
  "openInNewTab": true,
  "code": "https://your-smartlink-network.example.com/default-zone"
}
```

- `mode: "lockedOnly"` (ডিফল্ট) — শুধু **locked/paid episode**-এ ক্লিক
  করলে smart link নতুন ট্যাবে খুলবে, সাথে "Unlock Now" স্ক্রিন দেখাবে।
  বাকি ফ্রি এপিসোডগুলো সরাসরি প্লে হবে, কোনো পপ-আপ ছাড়া।
- `mode: "everyClick"` — **প্রতিটা** episode ক্লিকেই (লকড হোক বা ফ্রি)
  smart link একটা নতুন ব্যাকগ্রাউন্ড ট্যাবে খুলবে, আর ভিডিও একই ট্যাবে
  স্বাভাবিকভাবে চলতে থাকবে। এটাতে বেশি impression/click পাবে কিন্তু
  ইউজার experience একটু বেশি aggressive।
- `mode: "off"` — কোনো auto popup হবে না; locked episode-এ শুধু একটা
  সাধারণ "Unlock Now" লিংক (বাটন) দেখাবে, ক্লিক করলে সরাসরি সেই লিংকে
  যাবে (এটাও asli link, ভুয়া বাটন না)।
- `code` হলো fallback smart link — যদি কোনো নির্দিষ্ট episode বা drama
  নিজের `smartLink` না দেয়, তাহলে এটা ব্যবহার হবে।
- প্রতিটা episode চাইলে নিজের আলাদা `smartLink` দিতে পারে (JSON-এ
  `"smartLink": "..."`)  — অথবা পুরো drama-র জন্য একটাই `fullVideoUrl`
  ফলব্যাক হিসেবে কাজ করে।
- `adsEnabled: false` (ads.json-এর একদম উপরে) করলে এই smart link সহ
  **সব** ad বন্ধ হয়ে যাবে, আগের মতোই।

---

## ৪. Full Video / Download Link + Highlighted Banner (যেটা তুমি জিজ্ঞেস করেছিলে)

তুমি বলেছিলে: প্রথমে কিছু episode দেবে, সব একবারে না — তাহলে একটা
highlighted message থাকা দরকার যেটা full video-র দিকে নিয়ে যাবে। এটা
এখন আছে:

প্রতিটা drama JSON-এ `fullVideoUrl` — একটা সত্যিকারের লিংক
(affiliate/download/partner link) যেটা তিন জায়গায় কাজ করে:

1. **Highlighted banner** — episode গ্রিডের ঠিক উপরে, রঙিন বর্ডার +
   gradient background সহ। `episodes` array-এ যতগুলো এপিসোড দেওয়া আছে
   সেটা `totalEpisodes`-এর চেয়ে কম হলে banner-এ automatic লেখা আসবে:
   *"⚡ Only X of Y episodes are uploaded here right now"* + একটা বড়,
   highlighted **"⬇ Get Full Video Now"** বাটন (তোমার `fullVideoUrl`
   এ নিয়ে যায়)। সব এপিসোড দিয়ে দিলে ওই সংখ্যাটা আর দেখাবে না, শুধু
   সাধারণ "Want the whole series in one go?" মেসেজ থাকবে।
2. যেসব episode number এখনো `episodes` array-তে নেই (ধূসর, dashed
   বর্ডার), সেগুলোতে ক্লিক করলে ওই banner-এ auto-scroll করে কিছুক্ষণ
   glow/highlight করে দেখাবে — মানে ইউজার সরাসরি বুঝে যাবে full video
   কোথায় পাবে। `ads.json`-এর `episodeSmartLink.mode` চালু থাকলে
   একই ক্লিকে smart link-ও খুলবে।
3. Locked (paid) episode-এর "Unlock Now" বাটনের fallback হিসেবেও এটাই
   ব্যবহার হয়।

তাই তুমি শুরুতে ৫-১০টা এপিসোড দিয়ে বাকিগুলো পরে ধীরে ধীরে যোগ করতে
পারো — যতক্ষণ সবগুলো না আসে, এই highlighted banner + ধূসর সংখ্যাগুলো
নিজে থেকেই ভিজিটরদের তোমার affiliate full-video লিংকে পাঠাতে থাকবে।

---

## ৫. Design / Tailwind

নতুন "New Drama" সিস্টেমের সব পেজ (`homepage-এর নতুন rows`, `/series/`,
`/series/<slug>/`) Tailwind CSS দিয়ে বানানো — `cdn.tailwindcss.com`
স্ক্রিপ্ট দিয়ে লোড হয় (`src/layouts/Layout.astro`-তে), তাই কোনো npm
build-step লাগে না, `npm run dev` / `npm run build` করলেই কাজ করবে।
Brand color বদলাতে চাইলে `Layout.astro`-তে `tailwind.config` এর
`colors.brand` বদলাও।

পুরনো পেজগুলো (`/drama/`, `/category/`) আগের হাতে-লেখা CSS দিয়েই চলছে,
touch করা হয়নি — তাই কোনো পুরনো ডিজাইন ভাঙেনি।

---

## ৬. যা যা নতুন/বদলাল, এক নজরে

- `src/data/dramas/*.json` — নতুন episode-drama content (৩টা sample
  দেওয়া আছে, একটা `the-secret-of-gala-night.json` তোমার পাঠানো screenshot
  অনুযায়ী)
- `src/data/dramasLoader.js` — নতুন loader
- `src/data/ads.json` — `episodeSmartLink` যোগ হয়েছে
- `src/components/DramaCard.astro` — নতুন Tailwind card
- `src/pages/series/[slug].astro` — নতুন episode watch page
- `src/pages/series/index.astro` — নতুন browse/filter page
- `src/pages/index.astro` — homepage-এ "New Drama" + "Watch Now Free"
  row যোগ হয়েছে, পুরনো "Latest Drama" grid অপরিবর্তিত
- `src/components/Sidebar.astro` — নতুন "New Drama" box যোগ হয়েছে,
  category লিংক বাগ ফিক্স হয়েছে
- `src/data/site.json` — মেনুতে "New Drama" / "Watch Free" লিংক যোগ
- `src/pages/sitemap.xml.ts`, `src/pages/llms.txt.ts` — নতুন `/series/`
  পেজগুলো include করা হয়েছে
- `scripts/validate-content.mjs` — নতুন dramas JSON validate করবে বিল্ডের
  আগে
- `public/images/dramas/<slug>/` — ছবি রাখার ফোল্ডার (README.txt আছে
  ভেতরে)

Deploy flow আগের মতোই: `npm install` → `npm run build` → `dist/`
Netlify/Vercel/Cloudflare-এ deploy করো (দেখো মূল `GUIDE.md`)।
