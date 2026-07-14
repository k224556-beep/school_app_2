import { AuthService } from "./AuthService";
import { OTPResponse } from "../models";

// Note: This is a helpful scaffold for wiring Firebase Phone Auth.
// It attempts to dynamically import Firebase SDK at runtime. To enable production
// Firebase Phone Auth you must:
// 1. `pnpm --filter mobile add firebase` (or `yarn add firebase`)
// 2. Initialize Firebase in your app (create a firebaseApp and call setAuthService(new FirebaseAuthService(firebaseApp))).
// 3. For web, configure reCAPTCHA (RecaptchaVerifier) before calling `signInWithPhoneNumber`.
// This implementation intentionally keeps the methods simple and throws clear errors when the SDK isn't present.

/**
 * Scaffold for Firebase phone auth integration.
 *
 * This is a non-working scaffold showing where to plug Firebase logic.
 * To enable:
 * - install `firebase` and configure it for web in Expo (or use native Firebase SDKs)
 * - initialize Firebase in the app and use the firebase.auth().signInWithPhoneNumber flow
 * - replace the exported instance via `setAuthService(new FirebaseAuthService(...))`
 */
export class FirebaseAuthService implements AuthService {
  firebaseApp: any | null;
  // store confirmationResult when using web signInWithPhoneNumber flow
  confirmationResult: any | null = null;

  constructor(firebaseApp?: any) {
    this.firebaseApp = firebaseApp ?? null;
  }

  private async ensureFirebase() {
    try {
      // dynamic import to avoid hard dependency when not used
      // @ts-ignore: optional runtime dependency
      const auth = await import("firebase/auth");
      return auth;
    } catch (err) {
      throw new Error("firebase/auth not found. Install firebase and initialize app before enabling FirebaseAuthService.");
    }
  }

  async sendOtp(phone: string): Promise<OTPResponse> {
    try {
      // Implement web signInWithPhoneNumber flow. Requires firebase to be installed and initialized.
      // This method will create a RecaptchaVerifier on window.recaptchaVerifier using element id 'recaptcha-container'.
      // Caller must render a div with id 'recaptcha-container' in the login/otp screen when using web.
      // @ts-ignore
      const { getAuth, RecaptchaVerifier, signInWithPhoneNumber } = await import("firebase/auth");
      const auth = getAuth(this.firebaseApp);
      // Ensure we are on web and have window
      // @ts-ignore
      const win: any = typeof window !== "undefined" ? window : null;
      if (!win) {
        return { success: false, message: "Firebase phone auth is currently implemented for web only in this scaffold." };
      }
      if (!win.recaptchaVerifier) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        win.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', { size: 'invisible' }, auth);
      }
      const verifier = win.recaptchaVerifier;
      // @ts-ignore
      this.confirmationResult = await signInWithPhoneNumber(auth, phone, verifier);
      return { success: true, message: 'OTP sent' };
    } catch (err: any) {
      return { success: false, message: err?.message ?? String(err) };
    }
  }

  async verifyOtp(phone: string, otp: string): Promise<OTPResponse> {
    try {
      if (this.confirmationResult && typeof this.confirmationResult.confirm === "function") {
        await this.confirmationResult.confirm(otp);
        return { success: true };
      }
      return { success: false, message: "No confirmation result available. Call sendOtp first." };
    } catch (err: any) {
      return { success: false, message: err?.message ?? String(err) };
    }
  }
}

export default FirebaseAuthService;
