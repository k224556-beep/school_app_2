import { AppUser } from "../models";

const USERS: AppUser[] = [
  { phone: "03001234567", name: "User A", roles: ["Admin", "Teacher"] },
  { phone: "03005556666", name: "User B", roles: ["Teacher"] },
  { phone: "03007778888", name: "User C", roles: ["Parent"] },
  { phone: "03009990000", name: "User D", roles: ["Admin", "Parent"] },
];

export class UserRepository {
  /**
   * Find a user by phone.
   * If `REMOTE_USER_API` is set to a URL, the repository will try the remote
   * endpoint first and fall back to the local `USERS` list on failure.
   *
   * To enable remote lookup set `REMOTE_USER_API` to your API base URL.
   */
  static async findByPhone(phone: string): Promise<AppUser | null> {
    const normalized = UserRepository.normalize(phone);
    const REMOTE_USER_API = ""; // e.g. https://api.example.com — set to enable remote lookup

    if (REMOTE_USER_API) {
      try {
        const res = await fetch(`${REMOTE_USER_API.replace(/\/$/, "")}/users/${normalized}`);
        if (res.ok) {
          const data = await res.json();
          // Basic shape validation
          if (data && data.phone) return data as AppUser;
        }
      } catch (err) {
        // ignore and fall back
      }
    }

    return USERS.find((u) => u.phone === normalized) ?? null;
  }

  static normalize(phone: string) {
    return phone.replace(/\D/g, "");
  }
}

export default UserRepository;
