Firebase Auth integration (phone auth)

This project ships with a `MockAuthService` for development. A scaffold `FirebaseAuthService` exists at `app/auth/services/FirebaseAuthService.ts`.

Steps to enable Firebase Phone Auth (web or native):

1. Install Firebase in the mobile workspace:

   pnpm --filter mobile add firebase

2. Add your Firebase config (web/app) somewhere safe. Example (do NOT commit credentials):

   // app/auth/firebaseConfig.ts (example)
   export const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "...",
   };

3. Initialize Firebase and set the auth service at app startup (root layout or a dedicated init file). Example:

   // app/auth/initFirebase.ts (example)
   import { initializeApp } from 'firebase/app';
   import { getAuth, RecaptchaVerifier } from 'firebase/auth';
   import FirebaseAuthService from './services/FirebaseAuthService';
   import { setAuthService } from './services/AuthService';
   import { firebaseConfig } from './firebaseConfig';

   export function initFirebase() {
     const app = initializeApp(firebaseConfig);
     const auth = getAuth(app);

     // For web: create a reCAPTCHA verifier attached to a div
     // window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
     //   size: 'invisible'
     // }, auth);

     // Provide the firebase app instance to the scaffolded service
     setAuthService(new FirebaseAuthService(app));
   }

4. Hook `initFirebase()` into your app early (for example inside `RootLayout` before rendering `RootLayoutNav`).

5. Implement the platform-specific pieces in `FirebaseAuthService.sendOtp` and `verifyOtp`:
   - Web: use `signInWithPhoneNumber(auth, phone, window.recaptchaVerifier)` and store the returned `confirmationResult` on the service instance.
   - Native (React Native): use `firebase/auth` native methods or `react-native-firebase` phone auth flows.

6. Test thoroughly on your target platforms (web requires reCAPTCHA). If you run into typescript errors around `firebase` imports, ensure `firebase` is installed in the `mobile` workspace.

Security note: Keep production Firebase credentials secret (use environment variables or secrets management). Do not enable the toggle unless Firebase is configured.

Toggle: `app/auth/useFirebaseAuth.ts` exposes `USE_FIREBASE_AUTH` which is `false` by default. Set it to `true` after you finish steps above to let the app attempt to wire `FirebaseAuthService` at runtime.
