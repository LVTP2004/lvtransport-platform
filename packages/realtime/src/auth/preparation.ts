import type { FirebaseAppHandle } from "../core/firebase-app";

export interface AuthPreparation {
  app: FirebaseAppHandle;
  strategy: "firebase-auth";
  mode: "placeholder";
}

export function prepareAuth(app: FirebaseAppHandle): AuthPreparation {
  return { app, strategy: "firebase-auth", mode: "placeholder" };
}
