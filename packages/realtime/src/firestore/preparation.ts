import type { FirebaseAppHandle } from "../core/firebase-app";
import { firestoreCollections } from "./collections";

export interface FirestorePreparation {
  app: FirebaseAppHandle;
  collections: typeof firestoreCollections;
}

export function prepareFirestore(app: FirebaseAppHandle): FirestorePreparation {
  return { app, collections: firestoreCollections };
}
