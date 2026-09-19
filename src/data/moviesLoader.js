// JSON-driven short-drama catalog.
const modules = import.meta.glob('./movies/*.json', { eager: true });
const rawMovies = Object.values(modules).map((mod) => mod.default ?? mod);
const movies = rawMovies.map((movie) => ({
  ...movie,
  type: movie.type || 'short-drama',
  category: movie.category || 'short-drama',
  genre: Array.isArray(movie.genre) ? movie.genre : ['Drama'],
  screenshots: Array.isArray(movie.screenshots) ? movie.screenshots : [],
  episodesCount: Number(movie.episodesCount || 1),
  playbackMode: movie.playbackMode || 'full-video',
  playerAspectRatio: movie.playerAspectRatio || '9/16'
}));
export default movies;
