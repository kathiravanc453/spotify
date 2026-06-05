import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return res.status(200).json({ success: true, message: 'Sync disabled on Vercel to preserve limits. Local updates only.' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filePath = path.join(process.cwd(), 'backend', 'songs.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const songs = JSON.parse(fileContents);

    // Disable aggressive caching so the client always gets fresh metadata
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.status(200).json(songs);
  } catch (error) {
    console.error('Failed to read local songs.json:', error);
    res.status(500).json({ error: 'Failed to load songs database.' });
  }
}
