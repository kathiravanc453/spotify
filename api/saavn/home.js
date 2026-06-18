export default async function handler(req, res) {
  try {
    const url = `https://www.jiosaavn.com/api.php?__call=webapi.getLaunchData&api_version=4&_format=json&_marker=0&ctx=web6dot0&languages=tamil`;
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Cookie': 'L=tamil;' } });
    const data = await response.json();

    const formatItem = (item) => ({
      id: item.id,
      title: (item.title || 'Unknown').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
      subtitle: (item.subtitle || item.header_desc || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
      type: item.type,
      cover: item.image ? item.image.replace('150x150', '500x500') : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500',
    });

    res.status(200).json({
      trending: (data.new_trending || []).map(formatItem),
      playlists: (data.top_playlists || []).map(formatItem),
      albums: (data.new_albums || []).map(formatItem)
    });
  } catch (err) {
    console.error('Saavn Home API Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch global home data' });
  }
}
