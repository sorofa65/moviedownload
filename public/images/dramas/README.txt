Image folder convention for the "New Drama" (episode) system
================================================================

Each drama gets its own folder here, named after its `slug`
(the same slug used in src/data/dramas/<slug>.json):

  public/images/dramas/<slug>/poster.jpg   -> referenced as "posterImage"
  public/images/dramas/<slug>/banner.jpg   -> referenced as "bannerImage"

Recommended sizes:
  poster.jpg  ~ 600x900  (2:3 portrait, used on cards + the detail page)
  banner.jpg  ~ 1280x720 (16:9, used for social sharing / OG image)

After adding files, just make sure the JSON's "posterImage" /
"bannerImage" fields point at the matching path, e.g.:

  "posterImage": "/images/dramas/the-secret-of-gala-night/poster.jpg"

Nothing else needs to change — Astro serves everything under public/
as-is at the site root.
