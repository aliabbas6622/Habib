import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  console.log('Testing Firestore connection to database:', config.firestoreDatabaseId);
  try {
    const docRef = doc(db, 'settings', 'competition_config');
    const snap = await getDoc(docRef);
    console.log('Read success! Exists:', snap.exists());
    
    // Test write
    const testDoc = doc(db, 'registrations', 'test-read-write');
    await setDoc(testDoc, { test: true });
    console.log('Write success!');
    process.exit(0);
  } catch (err) {
    console.error('Firestore Error:', err.message);
    process.exit(1);
  }
}

test();
