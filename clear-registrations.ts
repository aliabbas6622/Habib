import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
// Use custom Firestore database ID if specified
const db = config.firestoreDatabaseId
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

async function clearRegistrations() {
  console.log(`Connecting to Firestore database: ${config.firestoreDatabaseId || '(default)'}`);
  const registrationsRef = collection(db, 'registrations');
  const snapshot = await getDocs(registrationsRef);
  if (snapshot.empty) {
    console.log('No registrations found in Firestore.');
    process.exit(0);
  }
  let count = 0;
  for (const docSnap of snapshot.docs) {
    await deleteDoc(doc(db, 'registrations', docSnap.id));
    count++;
    console.log(`  Deleted: ${docSnap.id}`);
  }
  console.log(`\nDone. Deleted ${count} registration(s).`);
  process.exit(0);
}

clearRegistrations().catch((e) => { console.error(e); process.exit(1); });
