import { initializeFirebaseApp, prepareAuth, prepareFirestore, prepareRealtimeDatabase, driverLiveStatusArchitecture } from "@lvtransport/realtime";

const app = initializeFirebaseApp({
  runtime: "driver",
  appName: "lvtransport-driver",
  useEmulators: import.meta.env.VITE_FIREBASE_USE_EMULATORS === "true",
  env: {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
  }
});

export const driverFirebaseArchitecture = {
  app,
  firestore: prepareFirestore(app),
  realtimeDb: prepareRealtimeDatabase(app),
  auth: prepareAuth(app),
  liveStatus: driverLiveStatusArchitecture
};
