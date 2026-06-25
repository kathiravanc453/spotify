import crypto from 'crypto';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

function getServiceAccount() {
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (err) {
      throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT env var: " + err.message);
    }
  }

  if (!serviceAccount) {
    const serviceAccountPath = path.join(process.cwd(), 'backend', 'firebase-service-account.json');
    if (fs.existsSync(serviceAccountPath)) {
      try {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      } catch (err) {
        throw new Error("Failed to read local service account file: " + err.message);
      }
    }
  }
  
  if (serviceAccount && serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
  return serviceAccount;
}

// Generate Google OAuth2 access token for the service account natively
async function getAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const base64UrlEncode = (str) => {
    return Buffer.from(str)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const input = `${headerEncoded}.${payloadEncoded}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(input);
  const signature = sign.sign(serviceAccount.private_key, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${input}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

const readUsers = () => {
  try {
    const usersPath = path.join(process.cwd(), 'backend', 'users.json');
    if (fs.existsSync(usersPath)) {
      return JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading users file:', e);
  }
  return [];
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || process.env.VITE_GMAIL_APP_PASSWORD;
    if (!gmailAppPassword) {
      return res.status(500).json({ error: 'Gmail App Password not configured in Vercel environment variables! Please add GMAIL_APP_PASSWORD.' });
    }

    const serviceAccount = getServiceAccount();
    if (!serviceAccount) {
      return res.status(500).json({ error: 'Firebase service account credentials not configured in Vercel environment variables! Please add FIREBASE_SERVICE_ACCOUNT.' });
    }

    const token = await getAccessToken(serviceAccount);
    const projectId = serviceAccount.project_id;

    // Check if user exists in Firebase Auth (except admin@rhythmix.com)
    if (email.toLowerCase() !== 'admin@rhythmix.com') {
      const lookupUrl = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:lookup`;
      const lookupRes = await fetch(lookupUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: [email.toLowerCase()]
        })
      });

      const lookupData = await lookupRes.json();
      const userExists = lookupRes.ok && lookupData.users && lookupData.users.length > 0;

      if (!userExists) {
        // Migration logic: Check if they exist in legacy users.json
        const users = readUsers();
        const legacyUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (legacyUser) {
          console.log(`🚀 Auto-migrating legacy user ${email} to Firebase Auth...`);
          
          // Call Identity Toolkit REST API to create the user
          const createUrl = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts`;
          const createRes = await fetch(createUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              localId: legacyUser.id,
              email: legacyUser.email,
              password: legacyUser.password,
              displayName: legacyUser.name,
              photoUrl: legacyUser.avatar
            })
          });

          if (!createRes.ok) {
            const createData = await createRes.json();
            console.error("Migration failed:", createData);
            return res.status(500).json({ error: 'Failed to migrate legacy account to Firebase.' });
          }
          console.log(`✅ Legacy user ${email} migrated successfully!`);
        } else {
          return res.status(404).json({ error: 'No account is registered with this email address.' });
        }
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Firestore using REST API (Stateless OTP store for Vercel)
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/otps/${email.toLowerCase()}`;
    const writeRes = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          otp: { stringValue: otp },
          expires: { doubleValue: Date.now() + 15 * 60 * 1000 }
        }
      })
    });

    if (!writeRes.ok) {
      const writeData = await writeRes.json();
      throw new Error(`Failed to write OTP to Firestore: ${JSON.stringify(writeData)}`);
    }

    console.log(`🔑 OTP CODE FOR ${email} IS: ${otp}`);

    // Create Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'kathiravanc453@gmail.com',
        pass: gmailAppPassword
      }
    });

    // Send Email
    try {
      await transporter.sendMail({
        from: '"Rhythmix Support" <kathiravanc453@gmail.com>',
        to: email,
        replyTo: 'kathiravanc453@gmail.com',
        subject: 'Your Rhythmix Password Reset Code',
        text: `We received a request to reset your Rhythmix password. Your 6-digit verification code is: ${otp}\n\nThis code expires in 15 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border-radius: 10px; background-color: #f9f9f9;">
            <h2 style="color: #333;">Password Reset Verification</h2>
            <p>We received a request to reset your Rhythmix password. Your 6-digit verification code is:</p>
            <div style="background-color: #fff; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px solid #ddd;">
              <h1 style="margin: 0; color: #00bcd4; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p style="color: #666; font-size: 12px;">This code expires in 15 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `
      });
      console.log(`✅ Gmail SMTP successfully sent email to ${email}`);
    } catch (sendErr) {
      console.error(`❌ Gmail SMTP failed to send email:`, sendErr.message);
      return res.status(500).json({ error: 'Gmail SMTP failed to send email: ' + sendErr.message });
    }

    res.status(200).json({ success: true, message: 'OTP sent successfully!' });
  } catch (err) {
    console.error("Vercel send-otp handler error:", err);
    res.status(500).json({ error: 'Failed to send OTP: ' + err.message });
  }
}
