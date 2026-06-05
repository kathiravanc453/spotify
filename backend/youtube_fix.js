import { v2 as cloudinary } from 'cloudinary';
import yts from 'yt-search';

cloudinary.config({
  cloud_name: 'dm1cwbbfg',
  api_key: '969989851682274',
  api_secret: '6N9cJ9fhanGad1sj--3gssD-vCk'
});

const cleanSearchTerm = (str) => {
  return str.replace(/\(.*?\)/g, '')
            .replace(/\[.*?\]/g, '')
            .replace(/_|-/g, ' ')
            .replace(/MassTamilan\.io/g, '')
            .replace(/MassTamilan\.com/g, '')
            .replace(/MassTamilan\.dev/g, '')
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

// Extracts likely artist/movie name from YouTube title
const extractArtistFromYoutube = (title) => {
  // Common separators in Indian music videos
  const parts = title.split(/\||-|–|:/).map(p => p.trim());
  if (parts.length > 1) {
    // Return the second part (usually the artist or movie)
    let artist = parts[1].replace(/video/gi, '').replace(/song/gi, '').trim();
    if (artist.length > 2) return artist;
    if (parts.length > 2) return parts[2].trim();
  }
  // Fallback to channel name or just the whole title if too short
  return null;
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
        continue; // Already fixed by iTunes/Deezer
      }

      let rawName = public_id.split('/').pop().split('.')[0];
      if (/_[a-zA-Z0-9]{6}$/.test(rawName)) {
        rawName = rawName.substring(0, rawName.length - 7);
      }
      let name = cleanSearchTerm(rawName.replace(/_/g, ' '));
      
      console.log(`[${i+1}/${allCloudinarySongs.length}] YouTube Searching for: "${name}"...`);
      
      try {
        const r = await yts(name + ' tamil song');
        const videos = r.videos;
        if (videos && videos.length > 0) {
          const firstVideo = videos[0];
          let artist = extractArtistFromYoutube(firstVideo.title);
          
          if (!artist) artist = firstVideo.author.name.replace(/VEVO/i, '');
          
          if (artist) {
            console.log(`   -> Found via YouTube: ${artist} (from: ${firstVideo.title})`);
            
            const contextParts = [];
            if (custom.cover) contextParts.push(`cover=${custom.cover}`);
            if (custom.title) contextParts.push(`title=${custom.title}`);
            if (custom.mood) contextParts.push(`mood=${custom.mood}`);
            contextParts.push(`artist=${artist}`);
            if (custom.album) contextParts.push(`album=${custom.album}`);
            
            const contextString = contextParts.join('|');
            
            await cloudinary.api.update(public_id, {
              resource_type: 'video',
              context: contextString
            });
            fixedCount++;
          } else {
             console.log(`   -> No valid artist string parsed.`);
          }
        } else {
          console.log(`   -> No YouTube results.`);
        }
      } catch (err) {
        console.log(`   -> YouTube Search Failed:`, err.message);
      }
      
      // Mandatory delay
      await new Promise(r => setTimeout(r, 600));
    }
    
    console.log(`\n✅ Finished! Fixed ${fixedCount} remaining songs permanently via YouTube!`);

  } catch (error) {
    console.error("Fatal error:", error);
  }
};

fixArtists();
