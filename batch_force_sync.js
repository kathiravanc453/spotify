import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dm1cwbbfg',
  api_key: '969989851682274',
  api_secret: '6N9cJ9fhanGad1sj--3gssD-vCk'
});

const batchForceSync = async () => {
  const songsPath = './backend/songs.json';
  const songs = JSON.parse(fs.readFileSync(songsPath, 'utf8'));
  let fixed = 0;

  console.log('Fetching all contexts in ONE bulk API call to avoid rate limits...');
  try {
    let allResources = [];
    let nextCursor = null;
    do {
      const res = await cloudinary.api.resources({
        resource_type: 'video',
        max_results: 500,
        next_cursor: nextCursor,
        context: true,
        type: 'upload'
      });
      allResources = allResources.concat(res.resources);
      nextCursor = res.next_cursor;
    } while (nextCursor);

    console.log(`Fetched ${allResources.length} resources from Cloudinary.`);

    // Build a map of public_id -> context
    const contextMap = {};
    for (const r of allResources) {
      if (r.context && r.context.custom) {
        contextMap[r.public_id] = r.context.custom;
      }
    }

    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      if (song.artist === 'Unknown Artist' || song.artist === 'Cloud Artist') {
        let public_id = song.src.split('/').pop();
        if (public_id.endsWith('.mp3')) public_id = public_id.slice(0, -4);
        if (public_id.endsWith('.m4a')) public_id = public_id.slice(0, -4);
        if (public_id.endsWith('.wav')) public_id = public_id.slice(0, -4);

        const custom = contextMap[public_id];
        if (custom) {
          if (custom.artist && custom.artist !== 'Cloud Artist') {
            song.artist = custom.artist;
          }
          if (custom.album) {
            song.album = custom.album;
          }
          if (custom.cover) {
            song.cover = custom.cover;
            song.fallbackCover = custom.cover;
          }
          console.log(`   -> Fixed! Artist: ${song.artist}`);
          fixed++;
        }
      }
    }

    if (fixed > 0) {
      fs.writeFileSync(songsPath, JSON.stringify(songs, null, 2));
      console.log(`\n✅ Successfully batch force-synced ${fixed} songs!`);
    } else {
      console.log(`\n✅ All songs perfectly synced! No Unknown Artists remaining.`);
    }

  } catch (err) {
    console.error('Failed to batch sync:', err);
  }
};

batchForceSync();
