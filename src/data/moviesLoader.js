import fs from 'node:fs';
import path from 'node:path';

// তারিখকে অটোমেটিক ISO 8601 (Timezone সহ) রূপান্তর করার ফাংশন
function formatUploadDate(dateStr) {
  if (!dateStr) return new Date().toISOString();
  
  // যদি তারিখ '2026-09-24' বা সাধারণ স্ট্রিং ফরম্যাটে থাকে
  try {
    // যদি ইতিমধ্যেই ISO 8601 টাইমজোন থাকে (যেমন 'T' এবং 'Z' বা '+')
    if (typeof dateStr === 'string' && dateStr.includes('T') && (dateStr.endsWith('Z') || dateStr.includes('+'))) {
      return dateStr;
    }
    
    // '2026-09-24' কে '2026-09-24T00:00:00.000Z' এ রূপান্তর
    const dateObj = new Date(dateStr.trim().includes('T') ? dateStr : `${dateStr.trim()}T00:00:00Z`);
    
    if (isNaN(dateObj.getTime())) {
      return new Date().toISOString();
    }
    return dateObj.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

// সকল মুভি/ড্রামা লোড করার সময় অটো তারিখ ফরম্যাট করা
export async function getAllMovies() {
  const moviesDir = path.join(process.cwd(), 'src/data/movies');
  
  if (!fs.existsSync(moviesDir)) {
    return [];
  }

  const files = fs.readdirSync(moviesDir);
  const movies = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(moviesDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      try {
        const movieData = JSON.parse(fileContent);
        
        // অটোমেটিক uploadDate টাইমজোন সহ ফিক্স করা
        if (movieData.uploadDate) {
          movieData.uploadDate = formatUploadDate(movieData.uploadDate);
        } else if (movieData.publishedAt) {
          movieData.uploadDate = formatUploadDate(movieData.publishedAt);
        } else {
          movieData.uploadDate = new Date().toISOString();
        }

        movies.push(movieData);
      } catch (err) {
        console.error(`Error reading or parsing ${file}:`, err);
      }
    }
  }

  return movies;
}

// Slug অনুযায়ী সিঙ্গেল মুভি লোড করার সময়
export async function getMovieBySlug(slug) {
  const movies = await getAllMovies();
  return movies.find((movie) => movie.slug === slug || movie.id === slug) || null;
}
