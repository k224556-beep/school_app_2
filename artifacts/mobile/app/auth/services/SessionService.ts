import AsyncStorage from "@react-native-async-storage/async-storage";
import { LoginSession } from "../models";

const SESSION_KEY = "@app_login_session";

export class SessionService {
  static async saveSession(session: LoginSession) {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  static async getSession(): Promise<LoginSession | null> {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LoginSession;
    } catch (e) {
      return null;
    }
  }

  static async clearSession() {
    await AsyncStorage.removeItem(SESSION_KEY);
  }
}

export default SessionService;
