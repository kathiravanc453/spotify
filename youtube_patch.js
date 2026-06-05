import fs from 'fs';
import ytSearch from 'yt-search';

const SONGS_JSON = './backend/songs.json';

const patchSongsYoutube = async () => {
  const songs = JSON.parse(fs.readFileSync(SONGS_JSON, 'utf8'));
  let fixed = 0;
  
  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    if (song.artist === 'Unknown Artist' || song.artist === 'Cloud Artist') {
      let rawName = song.src.split('/').pop();
      if (rawName.endsWith('.mp3')) rawName = rawName.slice(0, -4);
      if (rawName.endsWith('.m4a')) rawName = rawName.slice(0, -4);
      if (rawName.endsWith('.wav')) rawName = rawName.slice(0, -4);
      
      if (/_[a-zA-Z0-9]{6}$/.test(rawName)) {
        rawName = rawName.substring(0, rawName.length - 7);
      }
      
      let name = rawName.replace(/_/g, ' ');
      if (name.includes('-')) {
        name = name.split('-').join(' ');
      }
      
      name = name.replace(/MassTamilan/gi, '')
                 .replace(/\.com/gi, '')
                 .replace(/\.fm/gi, '')
                 .replace(/\.dev/gi, '')
                 .replace(/\.org/gi, '')
                 .trim();
                 
      console.log(`Searching YouTube for: ${name}`);
      try {
        const results = await ytSearch(name + ' tamil song');
        if (results && results.videos.length > 0) {
          const video = results.videos[0];
          // Extrapolate artist from channel name or title
          let artist = video.author.name;
          if (artist.toLowerCase().includes('vevo') || artist.toLowerCase().includes('music')) {
             artist = artist.replace(/vevo/gi, '').replace(/music/gi, '').trim();
          }
          if (artist.length < 2) artist = 'Various Artists';
          
          song.artist = artist;
          song.cover = video.image;
          song.fallbackCover = video.image;
          console.log(`   -> Fixed! Artist: ${song.artist}`);
          fixed++;
        } else {
          console.log(`   -> No results from YouTube.`);
        }
      } catch(err) {
        console.log(`   -> YouTube search failed.`);
      }
      
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  if (fixed > 0) {
    fs.writeFileSync(SONGS_JSON, JSON.stringify(songs, null, 2));
    console.log(`\n✅ Patched ${fixed} songs directly via YouTube!`);
  } else {
    console.log(`\n✅ No Unknown Artists left or no fixes applied.`);
  }
};

patchSongsYoutube();
