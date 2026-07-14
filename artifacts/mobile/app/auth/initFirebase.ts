// Example Firebase initialization helper. This file is optional — copy firebaseConfig.example.ts
// to firebaseConfig.ts and provide your credentials before enabling.

import { setAuthService } from "./services/AuthService";
import FirebaseAuthService from "./services/FirebaseAuthService";

export async function initFirebase() {
  try {
    // dynamic import to avoid requiring firebase when not used
    // @ts-ignore: optional runtime dependency
    const { initializeApp } = await import("firebase/app");
    // @ts-ignore: optional runtime dependency
    const { getAuth, RecaptchaVerifier } = await import("firebase/auth");
    // load config (the user should create this file from example)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    // const { firebaseConfig } = require("./firebaseConfig");
    // const app = initializeApp(firebaseConfig);
    // const auth = getAuth(app);
    // Optionally setup reCAPTCHA for web here and pass app/auth into the service
    setAuthService(new FirebaseAuthService(/* app */));
    return true;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("initFirebase failed (expected if firebase not installed or config missing)", e);
    return false;
  }
}
