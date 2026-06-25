import nodemailer from 'nodemailer';
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

    // Initialize Firebase Admin
    initFirebaseAdmin();

    // Check if user exists in Firebase Auth
    if (email.toLowerCase() !== 'admin@rhythmix.com') {
      try {
        await getAuth().getUserByEmail(email.toLowerCase());
      } catch (err) {
        // Migration logic: Check if they exist in legacy users.json
        const users = readUsers();
        const legacyUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (legacyUser) {
          console.log(`🚀 Auto-migrating legacy user ${email} to Firebase Auth...`);
          try {
            await getAuth().createUser({
              uid: legacyUser.id,
              email: legacyUser.email,
              password: legacyUser.password,
              displayName: legacyUser.name,
              photoURL: legacyUser.avatar
            });
            console.log(`✅ Legacy user ${email} migrated successfully!`);
          } catch (migrateErr) {
            console.error("Migration failed:", migrateErr);
            return res.status(500).json({ error: 'Failed to migrate legacy account to Firebase.' });
          }
        } else {
          return res.status(404).json({ error: 'No account is registered with this email address.' });
        }
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Firestore (Stateless OTP store for Vercel)
    const db = admin.firestore();
    await db.collection('otps').doc(email.toLowerCase()).set({
      otp,
      expires: Date.now() + 15 * 60 * 1000
    });

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
