import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import SessionService from "./services/SessionService";
import { routeForRole } from "./routeForRole";

// Module-level flag to ensure we only clear session on first cold start
let didInit = false;

export default function AuthLoader() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Prefer the cached/in-memory session first (fast). Falls back to AsyncStorage inside getSession().
        const session = await SessionService.getSession();
        if (session) {
          // If there's a saved session, route to the appropriate area for that role.
          router.replace(routeForRole(session.role) as never);
        } else {
          // No session found — ensure storage is clean and show login.
          try {
            await SessionService.clearSession();
            // eslint-disable-next-line no-console
            console.log("AuthLoader: no session, routing to login");
          } catch (e) {
            // ignore
          }
          router.replace("/auth/login");
        }
      } catch (err) {
        // on error, route to login as a safe default
        // eslint-disable-next-line no-console
        console.warn("AuthLoader error", err);
        router.replace("/auth/login");
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  if (!checking) return null;
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
