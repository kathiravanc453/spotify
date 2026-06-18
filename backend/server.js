import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

cloudinary.config({
  cloud_name: 'dm1cwbbfg',
  api_key: '969989851682274',
  api_secret: '6N9cJ9fhanGad1sj--3gssD-vCk'
});

const SONGS_JSON = path.join(__dirname, 'songs.json');
const USERS_JSON = path.join(__dirname, 'users.json');
const STATS_JSON = path.join(__dirname, 'stats.json');
const PLAYLISTS_JSON = path.join(__dirname, 'playlists.json');

const readPlaylists = () => {
  try {
    if (fs.existsSync(PLAYLISTS_JSON)) {
      return JSON.parse(fs.readFileSync(PLAYLISTS_JSON, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading playlists.json:', e);
  }
  return [];
};

const writePlaylists = (playlists) => {
  try {
    fs.writeFileSync(PLAYLISTS_JSON, JSON.stringify(playlists, null, 2));
  } catch (e) {
    console.error('Error writing playlists.json:', e);
  }
};

app.use(cors());
app.use(express.json());

const getStableId = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const guessMoodFromTitle = (title) => {
  if (!title) return 'Melody';
  const clean = title.toLowerCase().replace(/[^a-z0-9]/g, ' ');

  // Kuthu / Mass / Energy
  if (/(kuthu|mass|adichu|beat|dance|vathi|theri|local|verithanam|banger)/.test(clean)) {
    return 'Kuthu';
  }
  
  // Romance / Love
  if (/(kadhal|love|unnai|ennai|heart|baby|uyir|anbe|romance|romantic)/.test(clean)) {
    return 'Romance';
  }
  
  // Sad / Pain
  if (/(vali|pain|sad|cry|kaneer|thaniye|broken|alone|grief|tears)/.test(clean)) {
    return 'Sad';
  }
  
  // Melody / Vibes
  if (/(melody|vibe|chill|lofi|acoustic|breeze)/.test(clean)) {
    return 'Melody';
  }

  // Default fallback if no emotional keywords are found
  return 'Vibes';
};

const AUTO_METADATA_CACHE_JSON = path.join(__dirname, 'auto-metadata-cache.json');

const readMetadataCache = () => {
  try {
    if (fs.existsSync(AUTO_METADATA_CACHE_JSON)) {
      return JSON.parse(fs.readFileSync(AUTO_METADATA_CACHE_JSON, 'utf-8'));
    }
  } catch (e) {
    console.warn('⚠️ Error reading auto-metadata-cache.json:', e.message);
  }
  return {};
};

const writeMetadataCache = (cache) => {
  try {
    fs.writeFileSync(AUTO_METADATA_CACHE_JSON, JSON.stringify(cache, null, 2));
  } catch (e) {
    console.warn('⚠️ Error writing auto-metadata-cache.json:', e.message);
  }
};

const cleanSearchTerm = (title) => {
  let term = title
    .replace(/[-_]/g, ' ') // Replace underscores and hyphens with spaces
    .replace(/\s+/g, ' ')   // Collapse multiple spaces
    .trim();

  // Suffix patterns to remove to get a clean search query
  const patternsToRemove = [
    /high quality/gi,
    /audio song/gi,
    /video song/gi,
    /bass boosted/gi,
    /yuvan hits/gi,
    /128k/gi,
    /m4a/gi,
    /mp3/gi,
    /4k ultra hd/gi,
    /blu ray/gi,
    /dolby digital/gi,
    /5\.1/gi,
    /surround/gi,
    /svp beats/gi,
    /voice of spb/gi,
    /-- \d+/g,
    /\b[a-z0-9]{6}\b$/i // Matches 6-letter random hashes at the end like si5cms, xmauk8, udpl9y
  ];

  patternsToRemove.forEach(p => {
    term = term.replace(p, '');
  });

  return term.replace(/\s+/g, ' ').trim();
};

const resolveMusicMetadata = (publicId, title) => {
  return new Promise((resolve) => {
    const cache = readMetadataCache();
    
    // Check cache first to avoid API spam
    if (cache[publicId]) {
      return resolve(cache[publicId]);
    }

    const query = cleanSearchTerm(title);
    console.log(`🔍 [Auto-Scraper] Querying iTunes for cleaned term: "${query}" (Original: "${title}")`);

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=in&media=music&entity=song&limit=1`;

    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.results && parsed.results.length > 0) {
            const track = parsed.results[0];
            const highResArtwork = track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb.jpg', '500x500bb.jpg') : null;
            const resolved = {
              title: track.trackName || title,
              artist: track.artistName || 'Cloud Artist',
              album: track.collectionName ? track.collectionName.replace(/\(Original Motion Picture Soundtrack\)/gi, '').replace(/- EP/gi, '').trim() : 'Singles',
              cover: highResArtwork,
              resolved: true
            };

            console.log(`✅ [Auto-Scraper] Resolved! Album: "${resolved.album}", Artist: "${resolved.artist}"`);

            // Update cache
            cache[publicId] = resolved;
            writeMetadataCache(cache);
            return resolve(resolved);
          }
        } catch (e) {
          console.error(`❌ [Auto-Scraper] Parsing failed for "${query}":`, e.message);
        }

        // Fallback: cache fallback so we don't spam the API on subsequent ticks
        console.log(`⚠️ [Auto-Scraper] No match found on iTunes for: "${query}". Setting fallback.`);
        const fallback = {
          title: title,
          artist: 'Cloud Artist',
          album: 'Singles',
          cover: null,
          resolved: false
        };
        cache[publicId] = fallback;
        writeMetadataCache(cache);
        resolve(fallback);
      });
    }).on('error', (err) => {
      console.error(`❌ [Auto-Scraper] HTTP get error for "${query}":`, err.message);
      resolve({
        title: title,
        artist: 'Cloud Artist',
        album: 'Singles',
        cover: null,
        resolved: false
      });
    });
  });
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';
const AI_MOOD_CACHE_FILE = path.join(process.cwd(), 'ai-mood-cache.json');
let aiMoodCache = {};
try {
  if (fs.existsSync(AI_MOOD_CACHE_FILE)) {
    aiMoodCache = JSON.parse(fs.readFileSync(AI_MOOD_CACHE_FILE, 'utf8'));
  }
} catch (e) {}

const guessMoodWithGemini = async (titlesArray) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    return {};
  }

  const prompt = `
You are a deeply knowledgeable Tamil Cinema and Music expert AI.
I am providing you a list of Tamil movie song titles (and sometimes their movie/artist names).
Your task is to analyze each song using your deep knowledge of Tamil pop culture, music directors (e.g., AR Rahman, Anirudh, Yuvan, Harris Jayaraj, Ilaiyaraaja), and the actual feel of the song to assign EXACTLY ONE of these moods: "kuthu", "romance", "sad", "melody", or "vibes".

Definitions & Deep Tamil Context:
- "kuthu": High-energy, mass hero entry songs, local kuthu beats, fast dance numbers (e.g., "Aaluma Doluma", "Mankatha Theme", "Appadi Podu", "Vaathi Coming").
- "romance": Duets, love feeling, romantic tracks (e.g., "Mun Paniya", "Ennamo Yedho", "Oru Maalai", "Kadhal Yin Karangal").
- "sad": Emotional, heartbreak, amma/appa sentiment, tragedy, pain (e.g., "Kanave Kalaiyadhe", "Idhu Kadhalai", "Oru Deivam Thandha").
- "melody": Calm, soothing, breezy, classical touches, soft beats (e.g., "Vaseegara", "Kannathil Muthamittal", "Nenjukkul Peidhidum").
- "vibes": Chill pop, modern rap, road trip songs, friendship anthems, or anything that doesn't fit the above perfectly (e.g., "Naan Pizhaippeno", "Pakkam Vanthu").

Return ONLY a valid JSON object mapping the exact input string to the exact lowercase mood string.
DO NOT include markdown blockticks or extra text.
Example: {"Thanjavoor Jillakkari": "kuthu", "Mun Paniya": "romance", "Why This Kolaveri Di": "vibes"}

Songs to analyze:
${JSON.stringify(titlesArray)}
  `;

  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: "application/json" }
      })
    });
    
    if (!res.ok) {
      console.error('Gemini API Error:', await res.text());
      return {};
    }

    const data = await res.json();
    const textResp = data.candidates[0].content.parts[0].text;
    return JSON.parse(textResp);
  } catch (err) {
    console.error('Gemini parsing error:', err.message);
    return {};
  }
};

const syncWithCloudinary = async () => {
  console.log('\n====================================================');
  console.log('🛰️ DEEP FOLDER SYNC... (' + new Date().toLocaleTimeString() + ')');
  
  try {
    let allCloudSongs = [];
    let nextCursor = null;

    do {
      const result = await cloudinary.api.resources({
        resource_type: 'video',
        max_results: 500,
        type: 'upload',
        context: true,
        video_metadata: true,
        next_cursor: nextCursor
      });

      const audioFiles = result.resources.filter(r => r.format === 'mp3' || r.format === 'm4a');
      allCloudSongs = allCloudSongs.concat(audioFiles);
      nextCursor = result.next_cursor;
    } while (nextCursor);

    const cloudSongs = allCloudSongs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    console.log(`🎵 I found ${cloudSongs.length} songs in your Cloudinary account.`);

    if (cloudSongs.length > 0) {
      console.log('Sample Cloud Resource Metadata:', {
        public_id: cloudSongs[0].public_id,
        folder: cloudSongs[0].folder,
        asset_folder: cloudSongs[0].asset_folder,
        all_keys: Object.keys(cloudSongs[0])
      });
    }

    // --- GEMINI BATCHING ---
    console.log('🤖 Starting Gemini AI Deep Analysis...');
    const titlesToAnalyze = [];
    cloudSongs.forEach(c => {
      let rawName = c.public_id.split('/').pop().split('.')[0];
      if (/_[a-zA-Z0-9]{6}$/.test(rawName)) {
        rawName = rawName.substring(0, rawName.length - 7);
      }
      let name = rawName.replace(/_/g, ' ');
      name = cleanSearchTerm(name);

      if (name && !aiMoodCache[name]) {
        titlesToAnalyze.push(name);
      }
    });

    const uniqueTitles = [...new Set(titlesToAnalyze)];
    if (uniqueTitles.length > 0) {
      console.log('🧠 Found ' + uniqueTitles.length + ' new songs for Gemini to analyze!');
      for (let i = 0; i < uniqueTitles.length; i += 40) {
        const batch = uniqueTitles.slice(i, i + 40);
        console.log('   -> Analyzing batch ' + (Math.floor(i/40) + 1) + ' of ' + Math.ceil(uniqueTitles.length / 40) + '...');
        const results = await guessMoodWithGemini(batch);
        
        batch.forEach(title => {
          aiMoodCache[title] = results[title] || guessMoodFromTitle(title); // fallback to regex if undefined
        });

        fs.writeFileSync(AI_MOOD_CACHE_FILE, JSON.stringify(aiMoodCache, null, 2));

        if (i + 40 < uniqueTitles.length) {
          await new Promise(r => setTimeout(r, 4000));
        }
      }
      console.log('✅ Gemini Deep Analysis Complete!');
    }
    // -----------------------

    // Load metadata overrides
    let overrides = {};
    try {
      const overridesPath = path.join(__dirname, 'metadata-overrides.json');
      if (fs.existsSync(overridesPath)) {
        overrides = JSON.parse(fs.readFileSync(overridesPath, 'utf-8'));
      }
    } catch (e) {
      console.warn('⚠️ Could not read metadata-overrides.json:', e.message);
    }

    let localSongs = [];
    const seenCleanTitles = new Set();

    for (const cloud of cloudSongs) {
      // 1. Extract and Clean the Song Name FIRST
      let rawName = cloud.public_id.split('/').pop().split('.')[0];
      if (/_[a-zA-Z0-9]{6}$/.test(rawName)) {
        rawName = rawName.substring(0, rawName.length - 7);
      }
      let name = rawName.replace(/_/g, ' ');

      // 2. Intelligent Auto-Mood Detection based on the song's title
      let nameForCache = cleanSearchTerm(name);
      let folderMood = aiMoodCache[nameForCache] || guessMoodFromTitle(name);

      // Check Cloudinary context.custom as a potential manual override
      try {
        if (cloud.context && cloud.context.custom && cloud.context.custom.mood) {
          folderMood = cloud.context.custom.mood;
        }
      } catch (e) {}

      // Check explicit tags like "mood:Melody" as a manual override
      if (Array.isArray(cloud.tags)) {
        const moodTag = cloud.tags.find(t => typeof t === 'string' && t.toLowerCase().startsWith('mood:'));
        if (moodTag) folderMood = moodTag.split(':').slice(1).join(':');
      }

      console.log(`  > "${name}" -> AI Assigned Mood: "${folderMood}"`);
      
      const cleanName = cleanSearchTerm(name).toLowerCase();
      if (seenCleanTitles.has(cleanName)) {
        console.warn(`⚠️ [Duplicate Protection] Detected duplicate song "${name}" (ID: ${cloud.public_id}). Deleting duplicate from Cloudinary...`);
        try {
          cloudinary.uploader.destroy(cloud.public_id, { resource_type: 'video' }).then(result => {
            console.log(`✅ [Duplicate Protection] Cloudinary destroy result for "${cloud.public_id}":`, result);
          }).catch(err => {
            console.error(`❌ [Duplicate Protection] Cloudinary destroy promise rejected for "${cloud.public_id}":`, err.message);
          });
        } catch (destroyErr) {
          console.error(`❌ [Duplicate Protection] Failed to call destroy for "${cloud.public_id}":`, destroyErr.message);
        }
        continue; // Skip adding duplicate to localSongs database
      }
      seenCleanTitles.add(cleanName);

      let cover = 'https://images.unsplash.com/photo-1493225457124-a1a2a5d5facf?w=500';
      let fallbackUrl = cover;
      let albumName = 'Cloudinary Singles';
      
      let songArtist = 'Unknown Artist';
      // Extract Artist from Cloudinary Inner Folder (e.g. Actors/Vijay/song -> Vijay)
      if (cloud.public_id && cloud.public_id.includes('/')) {
        const parts = cloud.public_id.split('/');
        parts.pop(); // Remove the song filename
        if (parts.length > 0) {
          songArtist = parts[parts.length - 1]; // The immediate parent folder
        }
      }

      let existingMood = null;
      let existingActor = null;
      let existingDuration = 0;

      // Load existing song data to prevent overwriting valid data
      try {
        const existingSongs = JSON.parse(fs.readFileSync(SONGS_JSON, 'utf8'));
        const existing = existingSongs.find(s => s.id === getStableId(cloud.public_id));
        if (existing) {
          if (existing.artist && existing.artist !== 'Unknown Artist' && existing.artist !== 'Cloud Artist') {
            songArtist = existing.artist;
          }
          if (existing.album && existing.album !== 'Cloudinary Singles') {
            albumName = existing.album;
          }
          if (existing.cover && existing.cover !== 'https://images.unsplash.com/photo-1493225457124-a1a2a5d5facf?w=500') {
            cover = existing.cover;
            fallbackUrl = existing.fallbackCover || existing.cover;
          }
          if (existing.actor) existingActor = existing.actor;
          if (existing.duration) existingDuration = existing.duration;
        }
      } catch (e) {}

      try {
        if (cloud.context && cloud.context.custom) {
          if (cloud.context.custom.mood) folderMood = cloud.context.custom.mood;
          if (cloud.context.custom.cover) {
            cover = cloud.context.custom.cover;
            fallbackUrl = cover;
          }
          if (cloud.context.custom.artist) songArtist = cloud.context.custom.artist;
          if (cloud.context.custom.title) name = cloud.context.custom.title;
          if (cloud.context.custom.album) albumName = cloud.context.custom.album;
        }
      } catch (e) {}

      if (name === cloud.public_id.split('/').pop().split('.')[0].replace(/_/g, ' ') || name === cloud.filename) {
        name = cleanSearchTerm(name);
        if (name.includes('-') && songArtist === 'Cloud Artist') {
          const parts = name.split('-');
          if (parts.length >= 2) {
            songArtist = parts[0].trim();
            name = parts.slice(1).join('-').trim();
          }
        }
      }

      // Check for overrides or resolve via auto-resolver if no explicit cover in context
      const songOverride = overrides[cloud.public_id];

      if (songOverride) {
        cover = songOverride.cover || cover;
        fallbackUrl = songOverride.cover || fallbackUrl;
        albumName = songOverride.album || albumName;
        songArtist = songOverride.artist || songArtist;
      } else if (cover === 'https://images.unsplash.com/photo-1493225457124-a1a2a5d5facf?w=500') {
        const resolved = await resolveMusicMetadata(cloud.public_id, name);
        if (resolved.cover) {
          cover = resolved.cover;
          fallbackUrl = resolved.cover;
        }
        albumName = (resolved.album && resolved.album !== 'Singles') ? resolved.album : albumName;
        
        // ONLY update artist from iTunes if we didn't explicitly extract an Actor from the Cloudinary folder!
        if (songArtist === 'Unknown Artist' && resolved.artist && resolved.artist !== 'Cloud Artist') {
          songArtist = resolved.artist;
        }
      }

      localSongs.push({
        id: getStableId(cloud.public_id),
        title: name,
        artist: songArtist,
        src: cloud.secure_url,
        cover: cover,
        fallbackCover: fallbackUrl,
        album: albumName,
        mood: folderMood,
        actor: existingActor,
        duration: cloud.duration || existingDuration || 0,
        genre: 'Tamil',
        uploadedAt: cloud.created_at
      });
    }

    if (localSongs.length > 0) {
        fs.writeFileSync(SONGS_JSON, JSON.stringify(localSongs, null, 2));
        console.log('✅ songs.json updated with correct folders!');
    } else {
        console.log('😴 No songs found yet. Check your Cloudinary folders!');
    }

  } catch (err) { console.error('❌ ERROR:', err.message); }
};

// ─── ARTWORK HYDRATION ENDPOINT ───────────────────────────────────────
const searchItunes = async (query) => {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=in&media=music&entity=song&limit=5`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    const track = data.results[0];
    const art = track.artworkUrl100;
    return {
      coverUrl: art ? art.replace('100x100bb.jpg', '600x600bb.jpg') : null,
      artist: track.artistName || null,
      album: track.collectionName ? track.collectionName.replace(/\(Original Motion Picture Soundtrack\)/gi, '').replace(/- EP/gi, '').trim() : null
    };
  }
  return null;
};

const searchDeezer = async (query) => {
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=3`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.data && data.data.length > 0) {
    const track = data.data[0];
    return {
      coverUrl: track.album?.cover_xl || track.album?.cover_big || null,
      artist: track.artist?.name || null,
      album: track.album?.title || null
    };
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
      const track = results[0];
      const images = track.image;
      let coverUrl = null;
      if (Array.isArray(images)) {
        const hq = images.find(i => i.quality === '500x500') || images[images.length - 1];
        coverUrl = hq?.url || null;
      }
      return {
        coverUrl,
        artist: track.primaryArtists || null,
        album: track.album?.name || null
      };
    }
  } catch (_) {}
  return null;
};

app.get('/api/artwork', async (req, res) => {
  let { title = '', artist = '' } = req.query;

  title = cleanSearchTerm(decodeURIComponent(title));
  artist = decodeURIComponent(artist).replace('Unknown Artist', '').trim();

  if (!title) return res.status(400).json({ error: 'title is required', coverUrl: null });

  const queries = [];
  if (artist && artist !== 'Unknown Artist') queries.push(`${title} ${artist}`);
  queries.push(title);

  const words = title.split(' ').filter(Boolean);
  if (words.length > 3) queries.push(words.slice(0, 3).join(' '));

  let result = null;

  for (const q of queries) {
    if (result && result.coverUrl) break;
    try { result = await searchItunes(q); } catch (_) {}
    if (!result || !result.coverUrl) {
      try { result = await searchDeezer(q); } catch (_) {}
    }
    if (!result || !result.coverUrl) {
      try { result = await searchSaavn(q); } catch (_) {}
    }
  }

  if (!result) result = { coverUrl: null, artist: null, album: null };

  if (!result.coverUrl) {
    const prompt = encodeURIComponent(`Beautiful dynamic aesthetic album art for the song "${title}", vibrant colors, no text, music streaming cover`);
    const seed = title.length * 42; 
    result.coverUrl = `https://image.pollinations.ai/prompt/${prompt}?width=600&height=600&nologo=true&seed=${seed}`;
  }

  return res.status(200).json(result);
});

let isSyncing = false;
const syncLoop = async () => {
  if (isSyncing) return;
  isSyncing = true;
  await syncWithCloudinary();
  isSyncing = false;
  setTimeout(syncLoop, 5 * 60 * 1000); // Wait 5 minutes between deep syncs
};
syncLoop();

app.get('/api/songs', (req, res) => {
  try {
    if (fs.existsSync(SONGS_JSON)) {
      const data = fs.readFileSync(SONGS_JSON, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.json([]);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/songs', (req, res) => {
  try {
    const { title, artist, src, cover, album, genre, mood } = req.body;
    if (!title || !src) {
      return res.status(400).json({ error: 'Title and audio src are required' });
    }

    let songs = [];
    if (fs.existsSync(SONGS_JSON)) {
      songs = JSON.parse(fs.readFileSync(SONGS_JSON, 'utf-8'));
    }

    // Check for duplicate title
    const cleanNewTitle = cleanSearchTerm(title).toLowerCase();
    const isDuplicate = songs.some(s => cleanSearchTerm(s.title).toLowerCase() === cleanNewTitle);
    
    if (isDuplicate) {
      return res.status(400).json({ error: 'This song already exists in the library!' });
    }

    const newSong = {
      id: getStableId(src),
      title,
      artist: artist || 'Cloud Artist',
      src,
      cover: cover || '/favicon.svg',
      fallbackCover: cover || '/favicon.svg',
      album: album || 'Singles',
      mood: mood || 'Melody',
      genre: genre || 'Tamil',
      uploadedAt: new Date().toISOString()
    };

    songs.push(newSong);
    fs.writeFileSync(SONGS_JSON, JSON.stringify(songs, null, 2));

    console.log(`✅ [POST /api/songs] Successfully added new song: "${title}"`);
    res.status(201).json(newSong);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const readUsers = () => {
  try {
    if (fs.existsSync(USERS_JSON)) {
      return JSON.parse(fs.readFileSync(USERS_JSON, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading users file:', e);
  }
  return [];
};

const writeUsers = (users) => {
  try {
    fs.writeFileSync(USERS_JSON, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('Error writing users file:', e);
  }
};

// ─── Playlists API ──────────────────────────────────────────────────────────

app.get('/api/playlists', (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const playlists = readPlaylists();
    const userPlaylists = playlists.filter(p => p.email === email.toLowerCase());
    res.json(userPlaylists);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/playlists', (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'Email and name required' });
    
    const playlists = readPlaylists();
    const newPlaylist = {
      id: 'pl_' + Date.now() + Math.random().toString(36).substr(2, 5),
      email: email.toLowerCase(),
      name,
      songs: [],
      createdAt: new Date().toISOString()
    };
    playlists.push(newPlaylist);
    writePlaylists(playlists);
    
    res.status(201).json(newPlaylist);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/playlists/:id/add', (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    if (!songId) return res.status(400).json({ error: 'Song ID required' });

    const playlists = readPlaylists();
    const playlist = playlists.find(p => p.id === id);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      writePlaylists(playlists);
    }
    res.json(playlist);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/playlists/:id/remove', (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    
    const playlists = readPlaylists();
    const playlist = playlists.find(p => p.id === id);
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

    playlist.songs = playlist.songs.filter(s => s !== songId);
    writePlaylists(playlists);
    res.json(playlist);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/playlists/:id', (req, res) => {
  try {
    const { id } = req.params;
    let playlists = readPlaylists();
    playlists = playlists.filter(p => p.id !== id);
    writePlaylists(playlists);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const users = readUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = {
      name,
      email: email.toLowerCase(),
      password,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      role: email.toLowerCase() === 'admin@rhythmix.com' ? 'admin' : 'user',
      registeredAt: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

    const sessionInfo = { name: newUser.name, email: newUser.email, avatar: newUser.avatar, role: newUser.role };
    res.status(201).json(sessionInfo);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

let lastGlobalLogoutAt = 0;

app.post('/api/admin/logout-all', (req, res) => {
  lastGlobalLogoutAt = Date.now();
  console.log(`🔒 ADMIN ACTION: Force logged out all users at ${new Date(lastGlobalLogoutAt).toISOString()}`);
  res.json({ success: true, message: 'All users have been forcefully logged out.', lastGlobalLogoutAt });
});

app.get('/api/auth/status', (req, res) => {
  res.json({ lastGlobalLogoutAt });
});

app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = readUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const sessionInfo = { name: user.name, email: user.email, avatar: user.avatar, role: user.role };
    res.json(sessionInfo);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/users', (req, res) => {
  try {
    const users = readUsers();
    const safeUsers = users.map(({ password, ...u }) => u);
    res.json(safeUsers);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ─── FETCH CLOUDINARY SONGS ENDPOINT ──────────────────────────────────────────────────────────
const readStats = () => {
  try {
    if (fs.existsSync(STATS_JSON)) {
      return JSON.parse(fs.readFileSync(STATS_JSON, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading stats file:', e);
  }
  return { downloads: 0 };
};

const writeStats = (stats) => {
  try {
    fs.writeFileSync(STATS_JSON, JSON.stringify(stats, null, 2));
  } catch (e) {
    console.error('Error writing stats file:', e);
  }
};

app.get('/api/stats', (req, res) => {
  try {
    const stats = readStats();
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/stats/download', (req, res) => {
  try {
    const stats = readStats();
    stats.downloads = (stats.downloads || 0) + 1;
    writeStats(stats);
    res.json({ success: true, downloads: stats.downloads });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── NATIVE GLOBAL SAAVN SEARCH (100% STABLE) ───────────────────────────────
import forge from 'node-forge';

function decryptSaavnUrl(encryptedUrl) {
  try {
    const key = '38346591';
    const iv = '00000000';
    const encrypted = forge.util.decode64(encryptedUrl);
    const decipher = forge.cipher.createDecipher('DES-ECB', forge.util.createBuffer(key));
    decipher.start({ iv: forge.util.createBuffer(iv) });
    decipher.update(forge.util.createBuffer(encrypted));
    decipher.finish();
    return decipher.output.getBytes().replace('_96', '_320'); // upgrade to 320kbps
  } catch(e) {
    return null;
  }
}

app.get('/api/saavn/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    // Directly query the official JioSaavn API with Tamil language priority and a larger limit (150)
    const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(q)}&p=1&n=150&_format=json&_marker=0&ctx=web6dot0`;
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Cookie': 'L=tamil;' } });
    const data = await response.json();

    if (!data || !data.results) return res.json([]);

    const formattedResults = data.results.map(track => {
      // Clean up the image url to 500x500
      let coverUrl = track.image ? track.image.replace('150x150', '500x500') : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';
      
      // Decrypt the direct MP4 stream using native cryptography
      const streamUrl = track.encrypted_media_url ? decryptSaavnUrl(track.encrypted_media_url) : null;

      // Decode HTML entities in title (like &quot;)
      const cleanTitle = (track.song || 'Unknown Title').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

      return {
        id: `saavn_${track.id}`,
        title: cleanTitle,
        artist: track.primary_artists || 'Unknown Artist',
        album: track.album || 'Singles',
        cover: coverUrl,
        src: streamUrl,
        duration: parseInt(track.duration, 10) || 0,
        isSaavn: true,
        mood: 'Global'
      };
    }).filter(s => s.src); // Ensure only playable tracks are returned

    res.json(formattedResults);
  } catch (err) {
    console.error('Saavn API Error:', err.message);
    res.status(500).json({ error: 'Failed to search global music' });
  }
});

// ─── NATIVE GLOBAL SAAVN HOME DATA (LAUNCH DATA) ──────────────────────────
app.get('/api/saavn/home', async (req, res) => {
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=webapi.getLaunchData&api_version=4&_format=json&_marker=0&ctx=web6dot0&languages=tamil`;
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Cookie': 'L=tamil;' } });
    const data = await response.json();

    const formatItem = (item) => ({
      id: item.id,
      title: (item.title || 'Unknown').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
      subtitle: (item.subtitle || item.header_desc || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
      type: item.type,
      cover: item.image ? item.image.replace('150x150', '500x500') : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500',
    });

    res.json({
      trending: (data.new_trending || []).map(formatItem),
      playlists: (data.top_playlists || []).map(formatItem),
      albums: (data.new_albums || []).map(formatItem)
    });
  } catch (err) {
    console.error('Saavn Home API Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch global home data' });
  }
});

// Serve static files from the React frontend build
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all route to serve index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => { console.log(`🚀 DEEP SYNC SERVER ONLINE on port ${PORT} (IPv4)!`); });
