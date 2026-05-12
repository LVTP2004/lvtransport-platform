import type { FirebaseAppHandle } from "../core/firebase-app.js";
import { realtimeDbPaths } from "./paths.js";

export interface RealtimeDbPreparation {
  app: FirebaseAppHandle;
  paths: typeof realtimeDbPaths;
}

export function prepareRealtimeDatabase(app: FirebaseAppHandle): RealtimeDbPreparation {
  return { app, paths: realtimeDbPaths };
}
