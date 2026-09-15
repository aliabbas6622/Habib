// Re-syncs default settings (incl. corrected countdown date) to Firestore
import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const config = JSON.parse(readFileSync(new URL('../firebase-applet-config.json', import.meta.url), 'utf8'));

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const UPDATES = {
  countdownTargetDate: '2026-12-28T09:00:00'
};

try {
  await setDoc(doc(db, 'settings', 'competition_config'), UPDATES, { merge: true });
  console.log('✅ Settings updated in Firestore:', UPDATES);
} catch (e) {
  console.error('❌ Failed:', e.message || e);
  process.exit(1);
}
process.exit(0);
