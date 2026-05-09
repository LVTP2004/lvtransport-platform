import { initializeFirebaseApp, prepareAuth, prepareFirestore, prepareRealtimeDatabase } from "@lvtransport/realtime";

const app = initializeFirebaseApp({
  runtime: "web",
  appName: "lvtransport-web",
  useEmulators: import.meta.env.VITE_FIREBASE_USE_EMULATORS === "true",
  env: {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
  }
});

export const webFirebaseArchitecture = {
  app,
  firestore: prepareFirestore(app),
  realtimeDb: prepareRealtimeDatabase(app),
  auth: prepareAuth(app)
};
