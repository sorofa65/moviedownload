// JSON-driven EPISODE drama catalog (multi-episode series with a
// per-episode iframe video + optional smart-link ad on click).
// This is a separate system from src/data/movies (single full-video
// short-drama pages) — both are loaded independently and both can be
// shown together on the homepage.
//
// Add a new series by dropping a new JSON file in src/data/dramas/,
// following the same shape as the existing sample files. No code
// changes needed — new files are picked up automatically.
const modules = import.meta.glob('./dramas/*.json', { eager: true });
const raw = Object.values(modules).map((mod) => mod.default ?? mod);

const dramas = raw.map((d) => {
  const totalEpisodes = Number(d.totalEpisodes || (d.episodes ? d.episodes.length : 1)) || 1;
  const freeEpisodes = Number.isFinite(Number(d.freeEpisodes)) ? Number(d.freeEpisodes) : totalEpisodes;

  // Normalize + sort episodes by number, and de-duplicate by number.
  const episodeMap = new Map();
  (Array.isArray(d.episodes) ? d.episodes : []).forEach((ep) => {
    const number = Number(ep.number);
    if (!Number.isInteger(number) || number < 1) return;
    episodeMap.set(number, {
      number,
      title: ep.title || `Episode ${number}`,
      videoUrl: ep.videoUrl || '',
      locked: Boolean(ep.locked) || (!ep.videoUrl && number > freeEpisodes),
      smartLink: ep.smartLink || ''
    });
  });
  const episodes = [...episodeMap.values()].sort((a, b) => a.number - b.number);
  const releasedCount = episodes.length;

  return {
    ...d,
    type: 'episode-drama',
    status: d.status || 'ongoing',
    isNew: Boolean(d.isNew),
    isFree: d.isFree !== undefined ? Boolean(d.isFree) : freeEpisodes >= totalEpisodes,
    genre: Array.isArray(d.genre) ? d.genre : ['Drama'],
    tags: Array.isArray(d.tags) ? d.tags : [],
    totalEpisodes,
    freeEpisodes,
    releasedCount,
    episodes,
    firstEpisode: episodes[0] || null
  };
});

// Newest updated first by default.
dramas.sort((a, b) => new Date(b.updatedAt || b.releaseDate || 0).getTime() - new Date(a.updatedAt || a.releaseDate || 0).getTime());

export default dramas;
