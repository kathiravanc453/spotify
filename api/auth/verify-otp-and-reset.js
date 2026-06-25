import crypto from 'crypto';
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const serviceAccount = getServiceAccount();
    if (!serviceAccount) {
      return res.status(500).json({ error: 'Firebase credentials not found.' });
    }

    const token = await getAccessToken(serviceAccount);
    const projectId = serviceAccount.project_id;

    // 1. Fetch OTP document from Firestore REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/otps/${email.toLowerCase()}`;
    const getRes = await fetch(firestoreUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!getRes.ok) {
      if (getRes.status === 404) {
        return res.status(400).json({ error: 'No verification code was requested for this email.' });
      }
      const errData = await getRes.json();
      throw new Error(`Failed to fetch OTP from Firestore: ${JSON.stringify(errData)}`);
    }

    const docData = await getRes.json();
    const otpValue = docData.fields && docData.fields.otp ? docData.fields.otp.stringValue : null;
    const expiresValue = docData.fields && docData.fields.expires ? Number(docData.fields.expires.doubleValue || docData.fields.expires.integerValue) : null;

    if (!otpValue || !expiresValue) {
      return res.status(400).json({ error: 'Verification data is corrupted. Please request a new code.' });
    }

    if (Date.now() > expiresValue) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    if (otpValue !== otp) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    // 2. Fetch the user's uid (localId) from Identity Toolkit by email (needed to update password)
    let localId = null;
    if (email.toLowerCase() === 'admin@rhythmix.com') {
      localId = 'admin_uid'; // Dummy uid or local ID if needed, but normally admin uses email/password config.
    } else {
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

      if (!lookupRes.ok) {
        const lookupErr = await lookupRes.json();
        throw new Error(`User lookup failed: ${JSON.stringify(lookupErr)}`);
      }

      const lookupData = await lookupRes.json();
      if (!lookupData.users || lookupData.users.length === 0) {
        return res.status(404).json({ error: 'No Firebase account is registered with this email address.' });
      }
      localId = lookupData.users[0].localId;
    }

    // 3. Force update their password directly in Google Identity Toolkit
    if (localId && email.toLowerCase() !== 'admin@rhythmix.com') {
      const updateUrl = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:update`;
      const updateRes = await fetch(updateUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          localId: localId,
          password: newPassword
        })
      });

      if (!updateRes.ok) {
        const updateErr = await updateRes.json();
        throw new Error(`Password update failed: ${JSON.stringify(updateErr)}`);
      }
    }

    // 4. Delete the OTP document from Firestore
    await fetch(firestoreUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    res.status(200).json({ success: true, message: 'Password has been natively reset in Firebase!' });
  } catch (err) {
    console.error("Vercel verify-otp-and-reset handler error:", err);
    res.status(500).json({ error: err.message });
  }
}
