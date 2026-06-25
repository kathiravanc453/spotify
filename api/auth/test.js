import nodemailer from 'nodemailer';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

function initFirebaseAdmin() {
  if (admin.apps.length === 0) {
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

    if (serviceAccount) {
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      admin.initializeApp({
        credential: admin.cert(serviceAccount)
      });
    } else {
      throw new Error("Firebase service account credentials not found in env or local file!");
    }
  }
  return admin;
}

export default async function handler(req, res) {
  try {
    // 1. Test Firebase Init
    initFirebaseAdmin();
    
    // 2. Test Firebase Auth
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail('kathiravanc453@gmail.com');
    } catch (authErr) {
      userRecord = { error: authErr.message };
    }

    // 3. Test Nodemailer init
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD || process.env.VITE_GMAIL_APP_PASSWORD;
    let transportSuccess = false;
    if (gmailAppPassword) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'kathiravanc453@gmail.com',
          pass: gmailAppPassword
        }
      });
      transportSuccess = typeof transporter.sendMail === 'function';
    }

    res.status(200).json({
      success: true,
      firebaseInitialized: admin.apps.length > 0,
      userRecord,
      transportSuccess,
      gmailAppPasswordLength: gmailAppPassword ? gmailAppPassword.length : 0
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
}
