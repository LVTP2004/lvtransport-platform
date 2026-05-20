import type { FirebaseAppHandle } from "../core/firebase-app.js";

export interface AuthPreparation {
  app: FirebaseAppHandle;
  strategy: "firebase-auth";
  mode: "placeholder";
}

export function prepareAuth(app: FirebaseAppHandle): AuthPreparation {
  return { app, strategy: "firebase-auth", mode: "placeholder" };
}
