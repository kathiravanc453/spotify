import admin from 'firebase-admin';

export default async function handler(req, res) {
  res.status(200).json({
    adminType: typeof admin,
    adminKeys: admin ? Object.keys(admin) : [],
    adminKeysProto: admin ? Object.keys(Object.getPrototypeOf(admin)) : []
  });
}
