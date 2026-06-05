import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dm1cwbbfg',
  api_key: '969989851682274',
  api_secret: '6N9cJ9fhanGad1sj--3gssD-vCk'
});

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
  const segments = folderPath.split('/').filter(Boolean);
  const folder = segments.length ? segments[segments.length - 1] : folderPath;
  const clean = folder.toLowerCase().replace(/[_-]/g, ' ').trim();

  if (clean.includes('love')) return 'Love';
  if (clean.includes('romance') || clean.includes('romantic')) return 'Romance';
  if (clean.includes('melody') || clean.includes('melodies')) return 'Melody';
  if (clean.includes('vibe')) return 'Vibes';
  if (clean.includes('energy') || clean.includes('boost')) return 'Energy Boost';

  return folder.charAt(0).toUpperCase() + folder.slice(1);
};

const cleanSearchTerm = (title) => {
  let term = title.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  const patternsToRemove = [
    /high quality/gi, /audio song/gi, /surround/gi, /bass boosted/gi,
    /bluray/gi, /blu-ray/gi, /dolby/gi, /digital/gi, /5\.1/gi, /ultra hd/gi,
    /4k/gi, /1080p/gi, /720p/gi, /mp3/gi, /m4a/gi, /128k/gi, /320k/gi,
    /official/gi, /video/gi, /lyric/gi, /remastered/gi, /hq/gi
  ];
  patternsToRemove.forEach(pattern => {
    term = term.replace(pattern, '');
  });
  term = term.replace(/\s{2,}/g, ' ').trim();
  term = term.replace(/^[-\s]+|[-\s]+$/g, '');
  
  // Strip Cloudinary random 6-character suffix (e.g. mb5woo) if it exists at the end of the filename
  term = term.replace(/\s+[a-z0-9]{6}$/i, '').trim();
  
  return term || title;
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Return success to make the Admin Panel upload UI happy, but don't save to disk
    return res.status(200).json({ success: true, message: 'Sync triggered successfully. Songs will be updated from Cloudinary on next load.' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await cloudinary.search
      .expression('resource_type:video')
      .with_field('tags')
      .with_field('context')
      .max_results(500)
      .execute();

    const cloudSongs = result.resources
      .filter(r => r.format === 'mp3' || r.format === 'm4a')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const mappedSongs = cloudSongs.map(cloud => {
      let folderMood = null;
      let rawFolder = cloud.asset_folder || cloud.folder;
      
      if (!rawFolder && cloud.public_id && cloud.public_id.includes('/')) {
        const parts = cloud.public_id.split('/');
        parts.pop();
        rawFolder = parts.join('/');
      } 
      
      let cover = 'https://images.unsplash.com/photo-1493225457124-a1a2a5d5facf?w=500';
      let album = 'Cloudinary Singles';

      try {
        if (cloud.context && cloud.context.custom) {
          if (cloud.context.custom.mood) folderMood = cloud.context.custom.mood;
          if (cloud.context.custom.cover) cover = cloud.context.custom.cover;
          if (cloud.context.custom.artist) artist = cloud.context.custom.artist;
          if (cloud.context.custom.title) title = cloud.context.custom.title;
          if (cloud.context.custom.album) album = cloud.context.custom.album;
        }
      } catch (e) {}

      let mood = folderMood || getMoodFromFolder(rawFolder);
      if (title === cloud.display_name || title === cloud.filename) {
        title = cleanSearchTerm(title);
        if (title.includes('-') && artist === 'Unknown Artist') {
          const parts = title.split('-');
          if (parts.length >= 2) {
            artist = parts[0].trim();
            title = parts.slice(1).join('-').trim();
          }
        }
      }

      return {
        id: getStableId(cloud.secure_url),
        title,
        artist,
        src: cloud.secure_url,
        cover,
        fallbackCover: 'https://images.unsplash.com/photo-1493225457124-a1a2a5d5facf?w=500',
        album,
        mood,
        genre: 'Tamil',
        uploadedAt: cloud.created_at,
        duration: cloud.duration || 0
      };
    });

    // Disable aggressive caching so the client always gets fresh metadata
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.status(200).json(mappedSongs);
  } catch (error) {
    console.error('Cloudinary fetch error:', error);
    res.status(500).json({ error: error.message });
  }
}
