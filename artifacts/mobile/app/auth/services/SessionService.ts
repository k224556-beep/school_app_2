import AsyncStorage from "@react-native-async-storage/async-storage";
import { LoginSession } from "../models";

const SESSION_KEY = "@app_login_session";

let cachedSession: LoginSession | null = null;

export class SessionService {
  static async saveSession(session: LoginSession) {
    cachedSession = session;
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  static async getSession(): Promise<LoginSession | null> {
    if (cachedSession) return cachedSession;
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      cachedSession = JSON.parse(raw) as LoginSession;
      return cachedSession;
    } catch (e) {
      return null;
    }
  }

  static getSessionSync(): LoginSession | null {
    return cachedSession;
  }

  static async clearSession() {
    cachedSession = null;
    await AsyncStorage.removeItem(SESSION_KEY);
  }
}

export default SessionService;
