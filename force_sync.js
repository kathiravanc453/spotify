import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dm1cwbbfg',
  api_key: '969989851682274',
  api_secret: '6N9cJ9fhanGad1sj--3gssD-vCk'
});

const forceSync = async () => {
  const songsPath = './backend/songs.json';
  const songs = JSON.parse(fs.readFileSync(songsPath, 'utf8'));
  let fixed = 0;

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    if (song.artist === 'Unknown Artist' || song.artist === 'Cloud Artist') {
      let public_id = song.src.split('/').pop();
      if (public_id.endsWith('.mp3')) public_id = public_id.slice(0, -4);
      if (public_id.endsWith('.m4a')) public_id = public_id.slice(0, -4);
      if (public_id.endsWith('.wav')) public_id = public_id.slice(0, -4);
      try {
        console.log(`Fetching Cloudinary context directly for: ${public_id}...`);
        const cloud = await cloudinary.api.resource(public_id, { resource_type: 'video', context: true });
        
        if (cloud.context && cloud.context.custom) {
          if (cloud.context.custom.artist && cloud.context.custom.artist !== 'Cloud Artist') {
            song.artist = cloud.context.custom.artist;
          }
          if (cloud.context.custom.album) {
            song.album = cloud.context.custom.album;
          }
          if (cloud.context.custom.cover) {
            song.cover = cloud.context.custom.cover;
            song.fallbackCover = cloud.context.custom.cover;
          }
          console.log(`   -> Fixed! Artist: ${song.artist}`);
          fixed++;
        } else {
           console.log(`   -> No context found on Cloudinary.`);
        }
      } catch (err) {
        console.log(`   -> Failed to fetch from Cloudinary: ${err.message}`);
      }
      
      // Delay to avoid hitting rate limits too quickly
      await new Promise(r => setTimeout(r, 200));
    }
  }

  if (fixed > 0) {
    fs.writeFileSync(songsPath, JSON.stringify(songs, null, 2));
    console.log(`\n✅ Successfully force-synced ${fixed} songs directly from Cloudinary context!`);
  } else {
    console.log(`\n✅ All songs are already perfectly synced!`);
  }
};

forceSync();
