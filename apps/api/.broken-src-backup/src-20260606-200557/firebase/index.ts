import {
  FirebaseWebsocketBridge,
  bookingRealtimeArchitecture,
  customerTrackingStateArchitecture,
  initializeFirebaseApp,
  notificationArchitecture,
  prepareAuth,
  prepareFirestore,
  prepareRealtimeDatabase,
  realtimeSynchronizationArchitecture,
  type RealtimeTransport
} from "@lvtransport/realtime";

const app = initializeFirebaseApp({
  runtime: "api",
  appName: "lvtransport-api",
  useEmulators: process.env.FIREBASE_USE_EMULATORS === "true",
  env: {
    projectId: process.env.FIREBASE_PROJECT_ID ?? "",
    databaseURL: process.env.FIREBASE_DATABASE_URL
  }
});

export const createApiRealtimeArchitecture = (firebaseTransport: RealtimeTransport, websocketTransport: RealtimeTransport) => ({
  app,
  firestore: prepareFirestore(app),
  realtimeDb: prepareRealtimeDatabase(app),
  auth: prepareAuth(app),
  sync: realtimeSynchronizationArchitecture,
  booking: bookingRealtimeArchitecture,
  tracking: customerTrackingStateArchitecture,
  notifications: notificationArchitecture,
  bridge: new FirebaseWebsocketBridge({ firebase: firebaseTransport, websocket: websocketTransport })
});
