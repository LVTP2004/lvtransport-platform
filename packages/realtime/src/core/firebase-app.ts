import type { FirebaseAppConfig } from "../config/env";

export interface FirebaseAppHandle {
  name: string;
  projectId: string;
  runtime: FirebaseAppConfig["runtime"];
  useEmulators: boolean;
}

export function initializeFirebaseApp(config: FirebaseAppConfig): FirebaseAppHandle {
  return {
    name: config.appName,
    projectId: config.env.projectId,
    runtime: config.runtime,
    useEmulators: config.useEmulators
  };
}
