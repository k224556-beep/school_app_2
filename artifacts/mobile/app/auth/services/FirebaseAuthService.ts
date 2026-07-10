import { AuthService } from "./AuthService";
import { OTPResponse } from "../models";

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
  // you can accept dependencies (like firebase app) in the constructor
  constructor(/* firebaseApp?: any */) {}

  async sendOtp(phone: string): Promise<OTPResponse> {
    // TODO: implement using Firebase phone auth (recaptcha verifier for web or native APIs)
    return { success: false, message: "Firebase sendOtp not implemented in scaffold." };
  }

  async verifyOtp(phone: string, otp: string): Promise<OTPResponse> {
    // TODO: verify otp with Firebase and return success:false on failure
    return { success: false, message: "Firebase verifyOtp not implemented in scaffold." };
  }
}

export default FirebaseAuthService;
