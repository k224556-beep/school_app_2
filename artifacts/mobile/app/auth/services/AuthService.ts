import { OTPResponse } from "../models";

export interface AuthService {
  sendOtp(phone: string): Promise<OTPResponse>;
  verifyOtp(phone: string, otp: string): Promise<OTPResponse>;
}

// Mock implementation where OTP is always 123456
export class MockAuthService implements AuthService {
  async sendOtp(phone: string) {
    // simulate network
    await new Promise((r) => setTimeout(r, 500));
    return { success: true, message: "OTP sent (mock)" } as OTPResponse;
  }

  async verifyOtp(phone: string, otp: string) {
    await new Promise((r) => setTimeout(r, 400));
    if (otp === "123456") return { success: true };
    return { success: false, message: "Invalid OTP" };
  }
}

// Default service instance. You can swap this at runtime with `setAuthService()`
export let authService: AuthService = new MockAuthService();

export function setAuthService(svc: AuthService) {
  authService = svc;
}
