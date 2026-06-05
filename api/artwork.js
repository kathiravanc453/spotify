/**
 * api/artwork.js — Vercel Serverless Function
 *
 * Searches multiple sources to find a high-res album cover for a given song title.
 * Sources: iTunes (global) → Deezer (good for Indian) → Saavn (best for Tamil/Hindi)
 *
 * GET /api/artwork?title=Vaadi+Vaadi&artist=Vijay
 * Response: { coverUrl: "https://..." } or { coverUrl: null }
 */

const searchItunes = async (query) => {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=in&media=music&entity=song&limit=5`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    const art = data.results[0].artworkUrl100;
    if (art) return art.replace('100x100bb.jpg', '600x600bb.jpg');
  }
  return null;
};

const searchDeezer = async (query) => {
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=3`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.data && data.data.length > 0) {
    return data.data[0].album?.cover_xl || data.data[0].album?.cover_big || null;
  }
  return null;
};

const searchSaavn = async (query) => {
  try {
    const url = `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&page=1&limit=3`;
    const res = await fetch(url, { headers: { 'User-Agent': 'Rhythmix/1.0' } });
    const data = await res.json();
    const results = data?.data?.results;
    if (results && results.length > 0) {
      const images = results[0].image;
      if (Array.isArray(images)) {
        const hq = images.find(i => i.quality === '500x500') || images[images.length - 1];
        return hq?.url || null;
      }
    }
  } catch (_) {}
  return null;
};

const cleanTitle = (raw) => {
  let t = raw
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Remove common junk patterns from Cloudinary uploads
  const junk = [
    /high quality/gi, /audio song/gi, /audio/gi, /surround/gi,
    /bass boosted/gi, /bluray/gi, /blu-ray/gi, /dolby/gi, /digital/gi,
    /5\.1/gi, /ultra hd/gi, /4k/gi, /1080p/gi, /720p/gi,
    /mp3/gi, /m4a/gi, /128k/gi, /320k/gi, /official/gi,
    /video/gi, /lyric/gi, /lyrics/gi, /remastered/gi, /hq/gi,
    /svp beats/gi, /voice of spb/gi, /spb/gi, /ilayaraja/gi,
    /ar rahman/gi, /yuvan/gi, /anirudh/gi, /harris jayaraj/gi,
    /\(.*?\)/g, /\[.*?\]/g,
  ];
  junk.forEach(p => { t = t.replace(p, ' '); });

  // Strip trailing Cloudinary 6-char hash (e.g. "mb5woo" or "gp3pt4")
  t = t.replace(/\b[a-z0-9]{6}\b$/i, '').trim();
  t = t.replace(/\s{2,}/g, ' ').trim();

  // If title has "artist - song" format, extract just the song part for search
  if (t.includes(' - ')) {
    const parts = t.split(' - ');
    t = parts[parts.length - 1].trim(); // Use the song name part
  }

  return t || raw;
};

export default async function handler(req, res) {
  // CORS headers so browser can call this from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400'); // cache 24h

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  let { title = '', artist = '' } = req.query;

  title = cleanTitle(decodeURIComponent(title));
  artist = decodeURIComponent(artist).replace('Unknown Artist', '').trim();

  if (!title) return res.status(400).json({ error: 'title is required', coverUrl: null });

  // Build search queries — most specific to least specific
  const queries = [];
  if (artist && artist !== 'Unknown Artist') {
    queries.push(`${title} ${artist}`);   // "Vaadi Vaadi Vijay"
  }
  queries.push(title);                    // "Vaadi Vaadi"

  // Also try just the first 3 words if title is long
  const words = title.split(' ').filter(Boolean);
  if (words.length > 3) {
    queries.push(words.slice(0, 3).join(' '));
  }

  let coverUrl = null;

  for (const q of queries) {
    if (coverUrl) break;

    // 1. iTunes (best quality, global)
    try { coverUrl = await searchItunes(q); } catch (_) {}

    // 2. Deezer (good for Indian music)
    if (!coverUrl) {
      try { coverUrl = await searchDeezer(q); } catch (_) {}
    }

    // 3. Saavn (best for Tamil/Hindi songs)
    if (!coverUrl) {
      try { coverUrl = await searchSaavn(q); } catch (_) {}
    }
  }

  return res.status(200).json({ coverUrl });
}

