export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Use environment variables for Vercel, or fallback to the default admin credentials
  const validEmail = process.env.ADMIN_EMAIL || 'admin@rhythmix.com';
  const validPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (email === validEmail && password === validPassword) {
    return res.status(200).json({ success: true, user: { name: 'Admin', email } });
  }

  res.status(401).json({ error: 'Invalid credentials' });
}
