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
  try {
    const serviceAccount = getServiceAccount();
    if (!serviceAccount) {
      throw new Error("No service account credentials found!");
    }

    // 1. Get Access Token
    const token = await getAccessToken(serviceAccount);
    const projectId = serviceAccount.project_id;

    // 2. Try Firestore write via REST API
    const testDocName = 'test_email_check';
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/otps/${testDocName}`;
    
    console.log(`Firestore URL: ${firestoreUrl}`);
    const writeRes = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          otp: { stringValue: '999999' },
          expires: { doubleValue: Date.now() + 60000 }
        }
      })
    });

    const writeData = await writeRes.json();

    // 3. Try Identity Toolkit check via REST API
    // Endpoint to lookup user details by email
    const lookupUrl = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:lookup`;
    const lookupRes = await fetch(lookupUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: ['kathiravanc453@gmail.com']
      })
    });
    
    const lookupData = await lookupRes.json();

    res.status(200).json({
      success: true,
      hasToken: typeof token === 'string' && token.length > 0,
      firestoreWrite: {
        status: writeRes.status,
        data: writeData
      },
      identityLookup: {
        status: lookupRes.status,
        data: lookupData
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
}
