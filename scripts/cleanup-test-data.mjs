// Removes the E2E test registration created during verification
import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocs, collection, query, where, deleteDoc, getDoc } from 'firebase/firestore';

const config = JSON.parse(readFileSync(new URL('../firebase-applet-config.json', import.meta.url), 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const snap = await getDocs(collection(db, 'registrations'));
let deleted = 0;
for (const d of snap.docs) {
  const data = d.data();
  const isTest = (data.teamName === 'E2E Test Squad') || (data.id || '').includes('TEST-VERIFY') || (data.leader?.email === 'e2etest-hurc@mailinator.com');
  if (isTest) {
    await deleteDoc(doc(db, 'registrations', d.id));
    deleted++;
    console.log('deleted:', d.id);
  }
}
console.log('done, deleted', deleted, 'test docs');
process.exit(0);
