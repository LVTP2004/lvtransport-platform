import type { FirebaseAppHandle } from "../core/firebase-app";
import { realtimeDbPaths } from "./paths";

export interface RealtimeDbPreparation {
  app: FirebaseAppHandle;
  paths: typeof realtimeDbPaths;
}

export function prepareRealtimeDatabase(app: FirebaseAppHandle): RealtimeDbPreparation {
  return { app, paths: realtimeDbPaths };
}
