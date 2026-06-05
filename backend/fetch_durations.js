import fs from 'fs';
import * as mm from 'music-metadata';
import path from 'path';
import https from 'https';

const songsPath = path.join(process.cwd(), 'songs.json');

async function getDurationFromUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, async (res) => {
      try {
        const metadata = await mm.parseStream(res, { mimeType: 'audio/mpeg' }, { duration: true, skipCovers: true });
        res.destroy(); // close to save bandwidth
        if (metadata.format && metadata.format.duration) {
          resolve(Math.round(metadata.format.duration));
        } else {
          resolve(0);
        }
      } catch (err) {
        res.destroy();
        resolve(0);
      }
    });
    req.on('error', () => resolve(0));
    req.setTimeout(5000, () => { req.destroy(); resolve(0); });
  });
}

async function updateDurationsConcurrently() {
  const data = fs.readFileSync(songsPath, 'utf8');
  const songs = JSON.parse(data);
  let updated = 0;
  
  const pendingSongs = songs.filter(s => !s.duration || s.duration === 0);
  console.log(`Found ${pendingSongs.length} songs missing duration. Fetching concurrently...`);

  // Process in chunks of 30 to avoid overwhelming network or hitting rate limits
  const CHUNK_SIZE = 30;
  for (let i = 0; i < pendingSongs.length; i += CHUNK_SIZE) {
    const chunk = pendingSongs.slice(i, i + CHUNK_SIZE);
    
    const promises = chunk.map(async (song) => {
      const duration = await getDurationFromUrl(song.src);
      if (duration > 0) {
        song.duration = duration;
        updated++;
        process.stdout.write('.');
      } else {
        process.stdout.write('x');
      }
    });
    
    await Promise.all(promises);
    
    // Save progress after each chunk
    const newSongs = songs.map(s => {
      const matched = chunk.find(c => c.id === s.id);
      return matched ? matched : s;
    });
    fs.writeFileSync(songsPath, JSON.stringify(newSongs, null, 2));
    console.log(`\nProcessed ${Math.min(i + CHUNK_SIZE, pendingSongs.length)}/${pendingSongs.length}`);
  }

  console.log(`\nDone! Successfully updated ${updated} songs.`);
}

updateDurationsConcurrently();
