import fetch from 'node-fetch';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const apiKey = env.split('\n').find(l => l.startsWith('VITE_FIREBASE_API_KEY=')).split('=')[1].trim();

async function testReset() {
  const email = process.argv[2] || 'test@example.com';
  console.log(`Testing password reset for: ${email}`);
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestType: "PASSWORD_RESET", email })
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

testReset();
