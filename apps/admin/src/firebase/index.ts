import { initializeFirebaseApp, prepareAuth, prepareFirestore, prepareRealtimeDatabase, adminMonitoringEventArchitecture } from "@lvtransport/realtime";

const app = initializeFirebaseApp({
  runtime: "admin",
  appName: "lvtransport-admin",
  useEmulators: import.meta.env.VITE_FIREBASE_USE_EMULATORS === "true",
  env: {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
  }
});

export const adminFirebaseArchitecture = {
  app,
  firestore: prepareFirestore(app),
  realtimeDb: prepareRealtimeDatabase(app),
  auth: prepareAuth(app),
  monitoring: adminMonitoringEventArchitecture
};
