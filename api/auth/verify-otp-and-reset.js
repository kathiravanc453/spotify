import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

// Helper to initialize Firebase Admin
function initFirebaseAdmin() {
  if (admin.apps.length === 0) {
    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      } catch (err) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT env var:", err);
      }
    }

    if (!serviceAccount) {
      const serviceAccountPath = path.join(process.cwd(), 'backend', 'firebase-service-account.json');
      if (fs.existsSync(serviceAccountPath)) {
        try {
          serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        } catch (err) {
          console.error("Failed to read local service account file:", err);
        }
      }
    }

    if (serviceAccount) {
      // Fix for escaped newlines in private key from env var
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      
      admin.initializeApp({
        credential: admin.cert(serviceAccount)
      });
      console.log("🔥 Firebase Admin SDK Initialized");
    } else {
      console.warn("⚠️ Firebase service account credentials not found!");
    }
  }
  return admin;
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

    // Initialize Firebase Admin
    initFirebaseAdmin();

    // Verify OTP from Firestore
    const db = admin.firestore();
    const docRef = db.collection('otps').doc(email.toLowerCase());
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(400).json({ error: 'No verification code was requested for this email.' });
    }

    const record = docSnap.data();
    if (Date.now() > record.expires) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }
    if (record.otp !== otp) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    // Update password in Firebase Authentication
    let userRecord;
    try {
      userRecord = await getAuth().getUserByEmail(email.toLowerCase());
    } catch (err) {
      return res.status(404).json({ error: 'No Firebase account is registered with this email address.' });
    }

    await getAuth().updateUser(userRecord.uid, {
      password: newPassword
    });

    // Delete OTP document after successful verification
    await docRef.delete();

    res.status(200).json({ success: true, message: 'Password has been natively reset in Firebase!' });
  } catch (err) {
    console.error("Vercel verify-otp-and-reset handler error:", err);
    res.status(500).json({ error: err.message });
  }
}
