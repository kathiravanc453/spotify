import fs from 'fs';
import https from 'https';

const SONGS_JSON = './backend/songs.json';

const fetchItunesData = (searchTerm) => {
  return new Promise((resolve) => {
    const query = encodeURIComponent(searchTerm + ' tamil');
    const url = `https://itunes.apple.com/search?term=${query}&media=music&limit=1`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.results && parsed.results.length > 0) {
            const track = parsed.results[0];
            resolve({
              artist: track.artistName,
              title: track.trackName,
              album: track.collectionName,
              cover: track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb', '500x500bb') : null
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
};

const patchSongs = async () => {
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
                 
      console.log(`Searching iTunes for: ${name}`);
      const itunesData = await fetchItunesData(name);
      
      if (itunesData) {
        song.artist = itunesData.artist;
        if (itunesData.album) song.album = itunesData.album;
        if (itunesData.cover) {
           song.cover = itunesData.cover;
           song.fallbackCover = itunesData.cover;
        }
        console.log(`   -> Fixed! Artist: ${song.artist}`);
        fixed++;
      } else {
        console.log(`   -> No results from iTunes.`);
      }
      
      await new Promise(r => setTimeout(r, 1500)); // Be nice to iTunes API
    }
  }
  
  if (fixed > 0) {
    fs.writeFileSync(SONGS_JSON, JSON.stringify(songs, null, 2));
    console.log(`\n✅ Patched ${fixed} songs directly via Apple Music API!`);
  } else {
    console.log(`\n✅ No Unknown Artists left or no fixes applied.`);
  }
};

patchSongs();
