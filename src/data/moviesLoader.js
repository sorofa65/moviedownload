// Combines every JSON file under src/data/movies/*.json into one array.
// To add a movie: create a new file in src/data/movies/, e.g.
//   src/data/movies/my-new-movie-2026.json
// It will automatically appear on the homepage, its category page,
// sitemap, llms.txt, and get its own /movie/<slug>/ page — no other
// file needs to be touched.

const modules = import.meta.glob('./movies/*.json', { eager: true });

const movies = Object.values(modules).map((mod) => mod.default ?? mod);

export default movies;
