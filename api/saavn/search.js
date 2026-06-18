import forge from 'node-forge';

function decryptSaavnUrl(encryptedUrl) {
  try {
    const key = '38346591';
    const iv = '00000000';
    const encrypted = forge.util.decode64(encryptedUrl);
    const decipher = forge.cipher.createDecipher('DES-ECB', forge.util.createBuffer(key));
    decipher.start({ iv: forge.util.createBuffer(iv) });
    decipher.update(forge.util.createBuffer(encrypted));
    decipher.finish();
    return decipher.output.getBytes().replace('_96', '_320'); // upgrade to 320kbps
  } catch(e) {
    return null;
  }
}

export default async function handler(req, res) {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });

    // Directly query the official JioSaavn API with Tamil language priority and a larger limit (150)
    const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&q=${encodeURIComponent(q)}&p=1&n=150&_format=json&_marker=0&ctx=web6dot0`;
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Cookie': 'L=tamil;' } });
    const data = await response.json();

    if (!data || !data.results) return res.status(200).json([]);

    const formattedResults = data.results.map(track => {
      let coverUrl = track.image ? track.image.replace('150x150', '500x500') : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500';
      const streamUrl = track.encrypted_media_url ? decryptSaavnUrl(track.encrypted_media_url) : null;
      const cleanTitle = (track.song || 'Unknown Title').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

      return {
        id: `saavn_${track.id}`,
        title: cleanTitle,
        artist: track.primary_artists || 'Unknown Artist',
        album: track.album || 'Singles',
        cover: coverUrl,
        src: streamUrl,
        duration: parseInt(track.duration, 10) || 0,
        isSaavn: true,
        mood: 'Global'
      };
    }).filter(s => s.src);

    res.status(200).json(formattedResults);
  } catch (err) {
    console.error('Saavn API Error:', err.message);
    res.status(500).json({ error: 'Failed to search global music' });
  }
}
