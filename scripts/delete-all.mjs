import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocs, collection, deleteDoc } from 'firebase/firestore';

const config = JSON.parse(readFileSync(new URL('../firebase-applet-config.json', import.meta.url), 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function deleteAll() {
  const snap = await getDocs(collection(db, 'registrations'));
  let deleted = 0;
  for (const d of snap.docs) {
    await deleteDoc(doc(db, 'registrations', d.id));
    deleted++;
  }
  console.log('done, deleted', deleted, 'docs');
  process.exit(0);
}

deleteAll();
