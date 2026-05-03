const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    const rawData = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    // Check if it's base64 (doesn't start with {)
    if (rawData.startsWith('{')) {
      serviceAccount = JSON.parse(rawData);
    } else {
      const decoded = Buffer.from(rawData, 'base64').toString('utf-8');
      serviceAccount = JSON.parse(decoded);
    }
  } catch (e) {
    console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT. Error:', e.message);
    process.exit(1);
  }
} else {
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
  try {
    serviceAccount = require(serviceAccountPath);
  } catch (e) {
    console.error('❌ serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT env var is missing.');
    process.exit(1);
  }
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
console.log('✅ Firebase Admin connected to project:', serviceAccount.project_id);

module.exports = { admin, db };
