import nodemailer from 'nodemailer';
import admin from 'firebase-admin';

export default async function handler(req, res) {
  res.status(200).json({
    nodemailer: typeof nodemailer,
    admin: typeof admin,
    envKeys: Object.keys(process.env).filter(k => k.includes('GMAIL') || k.includes('FIREBASE'))
  });
}
