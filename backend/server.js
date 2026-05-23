import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

cloudinary.config({
  cloud_name: 'dm1cwbbfg',
  api_key: '969989851682274',
  api_secret: '6N9cJ9fhanGad1sj--3gssD-vCk'
});

const SONGS_JSON = path.join(__dirname, '..', 'src', 'data', 'songs.json');

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

const getMoodFromFolder = (folderPath) => {
  if (!folderPath) return 'Melody';

  // If the folder is a nested path, prefer the last segment but consider full path for mapping
  const segments = folderPath.split('/').filter(Boolean);
  const folder = segments.length ? segments[segments.length - 1] : folderPath;

  // Load optional mappings from backend/mood-mapping.json (case-insensitive keys)
  try {
    const mappingsPath = path.join(__dirname, 'mood-mapping.json');
    if (fs.existsSync(mappingsPath)) {
      const raw = fs.readFileSync(mappingsPath, 'utf-8');
      const mappings = JSON.parse(raw);
      const keys = Object.keys(mappings);
      const foundKey = keys.find(k => k.toLowerCase() === folder.toLowerCase() || k.toLowerCase() === folderPath.toLowerCase());
      if (foundKey) return mappings[foundKey];
    }
  } catch (e) {
    console.warn('⚠️ Could not read mood-mapping.json:', e.message);
  }

  const clean = folder.toLowerCase().replace(/[_-]/g, ' ').trim();

  if (clean.includes('love')) return 'Love';
  if (clean.includes('romance') || clean.includes('romantic')) return 'Romance';
  if (clean.includes('melody') || clean.includes('melodies')) return 'Melody';
  if (clean.includes('vibe')) return 'Vibes';
  if (clean.includes('energy') || clean.includes('boost')) return 'Energy Boost';

  // Default: capitalize the folder segment
  return folder.charAt(0).toUpperCase() + folder.slice(1);
};

const syncWithCloudinary = async () => {
  console.log('\n====================================================');
  console.log('🛰️ DEEP FOLDER SYNC... (' + new Date().toLocaleTimeString() + ')');
  
  try {
    const result = await cloudinary.search
      .expression('resource_type:video')
      .with_field('tags')
      .with_field('context')
      .max_results(500)
      .execute();

    const cloudSongs = result.resources.filter(r => r.format === 'mp3' || r.format === 'm4a');
    console.log(`🎵 I found ${cloudSongs.length} songs in your Cloudinary account.`);

    let localSongs = [];

    for (const cloud of cloudSongs) {
      // Prefer explicit mood set during upload via tags or context
      let folderMood = null;

      // Check Cloudinary context.custom (some SDKs set custom context under context.custom)
      try {
        if (cloud.context && cloud.context.custom && cloud.context.custom.mood) {
          folderMood = cloud.context.custom.mood;
        }
      } catch (e) {}

      // Check tags like "mood:Melody"
      if (!folderMood && Array.isArray(cloud.tags)) {
        const moodTag = cloud.tags.find(t => typeof t === 'string' && t.toLowerCase().startsWith('mood:'));
        if (moodTag) folderMood = moodTag.split(':').slice(1).join(':');
      }

      // Fallback to folder detection
      let rawFolder = cloud.folder;
      if (!folderMood) {
        if (!rawFolder && cloud.public_id && cloud.public_id.includes('/')) {
          const parts = cloud.public_id.split('/');
          parts.pop();
          rawFolder = parts.join('/');
        }
        folderMood = getMoodFromFolder(rawFolder);
      }

      console.log(`  > "${cloud.public_id}" detected folder: "${rawFolder || 'root'}" -> Assigned Mood: "${folderMood}"`);

      const name = cloud.public_id.split('/').pop().split('.')[0].replace(/_/g, ' ');
      const artist = 'Cloud Artist';
      
      const defaultCover = `https://image.pollinations.ai/prompt/${encodeURIComponent(`artistic album cover for the song "${name}" by ${artist}, high resolution music art`)}?width=512&height=512&nologo=true&seed=${getStableId(cloud.public_id)}`;
      
      localSongs.push({
        id: getStableId(cloud.public_id),
        title: name,
        artist: artist,
        src: cloud.secure_url,
        cover: `https://res.cloudinary.com/dm1cwbbfg/image/upload/${cloud.public_id}.jpg`,
        fallbackCover: defaultCover,
        mood: folderMood,
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

setInterval(syncWithCloudinary, 15000);
syncWithCloudinary();

app.listen(PORT, () => { console.log(`🚀 DEEP SYNC SERVER ONLINE!`); });
