export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Check if the URL is /api/stats/download
    if (req.url && req.url.includes('/download')) {
      return res.status(200).json({ success: true, downloads: 0 });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // GET /api/stats
  res.status(200).json({ downloads: 0 });
}
