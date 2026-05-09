export type FirebaseRuntime = "web" | "admin" | "driver" | "api";

export interface FirebaseEnvConfig {
  apiKey?: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  databaseURL?: string;
  measurementId?: string;
  emulatorHost?: string;
  emulatorAuthPort?: string;
  emulatorFirestorePort?: string;
  emulatorDatabasePort?: string;
}

export interface FirebaseAppConfig {
  runtime: FirebaseRuntime;
  appName: string;
  useEmulators: boolean;
  env: FirebaseEnvConfig;
}

export const firebaseEnvVarMap: Record<FirebaseRuntime, ReadonlyArray<string>> = {
  web: ["VITE_FIREBASE_PROJECT_ID", "VITE_FIREBASE_DATABASE_URL"],
  admin: ["VITE_FIREBASE_PROJECT_ID", "VITE_FIREBASE_DATABASE_URL"],
  driver: ["VITE_FIREBASE_PROJECT_ID", "VITE_FIREBASE_DATABASE_URL"],
  api: ["FIREBASE_PROJECT_ID", "FIREBASE_DATABASE_URL"]
};
