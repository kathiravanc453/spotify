import { v2 as cloudinary } from 'cloudinary';
import https from 'https';

cloudinary.config({
  cloud_name: 'dm1cwbbfg',
  api_key: '969989851682274',
  api_secret: '6N9cJ9fhanGad1sj--3gssD-vCk'
});

const cleanSearchTerm = (str) => {
  return str.replace(/\(.*?\)/g, '')
            .replace(/\[.*?\]/g, '')
            .replace(/_|-/g, ' ')
            .replace(/MassTamilan\.io/gi, '')
            .replace(/MassTamilan\.com/gi, '')
            .replace(/MassTamilan\.dev/gi, '')
            .replace(/MassTamilan/gi, '')
            .replace(/high quality/gi, '')
            .replace(/clear audio/gi, '')
            .replace(/nsidwa/gi, '')
            .replace(/m4a/gi, '')
            .replace(/128k/gi, '')
            .replace(/320k/gi, '')
            .replace(/kbps/gi, '')
            .replace(/official/gi, '')
            .replace(/video/gi, '')
            .trim();
};

const searchItunes = async (query, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await new Promise((resolve, reject) => {
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
                return resolve({
                  title: track.trackName,
                  artist: track.artistName,
                  album: track.collectionName ? track.collectionName.replace(/\(Original Motion Picture Soundtrack\)/gi, '').replace(/- EP/gi, '').trim() : 'Singles',
                  cover: highResArtwork
                });
              }
            } catch (e) {}
            resolve(null);
          });
        }).on('error', (err) => reject(err));
      });
      return result;
    } catch (err) {
      if (attempt === retries) return null;
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
  return null;
};

const fixAllArtistsViaItunes = async () => {
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

    for (let i = 258; i < allCloudinarySongs.length; i++) {
      const cloud = allCloudinarySongs[i];
      const public_id = cloud.public_id;
      const custom = cloud.context?.custom || {};
      
      let rawName = public_id.split('/').pop().split('.')[0];
      if (/_[a-zA-Z0-9]{6}$/.test(rawName)) {
        rawName = rawName.substring(0, rawName.length - 7);
      }
      let name = cleanSearchTerm(rawName.replace(/_/g, ' '));
      
      console.log(`[${i+1}/${allCloudinarySongs.length}] iTunes Searching for: "${name}"...`);
      
      // Try with "Tamil" appended for better Indian music results
      let itunesData = await searchItunes(name + ' Tamil');
      if (!itunesData) {
        // Fallback to exact name
        itunesData = await searchItunes(name);
      }
      
      if (itunesData) {
        console.log(`   -> Found via iTunes: ${itunesData.artist} (Album: ${itunesData.album})`);
        
        const contextParts = [];
        contextParts.push(`title=${itunesData.title || name}`);
        contextParts.push(`artist=${itunesData.artist}`);
        contextParts.push(`album=${itunesData.album}`);
        if (itunesData.cover) {
           contextParts.push(`cover=${itunesData.cover}`);
        } else if (custom.cover) {
           contextParts.push(`cover=${custom.cover}`);
        }
        if (custom.mood) contextParts.push(`mood=${custom.mood}`);
        
        const contextString = contextParts.join('|');
        
        await cloudinary.api.update(public_id, {
          resource_type: 'video',
          context: contextString
        });
        fixedCount++;
      } else {
        console.log(`   -> No iTunes results found.`);
      }
      
      // Delay to respect iTunes API rate limits (~20-30 req/min)
      await new Promise(r => setTimeout(r, 2000));
    }
    
    console.log(`\n✅ Finished! Perfectly standardized ${fixedCount} songs via iTunes Apple Music database!`);

  } catch (error) {
    console.error("Fatal error:", error);
  }
};

fixAllArtistsViaItunes();
