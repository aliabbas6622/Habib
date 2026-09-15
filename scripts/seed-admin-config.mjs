// One-off script: seeds admin credentials into Firestore settings/competition_config
// Run with: node scripts/seed-admin-config.mjs
import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const config = JSON.parse(readFileSync(new URL('../firebase-applet-config.json', import.meta.url), 'utf8'));

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const ADMIN_CREDENTIALS = {
  adminSecretToken: 'hurc2026_super_admin',
  portalCustomUrl: 'admin-portal-hurc-secure-auth'
};

try {
  const ref = doc(db, 'settings', 'competition_config');
  const snap = await getDoc(ref);
  const existing = snap.exists() ? snap.data() : {};
  await setDoc(ref, { ...ADMIN_CREDENTIALS }, { merge: true });
  console.log('✅ Admin credentials seeded to Firestore settings/competition_config');
  console.log('   adminSecretToken:', ADMIN_CREDENTIALS.adminSecretToken);
  console.log('   portalCustomUrl:', ADMIN_CREDENTIALS.portalCustomUrl);
  console.log('   (previous doc existed:', snap.exists() ? 'yes' : 'no' + ')');
  if (snap.exists()) {
    console.log('   previous adminSecretToken:', existing.adminSecretToken || '(none)');
  }
} catch (e) {
  console.error('❌ Failed to seed admin credentials:', e.message || e);
  console.error('   Check Firestore security rules allow writes to settings/competition_config.');
  process.exit(1);
}
process.exit(0);
