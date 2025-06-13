import { initializeApp, cert, getApps } from "firebase-admin/app";
import { Firestore, getFirestore } from "firebase-admin/firestore";

let db: Firestore;

if (!getApps().length) {
  initializeApp();
}

db = getFirestore();

export { db };
