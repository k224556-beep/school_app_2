export type Role = "Admin" | "Teacher" | "Parent";

export interface AppUser {
  phone: string; // normalized e.g. 03001234567
  name?: string;
  roles: Role[];
}

export interface LoginSession {
  phone: string;
  role: Role;
  loggedInAt: string;
}

export interface OTPResponse {
  success: boolean;
  message?: string;
}
