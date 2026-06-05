import { v2 as cloudinary } from 'cloudinary';
import https from 'https';

cloudinary.config({
  cloud_name: 'dm1cwbbfg',
  api_key: '969989851682274',
  api_secret: '6N9cJ9fhanGad1sj--3gssD-vCk'
});

const searchItunes = async (query) => {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=in&media=music&entity=song&limit=5`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const track = data.results[0];
      return {
        artist: track.artistName || null,
        album: track.collectionName ? track.collectionName.replace(/\(Original Motion Picture Soundtrack\)/gi, '').replace(/- EP/gi, '').trim() : null
      };
    }
  } catch (e) {}
  return null;
};

const searchDeezer = async (query) => {
  try {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=3`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      const track = data.data[0];
      return {
        artist: track.artist?.name || null,
        album: track.album?.title || null
      };
    }
  } catch (e) {}
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
      return {
        artist: track.primaryArtists || null,
        album: track.album?.name || null
      };
    }
  } catch (e) {}
  return null;
};

const cleanSearchTerm = (str) => {
  return str.replace(/\(.*?\)/g, '')
            .replace(/\[.*?\]/g, '')
            .replace(/-?\s*(official|music|video|lyric|audio|remix|hd|hq|1080p|4k).*$/i, '')
            .replace(/MassTamilan\.io/g, '')
            .replace(/MassTamilan\.dev/g, '')
            .replace(/\[.*\]/g, '')
            .replace(/\{.*\}/g, '')
            .replace(/_|-/g, ' ')
            .replace(/high quality/gi, '')
            .replace(/clear audio/gi, '')
            .replace(/nsidwa/gi, '')
            .replace(/m4a/gi, '')
            .replace(/128k/gi, '')
            .replace(/320k/gi, '')
            .replace(/kbps/gi, '')
            .trim();
};

const fixArtists = async () => {
  console.log("Fetching all songs from Cloudinary...");
  let allCloudinarySongs = [];
  let nextCursor = null;

  try {
    do {
      const res = await cloudinary.api.resources({
        resource_type: 'video',
        max_results: 500,
        next_cursor: nextCursor,
        context: true,
        type: 'upload'
      });
      allCloudinarySongs = allCloudinarySongs.concat(res.resources);
      nextCursor = res.next_cursor;
    } while (nextCursor);
    
    console.log(`Found ${allCloudinarySongs.length} total songs.`);

    let fixedCount = 0;

    for (let i = 0; i < allCloudinarySongs.length; i++) {
      const cloud = allCloudinarySongs[i];
      const public_id = cloud.public_id;
      
      const custom = cloud.context?.custom || {};
      const existingArtist = custom.artist;
      
      if (existingArtist && existingArtist !== 'Unknown Artist' && existingArtist !== 'Cloud Artist') {
        continue; // Already fixed
      }

      let rawName = public_id.split('/').pop().split('.')[0];
      if (/_[a-zA-Z0-9]{6}$/.test(rawName)) {
        rawName = rawName.substring(0, rawName.length - 7);
      }
      let name = cleanSearchTerm(rawName.replace(/_/g, ' '));
      
      console.log(`[${i+1}/${allCloudinarySongs.length}] Searching for: "${name}"...`);
      
      let result = null;
      try { result = await searchItunes(name); } catch (_) {}
      if (!result || !result.artist) {
        try { result = await searchDeezer(name); } catch (_) {}
      }
      if (!result || !result.artist) {
        try { result = await searchSaavn(name); } catch (_) {}
      }

      if (result && result.artist) {
        let artist = result.artist;
        let album = result.album || 'Cloudinary Singles';
        
        console.log(`   -> Found Artist: ${artist}`);
        
        try {
          const contextParts = [];
          if (custom.cover) contextParts.push(`cover=${custom.cover}`);
          if (custom.title) contextParts.push(`title=${custom.title}`);
          if (custom.mood) contextParts.push(`mood=${custom.mood}`);
          contextParts.push(`artist=${artist}`);
          contextParts.push(`album=${album}`);
          
          const contextString = contextParts.join('|');
          
          await cloudinary.api.update(public_id, {
            resource_type: 'video',
            context: contextString
          });
          fixedCount++;
        } catch (updateErr) {
          console.error(`   -> Failed to update Cloudinary:`, updateErr.message);
        }
      } else {
        console.log(`   -> No artist found.`);
      }
      
      // Mandatory delay to prevent API IP blocking
      await new Promise(r => setTimeout(r, 600));
    }
    
    console.log(`\n✅ Finished! Fixed ${fixedCount} songs permanently in Cloudinary!`);

  } catch (error) {
    console.error("Fatal error:", error);
  }
};

fixArtists();
