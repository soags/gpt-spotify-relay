// src/cache/firestore.ts

import { initializeApp, getApps } from "firebase-admin/app";
import { Firestore, getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp();
}

const db: Firestore = getFirestore();

export { db };
