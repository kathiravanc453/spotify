const fs = require('fs');
const path = require('path');
const https = require('https');

const SONGS_JSON = path.join(__dirname, 'songs.json');
let songs = [];
try {
  songs = JSON.parse(fs.readFileSync(SONGS_JSON, 'utf8'));
} catch (e) {
  console.error("Could not read songs.json");
  process.exit(1);
}

const cleanSearchTerm = (title) => {
  let term = decodeURIComponent(title);
  term = term.replace(/\[.*?\]/g, '')
             .replace(/\(.*?\)/g, '')
             .replace(/_|-/g, ' ')
             .replace(/\d+ kbps/gi, '')
             .replace(/from quot.*?quot/gi, '')
             .replace(/tamilmp3free\.com/gi, '')
             .replace(/high quality/gi, '')
             .replace(/hq/gi, '')
             .replace(/tamil/gi, '')
             .replace(/song/gi, '')
             .replace(/masstamilan\.in/gi, '')
             .replace(/masstamilan/gi, '')
             .replace(/starmusiq/gi, '')
             .replace(/sensongsmp3/gi, '')
             .replace(/\s+/g, ' ').trim();
  return term;
};

const searchItunes = async (query) => {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=in&media=music&entity=song&limit=3`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    const track = data.results[0];
    const art = track.artworkUrl100;
    return {
      cover: art ? art.replace('100x100bb.jpg', '600x600bb.jpg') : null,
      artist: track.artistName || null,
      album: track.collectionName ? track.collectionName.replace(/\(Original Motion Picture Soundtrack\)/gi, '').replace(/- EP/gi, '').trim() : null
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
        cover: coverUrl,
        artist: track.primaryArtists || null,
        album: track.album?.name || null
      };
    }
  } catch (_) {}
  return null;
};

async function fixMetadata() {
  const missingData = songs.filter(s => 
    s.artist === 'Unknown Artist' || 
    s.artist === 'Cloud Artist' || 
    s.cover === 'https://images.unsplash.com/photo-1493225457124-a1a2a5d5facf?w=500' ||
    s.cover === null
  );

  console.log(`Starting metadata fix for ${missingData.length} songs...`);

  let count = 0;
  for (let song of missingData) {
    count++;
    let title = cleanSearchTerm(song.title);
    
    // Extract folder artist if available and artist is Unknown
    if ((song.artist === 'Unknown Artist' || song.artist === 'Cloud Artist') && song.src) {
        try {
            const urlParts = song.src.split('/');
            const filename = urlParts.pop();
            const parentFolder = decodeURIComponent(urlParts[urlParts.length - 1]);
            if (parentFolder && parentFolder !== 'upload' && parentFolder !== 'v1') {
                song.artist = parentFolder;
            }
        } catch(e) {}
    }
    
    let query = title;
    if (song.artist && song.artist !== 'Unknown Artist' && song.artist !== 'Cloud Artist') {
       query = `${title} ${song.artist}`;
    }

    console.log(`[${count}/${missingData.length}] Resolving: ${title} ...`);

    let result = null;
    try { result = await searchItunes(query); } catch(e) {}
    
    if (!result || !result.cover) {
        try { result = await searchSaavn(query); } catch(e) {}
    }
    
    if (!result || !result.cover) {
        try { result = await searchItunes(title); } catch(e) {}
    }

    if (result) {
      if (result.cover && song.cover.includes('unsplash')) {
         song.cover = result.cover;
         song.fallbackCover = result.cover;
      }
      if (result.artist && (song.artist === 'Unknown Artist' || song.artist === 'Cloud Artist')) {
         song.artist = result.artist;
      }
      if (result.album && song.album === 'Cloudinary Singles') {
         song.album = result.album;
      }
      console.log(`  -> Fixed! Artist: ${song.artist}, Cover: Found`);
    } else {
      console.log(`  -> No exact match found for ${title}.`);
    }

    // Save progressively so we don't lose data if script stops
    fs.writeFileSync(SONGS_JSON, JSON.stringify(songs, null, 2));

    // Delay 1.5 seconds
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('✅ ALL METADATA FIXED!');
}

fixMetadata();
