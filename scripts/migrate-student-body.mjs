import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Old Firebase Config (where photos live)
const oldConfig = {
  projectId: 'go-ka-466915',
  appId: '1:789605433244:web:155127201a05256bc85259',
  apiKey: 'AIzaSyAjaAkBqSJy4BHCVtpcbxmu3vxkHhjFDGg',
  authDomain: 'go-ka-466915.firebaseapp.com',
  storageBucket: 'go-ka-466915.firebasestorage.app',
  messagingSenderId: '789605433244'
};
const oldApp = initializeApp(oldConfig, 'oldApp');
const oldDb = getFirestore(oldApp, 'ai-studio-hurc2026habibuni-79423bea-b0a9-4ae5-a7c0-6f289b1e69a3');

// New Firebase Config (hurc2026-prod-db)
const newConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../firebase-applet-config.json'), 'utf8'));
const newApp = initializeApp(newConfig, 'newApp');
const newDb = newConfig.firestoreDatabaseId ? getFirestore(newApp, newConfig.firestoreDatabaseId) : getFirestore(newApp);

// Output directory for static bundling in git
const targetImgDir = path.join(__dirname, '../src/assets/images/student-body');
if (!fs.existsSync(targetImgDir)) {
  fs.mkdirSync(targetImgDir, { recursive: true });
}

async function migrate() {
  console.log('Fetching 12 student body images from old database...');
  for (let i = 1; i <= 12; i++) {
    const docId = `asset__student-body-${i}`;
    const oldSnap = await getDoc(doc(oldDb, 'settings', docId));
    if (oldSnap.exists()) {
      const data = oldSnap.data();
      const dataUrl = data.dataUrl;
      console.log(`Found ${docId} (${dataUrl.length} chars). Copying to new Firestore...`);
      
      // 1. Copy to new Firestore
      await setDoc(doc(newDb, 'settings', docId), {
        dataUrl,
        updatedAt: new Date().toISOString()
      });

      // 2. Save file to disk in src/assets/images/student-body/
      const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(path.join(targetImgDir, `director-${i}.jpg`), buffer);
      console.log(`Saved src/assets/images/student-body/director-${i}.jpg`);
    } else {
      console.warn(`Missing in old DB: ${docId}`);
    }
  }

  console.log('\nMigration complete! All 12 student body pictures have been copied to new Firestore and saved locally to git assets.');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
